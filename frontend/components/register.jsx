
import { useState } from "react";

function Register({ onLoginClick }) {
  const [form, setForm] = useState({
    first_name: "",
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL =
    import.meta.env.VITE_DJANGO_BASE_URL ||
    "http://127.0.0.1:8000";

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        const errors = Object.values(data)
          .flat()
          .join(" ");
        throw new Error(errors || "Registration failed.");
      }

      setMessage("Account created successfully. Please log in.");
      setForm({
        first_name: "",
        username: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setMessage(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="checkout-container auth-container">
      <h2>Create SmartCart Account</h2>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <input
          name="first_name"
          placeholder="Full name"
          value={form.first_name}
          onChange={handleChange}
          required
        />

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password (at least 8 characters)"
          value={form.password}
          onChange={handleChange}
          minLength={8}
          autoComplete="new-password"
          required
        />

        <button
          className="checkout-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}

      <p>
        Already registered?{" "}
        <button type="button" onClick={onLoginClick}>
          Login
        </button>
      </p>
    </section>
  );
}

export default Register;
