import React, { Component } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Login.css";
import "./Signup.css";

const AVATAR_COLORS = [
  "#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#d4ff57","#f97316"
];

// Wrapper to inject hooks into class component
function Signup(props) {
  const { login } = useAuth();
  const navigate  = useNavigate();
  return <SignupClass login={login} navigate={navigate} {...props} />;
}

class SignupClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        name: "",
        email: "",
        password: "",
        confirm: "",
        avatar_color: AVATAR_COLORS[0],
      },
      error: "",
      loading: false,
    };
    this.handleChange      = this.handleChange.bind(this);
    this.handleSubmit      = this.handleSubmit.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
  }

  handleChange(e) {
    this.setState((prev) => ({
      form: { ...prev.form, [e.target.name]: e.target.value },
    }));
  }

  handleColorChange(color) {
    this.setState((prev) => ({
      form: { ...prev.form, avatar_color: color },
    }));
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setState({ error: "" });

    const { form } = this.state;

    if (form.password !== form.confirm) {
      return this.setState({ error: "Passwords don't match." });
    }
    if (form.password.length < 6) {
      return this.setState({ error: "Password must be at least 6 characters." });
    }

    this.setState({ loading: true });
    try {
      const { data } = await api.post("/auth/signup", {
        name:         form.name,
        email:        form.email,
        password:     form.password,
        avatar_color: form.avatar_color,
      });
      this.props.login(data.user, data.token);
      this.props.navigate("/dashboard");
    } catch (err) {
      this.setState({ error: err.response?.data?.message || "Signup failed. Try again." });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { form, error, loading } = this.state;

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

            <form onSubmit={this.handleSubmit} className="auth-form">
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
                      onClick={() => this.handleColorChange(c)}
                    />
                  ))}
                  <span className="color-preview" style={{ background: form.avatar_color }}>
                    {form.name ? form.name[0].toUpperCase() : "?"}
                  </span>
                </div>
              </div>

              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name" type="text" name="name"
                  placeholder="Arjun Sharma"
                  value={form.name}
                  onChange={this.handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email" type="email" name="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={this.handleChange}
                  required
                />
              </div>

              <div className="two-col">
                <div className="field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password" type="password" name="password"
                    placeholder="Min. 6 chars"
                    value={form.password}
                    onChange={this.handleChange}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="confirm">Confirm</label>
                  <input
                    id="confirm" type="password" name="confirm"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={this.handleChange}
                    required
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
}

export default Signup;
