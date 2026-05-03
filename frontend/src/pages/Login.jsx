import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Left decorative panel */}
      <div className="auth-panel">
        <div className="auth-panel__logo">TaskFlow</div>
        <div className="auth-panel__copy">
          <h1>Ship work,<br />not chaos.</h1>
          <p>Coordinate your team's tasks in one place — no spreadsheets, no noise.</p>
        </div>
        <div className="auth-panel__grid" aria-hidden="true">
          {Array.from({ length: 48 }).map((_, i) => (
            <span key={i} className="grid-dot" />
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-wrap page-enter">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your workspace</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            No account? <Link to="/signup">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}