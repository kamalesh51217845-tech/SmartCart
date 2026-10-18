
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.db.models.deletion import ProtectedError
from django.shortcuts import get_object_or_404

from rest_framework.permissions import IsAdminUser

from django.db import transaction
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Category, Product, Order, OrderItem
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    OrderSerializer,
    RegisterSerializer,
)


# Get all products
@api_view(["GET"])
@permission_classes([AllowAny])
def get_products(request):
    products = Product.objects.all().order_by("-created_at")
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


# Get all categories
@api_view(["GET"])
@permission_classes([AllowAny])
def get_categories(request):
    categories = Category.objects.all().order_by("name")
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


# Get one product by ID
@api_view(["GET"])
@permission_classes([AllowAny])
def get_product_detail(request, product_id):
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = ProductSerializer(product)
    return Response(serializer.data)


# Get related products from the same category
@api_view(["GET"])
@permission_classes([AllowAny])
def get_related_products(request, product_id):
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if product.category_id is None:
        return Response([])

    related_products = (
        Product.objects.filter(category_id=product.category_id)
        .exclude(pk=product.pk)
        .order_by("-created_at")[:8]
    )

    serializer = ProductSerializer(related_products, many=True)
    return Response(serializer.data)


# Create an order (authenticated customers only)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order(request):
    customer_name = request.data.get("customer_name", "")
    phone = request.data.get("phone", "")
    address = request.data.get("address", "")
    items = request.data.get("items", [])

    if not all(
        isinstance(value, str) and value.strip()
        for value in (customer_name, phone, address)
    ):
        return Response(
            {"error": "Name, phone, and address are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    customer_name = customer_name.strip()
    phone = phone.strip()
    address = address.strip()

    if not isinstance(items, list) or not items:
        return Response(
            {"error": "Your cart is empty or invalid."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        with transaction.atomic():
            total = Decimal("0.00")
            order_items = []

            for item in items:
                if not isinstance(item, dict):
                    raise ValueError("Invalid cart item.")

                product_id = item.get("product_id")
                quantity = item.get("quantity")

                if (
                    isinstance(quantity, bool)
                    or not isinstance(quantity, int)
                    or quantity <= 0
                ):
                    raise ValueError(
                        "Quantity must be a positive integer."
                    )

                if product_id is None:
                    raise ValueError("Product ID is required.")

                product = Product.objects.select_for_update().get(
                    pk=product_id
                )

                if quantity > product.stock:
                    raise ValueError(
                        f"Insufficient stock for {product.name}."
                    )

                # Always calculate prices using database values.
                price = Decimal(str(product.price))
                total += price * quantity
                order_items.append((product, quantity, price))

            order = Order.objects.create(
                user=request.user,
                customer_name=customer_name,
                phone=phone,
                address=address,
                total_amount=total,
            )

            for product, quantity, price in order_items:
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=price,
                )

                product.stock -= quantity
                product.save(update_fields=["stock"])

    except Product.DoesNotExist:
        return Response(
            {"error": "One or more products do not exist."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except (ValueError, TypeError) as exc:
        return Response(
            {"error": str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        OrderSerializer(order).data,
        status=status.HTTP_201_CREATED,
    )


# Get order history for the logged-in customer
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_orders(request):
    orders = (
        Order.objects.filter(user=request.user)
        .order_by("-created_at")
    )

    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


# Register a new customer
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        return Response(
            {
                "message": "Registration successful.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "email": user.email,
                },
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


# Get the currently authenticated user's information
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "email": user.email,
            "is_staff": user.is_staff,
        }
    )

# ---------------- ADMIN DASHBOARD ----------------

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    User = get_user_model()

    total_products = Product.objects.count()
    total_orders = Order.objects.count()
    total_users = User.objects.count()

    confirmed_sales = (
        Order.objects.filter(status="CONFIRMED")
        .aggregate(total=Sum("total_amount"))["total"]
    )

    return Response({
        "total_products": total_products,
        "total_orders": total_orders,
        "total_users": total_users,
        "confirmed_sales": confirmed_sales or 0,
    })


# ---------------- ADMIN PRODUCT LIST / CREATE ----------------

@api_view(["GET", "POST"])
@permission_classes([IsAdminUser])
def admin_products(request):
    if request.method == "GET":
        products = Product.objects.all().order_by("-created_at")
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    serializer = ProductSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------- ADMIN PRODUCT UPDATE / DELETE ----------------

@api_view(["GET", "PATCH", "PUT", "DELETE"])
@permission_classes([IsAdminUser])
def admin_product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    if request.method == "GET":
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    if request.method in ["PATCH", "PUT"]:
        serializer = ProductSerializer(
            product,
            data=request.data,
            partial=(request.method == "PATCH"),
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        product.delete()
    except ProtectedError:
        return Response(
            {
                "error": (
                    "This product belongs to an existing order "
                    "and cannot be deleted."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------- ADMIN VIEW ALL ORDERS ----------------

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_orders(request):
    orders = Order.objects.all().order_by("-created_at")
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


# ---------------- ADMIN UPDATE ORDER STATUS ----------------

@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def admin_update_order_status(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    new_status = request.data.get("status")

    allowed_statuses = [
        choice[0] for choice in Order.STATUS_CHOICES
    ]

    if new_status not in allowed_statuses:
        return Response(
            {
                "error": "Invalid order status.",
                "allowed_statuses": allowed_statuses,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    order.status = new_status
    order.save(update_fields=["status"])

    serializer = OrderSerializer(order)
    return Response(serializer.data)
