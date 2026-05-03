import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import "./MyTasks.css";

const STATUS_OPTIONS = ["all", "todo", "inprogress", "done"];
const STATUS_LABEL   = { all: "All", todo: "To Do", inprogress: "In Progress", done: "Done" };

export default function MyTasks() {
  const [tasks, setTasks]       = useState([]);
  const [filter, setFilter]     = useState("all");
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError]       = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api.get("/tasks/mine")
      .then((r) => setTasks(r.data))
      .catch(() => setError("Failed to load tasks."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(taskId);
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const isOverdue = (t) => t.due_date && t.status !== "done" && new Date(t.due_date) < new Date();

  return (
    <div className="my-tasks page-enter">
      <div className="my-tasks-header">
        <div>
          <h1>My Tasks</h1>
          <p className="my-tasks-sub">Everything assigned to you</p>
        </div>
      </div>

      <div className="filter-pills">
        {STATUS_OPTIONS.map((s) => (
          <button key={s} className={`filter-pill ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
            {STATUS_LABEL[s]}
            <span className="pill-count">
              {s === "all" ? tasks.length : tasks.filter((t) => t.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="my-tasks-loading"><span className="spinner" style={{ borderTopColor: "var(--accent)" }} /></div>
      ) : error ? (
        <div className="auth-error">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="my-tasks-empty"><p>No tasks here</p><span>You're all caught up ✓</span></div>
      ) : (
        <div className="tasks-list">
          {filtered.map((t) => (
            <div key={t.id} className={`task-row ${isOverdue(t) ? "task-row--overdue" : ""}`}>
              <div className="task-row__left">
                <div className="task-row__info">
                  <span className="task-row__project">{t.project_name}</span>
                  <p className="task-row__title">{t.title}</p>
                  {t.description && <p className="task-row__desc">{t.description}</p>}
                  <div className="task-row__meta">
                    <span className={`priority-badge priority-${t.priority}`}>{t.priority}</span>
                    {t.due_date && (
                      <span className={`task-row__due ${isOverdue(t) ? "overdue-text" : ""}`}>
                        {isOverdue(t) ? "⚠ Overdue · " : "Due · "}
                        {new Date(t.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="task-row__status">
                <select value={t.status} onChange={(e) => handleStatusChange(t.id, e.target.value)}
                  disabled={updating === t.id} className={`status-select status-${t.status}`}>
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