
import { useEffect, useState } from "react";
import "./orderhistory.css";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 


function OrderHistory() {
  // Keep your existing code here
}

  useEffect(() => {
    const fetchOrders = async () => {
      const token = sessionStorage.getItem("accessToken");

      if (!token) {
        setError("Please log in to view your order history.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
       "http://127.0.0.1:8000/api/orders/history/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load orders. Status: ${response.status}`
          );
        }

        const data = await response.json();

        setOrders(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.message || "Unable to load order history.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading order history...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="order-history">
      <h2>My Order History</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card">
            <h3>Order #{order.id}</h3>
            <p>Status: {order.status}</p>
            <p>Total: ₹{order.total_amount ?? order.total ?? "N/A"}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default OrderHistory;
