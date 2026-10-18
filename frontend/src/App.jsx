
import { Component, useEffect, useState } from "react";
import Checkout from "../components/Checkout";
import OrderHistory from "../components/orderhistory";
import Cart from "../components/cart";
import Login from "../components/login";
import Register from "../components/register";
import AdminDashboard from "../pages/admin dashborad";
import "./App.css";
import ProductDetails from "../components/ProductDetails";
import "../public/Banner.png";



function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authPage, setAuthPage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const BASE_URL =
    import.meta.env.VITE_DJANGO_BASE_URL ||
    "http://127.0.0.1:8000";

  // Fetch products from Django
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${BASE_URL}/api/products/`);

        if (!response.ok) {
          throw new Error("Unable to fetch products.");
        }

        const data = await response.json();

        setProducts(
          Array.isArray(data) ? data : data.results || []
        );
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [BASE_URL]);

  // Restore logged-in user
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");

    if (!token) return;

    const loadUser = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/me/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
          setCurrentUser(null);
          return;
        }

        const user = await response.json();
        setCurrentUser(user);
      } catch {
        setError("Unable to verify your login. Please try again.");
      }
    };

    loadUser();
  }, [BASE_URL]);

  // Filter products by search text
  const filteredProducts = products.filter((product) =>
    (product.name || "")
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
  );

  // Return to home
  const continueShopping = () => {
    setCurrentPage("home");
    setShowCheckout(false);
    setAuthPage("");
    setShowSuggestions(false);
    setSelectedProduct(null);
  };

  // Open product details
  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setCurrentPage("details");
    setShowCheckout(false);
    setAuthPage("");
    setShowSuggestions(false);
  };

  // Open cart
  const openCart = () => {
    setCurrentPage("cart");
    setShowCheckout(false);
    setAuthPage("");
    setShowSuggestions(false);
  };

  // Open admin dashboard
  const openAdminDashboard = () => {
    setCurrentPage("admin");
    setShowCheckout(false);
    setAuthPage("");
    setShowSuggestions(false);
  };

  // Add product to cart
  const addToCart = (product) => {
    setCart((previousCart) => {
      const existing = previousCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return previousCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...previousCart,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image || "",
          quantity: 1,
        },
      ];
    });

    setCurrentPage("cart");
    setShowCheckout(false);
    setAuthPage("");
    setShowSuggestions(false);
  };

  // Buy Now
  const buyNow = (product) => {
    if (Number(product.stock ?? 0) <= 0) return;

    setCart((previousCart) => {
      const existing = previousCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return previousCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...previousCart,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image || "",
          quantity: 1,
        },
      ];
    });

    setCurrentPage("cart");
    setShowCheckout(true);
    setAuthPage("");
    setShowSuggestions(false);
  };

  // Select a search suggestion
  const selectProduct = (product) => {
    setSearchQuery("");
    openProductDetails(product);
  };

  // Change cart quantity
  const changeQuantity = (productId, amount) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== productId)
    );
  };

  // Cart count
  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Clear cart after successful order
  const clearCart = () => {
    setCart([]);
  };

  // Login success
  const handleLoginSuccess = async (accessToken) => {
    const response = await fetch(`${BASE_URL}/api/me/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      throw new Error("Unable to load your account.");
    }

    const user = await response.json();

    setCurrentUser(user);
    setAuthPage("");
    setCurrentPage("home");
    setShowCheckout(false);
  };

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    setCurrentUser(null);
    setAuthPage("");
    setCurrentPage("home");
    setShowCheckout(false);
  };

  // Open order history
  const openOrderHistory = () => {
    setCurrentPage("orders");
    setShowCheckout(false);
    setAuthPage("");
    setShowSuggestions(false);
  };

  return (
    <div className="app">
      {/* Navbar */}
      <header className="navbar">
        <h2
          onClick={continueShopping}
          style={{ cursor: "pointer" }}
        >
          SmartCart
        </h2>

        <div className="navbar-actions">
          <button
            type="button"
            className="cart-button"
            onClick={continueShopping}
          >
            🏠 Home
          </button>

          <button
            type="button"
            className="cart-button"
            onClick={openCart}
          >
            🛒 Cart ({cartCount})
          </button>

          <button
            type="button"
            className="cart-button"
            onClick={openOrderHistory}
          >
            📦 Order History
          </button>

          {currentUser?.is_staff && (
            <button
              type="button"
              className="cart-button"
              onClick={openAdminDashboard}
            >
              ⚙️ Admin Dashboard
            </button>
          )}

          {currentUser ? (
            <>
              <span className="user-greeting">
                Hi, {currentUser.first_name || currentUser.username}
              </span>

              <button
                type="button"
                className="cart-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="cart-button"
                onClick={() => {
                  setAuthPage("login");
                  setCurrentPage("home");
                  setShowCheckout(false);
                }}
              >
                Login
              </button>

              <button
                type="button"
                className="cart-button"
                onClick={() => {
                  setAuthPage("register");
                  setCurrentPage("home");
                  setShowCheckout(false);
                }}
              >
                Register
              </button>
            </>
          )}
        </div>
      </header>

      {/* SmartCart Banner - Home Page Only */}
      {currentPage === "home" && !authPage && (
        <section className="smartcart-banner">
          <img
            src="./Banners.png"
            alt="SmartCart — Shop Smart, Live Better"
          />
        </section>
      )}

      {/* Main Content */}
      <main className="container">
        {authPage === "login" ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onRegisterClick={() => setAuthPage("register")}
          />
        ) : authPage === "register" ? (
          <Register
            onLoginClick={() => setAuthPage("login")}
          />
        ) : currentPage === "admin" ? (
          currentUser?.is_staff ? (
            <AdminDashboard />
          ) : (
            <section className="cart-box">
              <h2>Access denied</h2>
              <p>
                You must log in with a staff account to access
                the admin dashboard.
              </p>
              <button
                type="button"
                className="secondary-button"
                onClick={continueShopping}
              >
                Back to Home
              </button>
            </section>
          )
        ) : currentPage === "orders" ? (
          <OrderHistory onBack={continueShopping} />
        ) : showCheckout ? (
          <section className="cart-box">
            <button
              type="button"
              className="secondary-button"
              onClick={openCart}
            >
              ← Back to Shopping Cart
            </button>

            <Checkout
              cart={cart}
              clearCart={clearCart}
              continueShopping={continueShopping}
            />
          </section>
        ) : currentPage === "cart" ? (
          <Cart
            cart={cart}
            changeQuantity={changeQuantity}
            removeFromCart={removeFromCart}
            onContinueShopping={continueShopping}
            onCheckout={() => setShowCheckout(true)}
          />
        ) : currentPage === "details" ? (
          <ProductDetails
            product={selectedProduct}
            products={products}
            onBack={continueShopping}
            onAddToCart={addToCart}
            onBuyNow={buyNow}
            onOpenProduct={openProductDetails}
          />
        ) : (
          /* Home and Products */
          <section id="products">
            <h2>Our Products</h2>

            <div className="search-container">
              <input
                type="search"
                className="product-search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    filteredProducts.length > 0
                  ) {
                    selectProduct(filteredProducts[0]);
                  }

                  if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                aria-label="Search products"
                autoComplete="off"
              />

              {showSuggestions &&
                searchQuery.trim() !== "" && (
                  <div className="search-suggestions">
                    {filteredProducts.length > 0 ? (
                      filteredProducts
                        .slice(0, 6)
                        .map((product) => (
                          <button
                            type="button"
                            className="suggestion-item"
                            key={product.id}
                            onClick={() => selectProduct(product)}
                          >
                            <span>{product.name}</span>
                            <span>
                              ₹
                              {Number(product.price).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </button>
                        ))
                    ) : (
                      <p className="no-suggestions">
                        No matching products found.
                      </p>
                    )}
                  </div>
                )}
            </div>

            {loading && <p>Loading products...</p>}

            {error && (
              <p className="error-message">{error}</p>
            )}

            {!loading && !error && products.length === 0 && (
              <p>No products available yet.</p>
            )}

            {!loading &&
              !error &&
              products.length > 0 &&
              filteredProducts.length === 0 && (
                <p>No products match your search.</p>
              )}

            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article
                  className="product-card"
                  id={`product-${product.id}`}
                  key={product.id}
                >
                  <button
                    type="button"
                    className="product-open-button"
                    onClick={() => openProductDetails(product)}
                    aria-label={`View ${product.name} details`}
                  >
                    {product.image ? (
                      <img
                        className="product-image"
                        src={product.image}
                        alt={product.name}
                      />
                    ) : (
                      <div className="product-placeholder">
                        {product.name}
                      </div>
                    )}
                  </button>

                  <div className="product-info">
                    <h3>
                      <button
                        type="button"
                        className="product-name-button"
                        onClick={() => openProductDetails(product)}
                      >
                        {product.name}
                      </button>
                    </h3>

                    <p className="price">
                      ₹
                      {Number(product.price).toLocaleString("en-IN")}
                    </p>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {showSuggestions && (
              <button
                type="button"
                className="search-dismiss"
                aria-label="Close search suggestions"
                onClick={() => setShowSuggestions(false)}
              />
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>© 2026 SmartCart. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;