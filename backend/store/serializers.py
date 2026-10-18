
from rest_framework import serializers
from .models import Category, Product, Order, OrderItem
from django.contrib.auth.models import User
from rest_framework import serializers


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "quantity",
            "price",
        ]
        read_only_fields = ["price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "phone",
            "address",
            "total_amount",
            "status",
            "created_at",
            "items",
        ]
        read_only_fields = [
            "id",
            "total_amount",
            "status",
            "created_at",
            "items",
        ]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "email",
            "password",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user