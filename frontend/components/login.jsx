
import { useState } from "react";
import "./Login.css";

function Login({ onLoginSuccess, onRegisterClick }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL =
    import.meta.env.VITE_DJANGO_BASE_URL ||
    "http://127.0.0.1:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username.trim() || !password) {
      setMessage("Please enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || "Invalid username or password."
        );
      }

      if (!data.access || !data.refresh) {
        throw new Error("The server did not return login tokens.");
      }

      // Save tokens using the same keys as AdminDashboard.jsx
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      // Keep compatibility with existing components that use sessionStorage
      sessionStorage.setItem("accessToken", data.access);
      sessionStorage.setItem("refreshToken", data.refresh);

      // Notify the parent component that login succeeded
      if (onLoginSuccess) {
        await onLoginSuccess(data.access);
      }
    } catch (error) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");

      setMessage(
        error.message || "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="checkout-container auth-container">
      <div className="login-heading">
        <div className="login-icon">🛍️</div>
        <h2>Welcome Back!</h2>
        <p>Sign in to your SmartCart account to continue shopping.</p>
      </div>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <label htmlFor="login-username">Username</label>
        <input
          id="login-username"
          type="text"
          placeholder="Enter your username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />

        <label htmlFor="login-password">Password</label>
        <div className="password-input-wrapper">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((previous) => !previous)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={loading}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {message && (
          <p className="error-message" role="alert">
            {message}
          </p>
        )}

        <button
          className="checkout-button login-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login to SmartCart"}
        </button>
      </form>

      <p className="auth-switch">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onRegisterClick}
          disabled={loading}
        >
          Create an account
        </button>
      </p>
    </section>
  );
}

export default Login;
