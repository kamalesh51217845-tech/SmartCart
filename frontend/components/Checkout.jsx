
import { useState } from "react";

function Checkout({ cart, clearCart, continueShopping }) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const BASE_URL =
    import.meta.env.VITE_DJANGO_BASE_URL ||
    "http://127.0.0.1:8000";

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getErrorMessage = (data, status) => {
    if (data?.error) return data.error;
    if (data?.detail) return data.detail;

    if (data && typeof data === "object") {
      return Object.entries(data)
        .map(([key, value]) => {
          const text = Array.isArray(value)
            ? value.join(", ")
            : typeof value === "object" && value !== null
            ? JSON.stringify(value)
            : String(value);

          return `${key}: ${text}`;
        })
        .join(" | ");
    }

    return `Unable to place your order (HTTP ${status}).`;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setMessage("");

    const token = sessionStorage.getItem("accessToken");

    if (!token) {
      setMessage("Please log in before placing your order.");
      return;
    }

    if (!cart || cart.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    if (!customerName.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!address.trim()) {
      setMessage("Please enter your delivery address.");
      return;
    }

    // Online payment requires a configured and verified gateway.
    if (paymentMethod !== "COD") {
      setMessage(
        "Online payment is not available yet. Please choose Cash on Delivery."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          payment_method: paymentMethod,
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("Order API failed:", {
          status: response.status,
          response: data,
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Your login session is invalid or expired. Please log in again."
          );
        }

        throw new Error(
          getErrorMessage(data, response.status) ||
            `Order failed (HTTP ${response.status}).`
        );
      }

      if (!data.id) {
        console.error("Unexpected order response:", data);
        throw new Error(
          "The server responded, but no order ID was returned. Check your Django OrderSerializer."
        );
      }

      setOrderId(data.id);
      setMessage("Your order has been placed successfully.");
      setOrderSuccess(true);

      clearCart();
      setCustomerName("");
      setPhone("");
      setAddress("");
      setPaymentMethod("COD");
    } catch (error) {
      console.error("Place order error:", error);

      setMessage(
        error instanceof TypeError
          ? "Cannot connect to Django. Check that the backend server is running and the API URL is correct."
          : error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const total = (cart || []).reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  if (orderSuccess) {
    return (
      <div className="checkout-container order-success">
        <h2>🎉 Order Placed Successfully!</h2>

        <p>{message}</p>

        {orderId !== null && (
          <p>
            <strong>Order ID:</strong> #{orderId}
          </p>
        )}

        <p>
          <strong>Payment Method:</strong> Cash on Delivery
        </p>

        <p>Thank you for shopping with SmartCart.</p>

        <button
          type="button"
          className="checkout-button"
          onClick={continueShopping}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      <p>Complete your delivery details to place your order.</p>

      {!cart || cart.length === 0 ? (
        <p>Your cart is empty. Add products before checkout.</p>
      ) : (
        <>
          <div className="checkout-order-summary">
            <h3>Order Summary</h3>

            {cart.map((item) => (
              <div className="checkout-order-item" key={item.id}>
                <span>
                  {item.name} × {item.quantity}
                </span>

                <span>
                  {formatPrice(
                    Number(item.price || 0) *
                      Number(item.quantity || 0)
                  )}
                </span>
              </div>
            ))}

            <div className="checkout-total">
              <strong>Total</strong>
              <strong>{formatPrice(total)}</strong>
            </div>
          </div>

          <form onSubmit={placeOrder} className="checkout-form">
            <label htmlFor="customer-name">Full name</label>

            <input
              id="customer-name"
              type="text"
              placeholder="Enter your full name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              autoComplete="name"
              maxLength={100}
              required
              disabled={loading}
            />

            <label htmlFor="customer-phone">Phone number</label>

            <input
              id="customer-phone"
              type="tel"
              placeholder="Enter your 10-digit phone number"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value.replace(/\D/g, "").slice(0, 10)
                )
              }
              autoComplete="tel"
              inputMode="numeric"
              maxLength={10}
              pattern="[0-9]{10}"
              required
              disabled={loading}
            />

            <label htmlFor="delivery-address">
              Delivery address
            </label>

            <textarea
              id="delivery-address"
              placeholder="Enter your complete delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
              rows={4}
              maxLength={500}
              required
              disabled={loading}
            />

            <fieldset className="payment-methods" disabled={loading}>
              <legend>Choose Payment Method</legend>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />
                <span>
                  <strong>Cash on Delivery</strong>
                  <small>Pay when your order arrives</small>
                </span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={paymentMethod === "UPI"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />
                <span>
                  <strong>UPI</strong>
                  <small>Online payment not activated</small>
                </span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={paymentMethod === "CARD"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />
                <span>
                  <strong>Debit / Credit Card</strong>
                  <small>Online payment not activated</small>
                </span>
              </label>
            </fieldset>

            {paymentMethod !== "COD" && (
              <p className="payment-notice" role="status">
                Online payments are not available yet. Choose Cash
                on Delivery to place your order.
              </p>
            )}

            {message && (
              <p
                className="error-message"
                role="alert"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              className="checkout-button"
              disabled={loading || cart.length === 0}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default Checkout;
