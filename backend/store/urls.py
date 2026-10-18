
from django.urls import path
from . import views

urlpatterns = [
    # Customer APIs
    path("products/", views.get_products, name="products"),
    path(
        "products/<int:product_id>/",
        views.get_product_detail,
        name="product-detail",
    ),
    path(
        "products/<int:product_id>/related/",
        views.get_related_products,
        name="related-products",
    ),
    path("categories/", views.get_categories, name="categories"),
    path("orders/", views.create_order, name="create-order"),
    path("orders/history/", views.get_orders, name="order-history"),
    path("register/", views.register_user, name="register"),
    path("me/", views.current_user, name="current-user"),

    # Admin APIs
    path(
        "admin/dashboard/",
        views.admin_dashboard,
        name="admin-dashboard",
    ),
    path(
        "admin/products/",
        views.admin_products,
        name="admin-products",
    ),
    path(
        "admin/products/<int:product_id>/",
        views.admin_product_detail,
        name="admin-product-detail",
    ),
    path(
        "admin/orders/",
        views.admin_orders,
        name="admin-orders",
    ),
    path(
        "admin/orders/<int:order_id>/status/",
        views.admin_update_order_status,
        name="admin-update-order-status",
    ),
]
