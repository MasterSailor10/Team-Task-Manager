import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Login.css"; // shared auth styles
import "./Signup.css";

const AVATAR_COLORS = [
  "#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#d4ff57","#f97316"
];

export default function Signup() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "",
    avatar_color: AVATAR_COLORS[0],
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      return setError("Passwords don't match.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        avatar_color: form.avatar_color,
      });
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Left panel */}
      <div className="auth-panel">
        <div className="auth-panel__logo">TaskFlow</div>
        <div className="auth-panel__copy">
          <h1>Your team,<br />one workspace.</h1>
          <p>Create an account and start collaborating in under a minute.</p>
        </div>
        <div className="auth-panel__grid" aria-hidden="true">
          {Array.from({ length: 48 }).map((_, i) => (
            <span key={i} className="grid-dot" />
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="auth-form-wrap page-enter">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h2>Create account</h2>
            <p>Fill in the details to get started</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Avatar color picker */}
            <div className="field">
              <label>Pick a colour</label>
              <div className="color-picker">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-dot ${form.avatar_color === c ? "selected" : ""}`}
                    style={{ background: c }}
                    onClick={() => setForm((f) => ({ ...f, avatar_color: c }))}
                  />
                ))}
                <span
                  className="color-preview"
                  style={{ background: form.avatar_color }}
                >
                  {form.name ? form.name[0].toUpperCase() : "?"}
                </span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name" type="text" name="name"
                placeholder="Arjun Sharma"
                value={form.name} onChange={handleChange} required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email" type="email" name="email"
                placeholder="you@company.com"
                value={form.email} onChange={handleChange} required
              />
            </div>

            <div className="two-col">
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password" type="password" name="password"
                  placeholder="Min. 6 chars"
                  value={form.password} onChange={handleChange} required
                />
              </div>
              <div className="field">
                <label htmlFor="confirm">Confirm</label>
                <input
                  id="confirm" type="password" name="confirm"
                  placeholder="••••••••"
                  value={form.confirm} onChange={handleChange} required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}