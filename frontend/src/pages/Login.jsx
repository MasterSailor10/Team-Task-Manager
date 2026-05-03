import React, { Component } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Login.css";

// Class components can't use hooks directly so we wrap with a function
function Login(props) {
  const { login } = useAuth();
  const navigate  = useNavigate();
  return <LoginClass login={login} navigate={navigate} {...props} />;
}

class LoginClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: { email: "", password: "" },
      error: "",
      loading: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState((prev) => ({
      form: { ...prev.form, [e.target.name]: e.target.value },
    }));
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setState({ error: "", loading: true });
    try {
      const { data } = await api.post("/auth/login", this.state.form);
      this.props.login(data.user, data.token);
      this.props.navigate("/dashboard");
    } catch (err) {
      this.setState({ error: err.response?.data?.message || "Login failed. Try again." });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { form, error, loading } = this.state;

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

            <form onSubmit={this.handleSubmit} className="auth-form">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={this.handleChange}
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
                  onChange={this.handleChange}
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
}

export default Login;
