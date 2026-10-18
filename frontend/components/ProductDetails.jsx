
function ProductDetails({
  product,
  products,
  onBack,
  onAddToCart,
  onBuyNow,
  onOpenProduct,
}) {
  if (!product) {
    return (
      <section className="product-details">
        <h2>Product not found</h2>
        <button className="secondary-button" onClick={onBack}>
          Back to Products
        </button>
      </section>
    );
  }

  const relatedProducts = products
    .filter((item) => {
      if (item.id === product.id) return false;

      // Match products using their category ID when available.
      if (product.category && item.category) {
        const currentCategory =
          typeof product.category === "object"
            ? product.category.id
            : product.category;

        const itemCategory =
          typeof item.category === "object"
            ? item.category.id
            : item.category;

        return String(currentCategory) === String(itemCategory);
      }

      // Fallback if the API returns category names.
      return (
        product.category_name &&
        item.category_name === product.category_name
      );
    })
    .slice(0, 4);

  return (
    <section className="product-details">
      <button
        type="button"
        className="secondary-button"
        onClick={onBack}
      >
        ← Back to Products
      </button>

      <div className="product-details-layout">
        <div className="product-details-image">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="product-placeholder">
              {product.name}
            </div>
          )}
        </div>

        <div className="product-details-info">
          <h1>{product.name}</h1>

          <p className="details-price">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </p>

          <p>
            {product.description ||
              "Discover this product from SmartCart."}
          </p>

          <p>
            <strong>Stock:</strong>{" "}
            {Number(product.stock ?? 0) > 0
              ? `${product.stock} available`
              : "Out of stock"}
          </p>

          <div className="details-actions">
            <button
              type="button"
              className="primary-button"
              disabled={Number(product.stock ?? 0) <= 0}
              onClick={() => onAddToCart(product)}
            >
              Add to Cart
            </button>

            <button
              type="button"
              className="buy-now-button"
              disabled={Number(product.stock ?? 0) <= 0}
              onClick={() => onBuyNow(product)}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <div className="related-products">
        <h2>Related Products</h2>

        {relatedProducts.length > 0 ? (
          <div className="product-grid">
            {relatedProducts.map((item) => (
              <article
                className="product-card"
                key={item.id}
              >
                <button
                  type="button"
                  className="related-product-open"
                  onClick={() => onOpenProduct(item)}
                  aria-label={`View ${item.name} details`}
                >
                  {item.image ? (
                    <img
                      className="product-image"
                      src={item.image}
                      alt={item.name}
                    />
                  ) : (
                    <div className="product-placeholder">
                      {item.name}
                    </div>
                  )}

                  <div className="product-info">
                    <h3>{item.name}</h3>
                    <p className="price">
                      ₹
                      {Number(item.price).toLocaleString("en-IN")}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className="primary-button"
                  disabled={Number(item.stock ?? 0) <= 0}
                  onClick={() => onAddToCart(item)}
                >
                  Add to Cart
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p>No related products found in this category yet.</p>
        )}
      </div>
    </section>
  );
}

export default ProductDetails;
