import React, { Component } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Dashboard.css";

// ── Sub-components (kept as functions since they have no state) ──

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`stat-card ${accent ? "stat-card--accent" : ""}`}>
      <span className="stat-card__value">{value ?? "—"}</span>
      <span className="stat-card__label">{label}</span>
      {sub && <span className="stat-card__sub">{sub}</span>}
    </div>
  );
}

function StatusBar({ todo, inprogress, done }) {
  const total = todo + inprogress + done || 1;
  return (
    <div className="status-bar">
      <div className="status-bar__track">
        <div className="status-bar__seg seg-todo"     style={{ width: `${(todo / total) * 100}%` }} />
        <div className="status-bar__seg seg-progress" style={{ width: `${(inprogress / total) * 100}%` }} />
        <div className="status-bar__seg seg-done"     style={{ width: `${(done / total) * 100}%` }} />
      </div>
      <div className="status-bar__legend">
        <span><i className="dot dot-todo" />To Do ({todo})</span>
        <span><i className="dot dot-progress" />In Progress ({inprogress})</span>
        <span><i className="dot dot-done" />Done ({done})</span>
      </div>
    </div>
  );
}

// Wrapper to inject hooks
function Dashboard(props) {
  const { user } = useAuth();
  return <DashboardClass user={user} {...props} />;
}

class DashboardClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stats:   null,
      loading: true,
      error:   "",
    };
  }

  componentDidMount() {
    api.get("/dashboard")
      .then((r) => this.setState({ stats: r.data }))
      .catch(() => this.setState({ error: "Failed to load dashboard." }))
      .finally(() => this.setState({ loading: false }));
  }

  greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  render() {
    const { user }            = this.props;
    const { stats, loading, error } = this.state;

    return (
      <div className="dashboard page-enter">
        <div className="dash-header">
          <div>
            <p className="dash-greeting">{this.greeting()},</p>
            <h1 className="dash-name">{user?.name?.split(" ")[0]} 👋</h1>
          </div>
          <Link to="/projects" className="btn-accent">+ New Project</Link>
        </div>

        {loading ? (
          <div className="dash-loading">
            <span className="spinner" style={{ borderTopColor: "var(--accent)" }} />
          </div>
        ) : error ? (
          <div className="auth-error">{error}</div>
        ) : (
          <>
            <div className="stat-grid">
              <StatCard label="Total Tasks" value={stats?.totalTasks} accent />
              <StatCard label="Completed"   value={stats?.done}       sub="tasks done" />
              <StatCard label="In Progress" value={stats?.inProgress} sub="tasks active" />
              <StatCard label="Overdue"     value={stats?.overdue}    sub="need attention" />
            </div>

            <section className="dash-section">
              <h2 className="section-title">Task Breakdown</h2>
              <div className="dash-card">
                <StatusBar
                  todo={stats?.todo || 0}
                  inprogress={stats?.inProgress || 0}
                  done={stats?.done || 0}
                />
              </div>
            </section>

            {stats?.perUser?.length > 0 && (
              <section className="dash-section">
                <h2 className="section-title">Team Workload</h2>
                <div className="dash-card">
                  <div className="user-workload">
                    {stats.perUser.map((u) => (
                      <div key={u.id} className="workload-row">
                        <span className="workload-avatar" style={{ background: u.avatar_color }}>
                          {u.name[0].toUpperCase()}
                        </span>
                        <span className="workload-name">{u.name}</span>
                        <div className="workload-bar-wrap">
                          <div
                            className="workload-bar"
                            style={{ width: `${Math.min((u.task_count / (stats.totalTasks || 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="workload-count">{u.task_count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {stats?.overdueTasks?.length > 0 && (
              <section className="dash-section">
                <h2 className="section-title">⚠ Overdue Tasks</h2>
                <div className="dash-card overdue-list">
                  {stats.overdueTasks.map((t) => (
                    <div key={t.id} className="overdue-item">
                      <div>
                        <p className="overdue-title">{t.title}</p>
                        <p className="overdue-meta">
                          {t.project_name} · Due {new Date(t.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`priority-badge priority-${t.priority}`}>{t.priority}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    );
  }
}

export default Dashboard;
