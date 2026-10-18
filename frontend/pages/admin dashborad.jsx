
import { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API = (
  import.meta.env.VITE_DJANGO_BASE_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

export default function AdminDashboard() {
  const [page, setPage] = useState("Dashboard");
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function api(path, options = {}) {
    const token = localStorage.getItem("access");

    const response = await fetch(`${API}/api/${path}`, {
      ...options,
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.detail || JSON.stringify(data) || "Request failed"
      );
    }

    return data;
  }

  async function loadPage(selectedPage = page) {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      if (selectedPage === "Dashboard") {
        setStats(await api("admin/dashboard/"));
      } else if (selectedPage === "Products") {
        const data = await api("admin/products/");
        setProducts(Array.isArray(data) ? data : data.results || []);
      } else if (selectedPage === "Orders") {
        const data = await api("admin/orders/");
        setOrders(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage(page);
  }, [page]);

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api(`admin/products/${id}/`, {
        method: "DELETE",
      });

      setNotice("Product deleted successfully.");
      await loadPage("Products");
    } catch (err) {
      setError(err.message);
    }
  }

  async function changeOrderStatus(id, status) {
    try {
      await api(`admin/orders/${id}/status/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setNotice("Order status updated.");
      await loadPage("Orders");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="sc-admin">
      <aside className="sc-sidebar">
        <h2>
          SmartCart<span>.</span>
        </h2>

        <p className="sc-label">ADMIN PANEL</p>

        {["Dashboard", "Products", "Orders"].map((item) => (
          <button
            key={item}
            className={
              page === item ? "sc-nav active" : "sc-nav"
            }
            onClick={() => setPage(item)}
          >
            {item === "Dashboard"
              ? "▦"
              : item === "Products"
                ? "□"
                : "▤"}
            <span>{item}</span>
          </button>
        ))}

        <div className="sc-sidebar-bottom">
          <button
            className="sc-nav"
            onClick={() => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              sessionStorage.removeItem("accessToken");
              sessionStorage.removeItem("refreshToken");
              window.location.href = "/";
            }}
          >
            ↪ <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="sc-main">
        <header className="sc-topbar">
          <div>
            <p className="sc-muted">Store management</p>
            <h1>{page}</h1>
          </div>

          <button
            className="sc-refresh"
            onClick={() => loadPage(page)}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </header>

        {error && (
          <div className="sc-error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="sc-notice" role="status">
            {notice}
          </div>
        )}

        {loading ? (
          <p>Loading {page.toLowerCase()}...</p>
        ) : (
          <>
            {/* DASHBOARD */}
            {page === "Dashboard" && (
              <>
                <div className="sc-welcome">
                  <div>
                    <h2>Welcome to SmartCart 👋</h2>
                    <p>
                      Here is what's happening with your store today.
                    </p>
                  </div>
                  <span className="sc-store-icon">🛍️</span>
                </div>

                <div className="sc-stat-grid">
                  <Stat
                    title="Total Products"
                    value={stats.total_products ?? 0}
                    icon="📦"
                  />

                  <Stat
                    title="Total Orders"
                    value={stats.total_orders ?? 0}
                    icon="🧾"
                  />

                  <Stat
                    title="Total Users"
                    value={stats.total_users ?? 0}
                    icon="👥"
                  />

                  <Stat
                    title="Confirmed Sales"
                    value={`₹${Number(
                      stats.confirmed_sales ?? 0
                    ).toLocaleString("en-IN")}`}
                    icon="₹"
                  />
                </div>

                <section className="sc-panel">
                  <h2>Quick actions</h2>
                  <p>Manage your store from one place.</p>

                  <div className="sc-actions">
                    <button onClick={() => setPage("Products")}>
                      Manage products →
                    </button>

                    <button onClick={() => setPage("Orders")}>
                      Manage orders →
                    </button>
                  </div>
                </section>
              </>
            )}

            {/* PRODUCTS */}
            {page === "Products" && (
              <>
                <section className="sc-panel">
                  <div className="sc-panel-heading">
                    <div>
                      <h2>Products</h2>
                      <p>
                        Products currently available through your admin API.
                      </p>
                    </div>

                    <span>{products.length} items</span>
                  </div>

                  <div className="sc-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td>#{product.id}</td>

                            <td>
                              {product.name ||
                                product.title ||
                                "Product"}
                            </td>

                            <td>₹{product.price ?? "—"}</td>

                            <td>
                              <button
                                className="sc-delete"
                                onClick={() =>
                                  deleteProduct(product.id)
                                }
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}

                        {products.length === 0 && (
                          <tr>
                            <td colSpan="4">
                              No products found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <AddProductForm
                  onProductAdded={async () => {
                    await loadPage("Products");
                    setNotice("Product added successfully.");
                  }}
                />
              </>
            )}

            {/* ORDERS */}
            {page === "Orders" && (
              <section className="sc-panel">
                <div className="sc-panel-heading">
                  <div>
                    <h2>Orders</h2>
                    <p>
                      Review orders and update their status.
                    </p>
                  </div>

                  <span>{orders.length} orders</span>
                </div>

                <div className="sc-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Update status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>

                          <td>
                            {order.username ||
                              order.customer_name ||
                              order.customer ||
                              "Customer"}
                          </td>

                          <td>
                            ₹{order.total_amount ??
                              order.total ??
                              order.amount ??
                              "—"}
                          </td>

                          <td>
                            <span className="sc-status">
                              {order.status}
                            </span>
                          </td>

                          <td>
                            <select
                              value={order.status || ""}
                              onChange={(event) =>
                                changeOrderStatus(
                                  order.id,
                                  event.target.value
                                )
                              }
                            >
                              {(order.status === "PENDING"
                                ? [
                                    "PENDING",
                                    "CONFIRMED",
                                    "CANCELLED",
                                  ]
                                : [
                                    "PENDING",
                                    "CONFIRMED",
                                    "SHIPPED",
                                    "DELIVERED",
                                    "CANCELLED",
                                  ]
                              ).map((status) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}

                      {orders.length === 0 && (
                        <tr>
                          <td colSpan="5">No orders found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ title, value, icon }) {
  return (
    <article className="sc-stat">
      <div className="sc-stat-top">
        <span>{title}</span>
        <span className="sc-stat-icon">{icon}</span>
      </div>

      <strong>{value}</strong>
    </article>
  );
}

/* ADD PRODUCT FORM */

function AddProductForm({ onProductAdded }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    image: "",
  });

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(`${API}/api/categories/`);

        if (!response.ok) {
          throw new Error("Could not load categories.");
        }

        const data = await response.json();

        setCategories(
          Array.isArray(data) ? data : data.results || []
        );
      } catch (err) {
        setMessage(err.message);
      }
    }

    loadCategories();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const token =
      localStorage.getItem("access") ||
      sessionStorage.getItem("accessToken");

    if (!token) {
      setMessage("Please log in with your admin account.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API}/api/admin/products/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          price: form.price,
          stock: Number(form.stock),
          category: form.category
            ? Number(form.category)
            : null,
          image: form.image.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || JSON.stringify(data) || "Could not add product."
        );
      }

      setForm({
        name: "",
        price: "",
        stock: "",
        category: "",
        image: "",
      });

      setMessage("Product added successfully!");

      if (onProductAdded) {
        await onProductAdded(data);
      }
    } catch (err) {
      setMessage(`Unable to add product: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="add-product-form">
      <h2>Add New Product</h2>
      <p className="add-product-description">
        Enter the product details to add an item to your store.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="product-name">Product Name</label>
        <input
          id="product-name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          maxLength={200}
          placeholder="Enter product name"
        />

        <label htmlFor="product-price">Price (₹)</label>
        <input
          id="product-price"
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          required
          placeholder="Enter price"
        />

        <label htmlFor="product-stock">Stock Quantity</label>
        <input
          id="product-stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          value={form.stock}
          onChange={handleChange}
          required
          placeholder="Enter stock quantity"
        />

        <label htmlFor="product-category">Category</label>
        <select
          id="product-category"
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          <option value="">No category</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <label htmlFor="product-image">Image URL</label>
        <input
          id="product-image"
          name="image"
          type="url"
          value={form.image}
          onChange={handleChange}
          placeholder="https://example.com/product.jpg"
        />

        {form.image && (
          <img
            className="add-product-preview"
            src={form.image}
            alt="Product preview"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
            onLoad={(event) => {
              event.currentTarget.style.display = "block";
            }}
          />
        )}

        <button
          className="add-product-button"
          type="submit"
          disabled={saving}
        >
          {saving ? "Adding Product..." : "+ Add Product"}
        </button>

        {message && (
          <p
            className="add-product-message"
            role="status"
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
