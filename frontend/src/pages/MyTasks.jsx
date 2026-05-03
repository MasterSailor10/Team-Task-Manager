import React, { Component } from "react";
import api from "../api/axios";
import "./MyTasks.css";

const STATUS_OPTIONS = ["all", "todo", "inprogress", "done"];
const STATUS_LABEL   = { all: "All", todo: "To Do", inprogress: "In Progress", done: "Done" };

class MyTasks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks:    [],
      filter:   "all",
      loading:  true,
      updating: null,
      error:    "",
    };
    this.load               = this.load.bind(this);
    this.handleStatusChange = this.handleStatusChange.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  load() {
    this.setState({ loading: true });
    api.get("/tasks/mine")
      .then((r) => this.setState({ tasks: r.data }))
      .catch(() => this.setState({ error: "Failed to load tasks." }))
      .finally(() => this.setState({ loading: false }));
  }

  async handleStatusChange(taskId, newStatus) {
    this.setState({ updating: taskId });
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      this.setState((prev) => ({
        tasks: prev.tasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        ),
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      this.setState({ updating: null });
    }
  }

  isOverdue(t) {
    return t.due_date && t.status !== "done" && new Date(t.due_date) < new Date();
  }

  render() {
    const { tasks, filter, loading, updating, error } = this.state;

    const filtered = filter === "all"
      ? tasks
      : tasks.filter((t) => t.status === filter);

    return (
      <div className="my-tasks page-enter">
        <div className="my-tasks-header">
          <div>
            <h1>My Tasks</h1>
            <p className="my-tasks-sub">Everything assigned to you</p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="filter-pills">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              className={`filter-pill ${filter === s ? "active" : ""}`}
              onClick={() => this.setState({ filter: s })}
            >
              {STATUS_LABEL[s]}
              <span className="pill-count">
                {s === "all" ? tasks.length : tasks.filter((t) => t.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="my-tasks-loading">
            <span className="spinner" style={{ borderTopColor: "var(--accent)" }} />
          </div>
        ) : error ? (
          <div className="auth-error">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="my-tasks-empty">
            <p>No tasks here</p>
            <span>You're all caught up ✓</span>
          </div>
        ) : (
          <div className="tasks-list">
            {filtered.map((t) => (
              <div
                key={t.id}
                className={`task-row ${this.isOverdue(t) ? "task-row--overdue" : ""}`}
              >
                <div className="task-row__left">
                  <div className="task-row__info">
                    <span className="task-row__project">{t.project_name}</span>
                    <p className="task-row__title">{t.title}</p>
                    {t.description && <p className="task-row__desc">{t.description}</p>}
                    <div className="task-row__meta">
                      <span className={`priority-badge priority-${t.priority}`}>{t.priority}</span>
                      {t.due_date && (
                        <span className={`task-row__due ${this.isOverdue(t) ? "overdue-text" : ""}`}>
                          {this.isOverdue(t) ? "⚠ Overdue · " : "Due · "}
                          {new Date(t.due_date).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status changer */}
                <div className="task-row__status">
                  <select
                    value={t.status}
                    onChange={(e) => this.handleStatusChange(t.id, e.target.value)}
                    disabled={updating === t.id}
                    className={`status-select status-${t.status}`}
                  >
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default MyTasks;
