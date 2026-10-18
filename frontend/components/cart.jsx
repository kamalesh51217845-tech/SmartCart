
function Cart({
  cart,
  changeQuantity,
  removeFromCart,
  onContinueShopping,
  onCheckout,
}) {
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  return (
    <section className="cart-box">
      <h2>My Shopping Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <div>
                <h3>{item.name}</h3>

                <p>
                  Price: ₹{Number(item.price).toFixed(2)}
                </p>

                <p>
                  Subtotal: ₹
                  {(Number(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>

              <div className="quantity-controls">
                <button
                  type="button"
                  onClick={() => changeQuantity(item.id, -1)}
                >
                  −
                </button>

                <span>{item.quantity}</span>

                <button
                  type="button"
                  onClick={() => changeQuantity(item.id, 1)}
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <h3>Total: ₹{total.toFixed(2)}</h3>

          <button
            type="button"
            className="primary-button"
            onClick={onCheckout}
          >
            Place Order
          </button>
        </>
      )}

      <button
        type="button"
        className="secondary-button"
        onClick={onContinueShopping}
      >
        Continue Shopping
      </button>
    </section>
  );
}

export default Cart;
