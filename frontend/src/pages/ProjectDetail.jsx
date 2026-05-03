import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import TaskModal from "../components/TaskModal";
import "./ProjectDetail.css";

const COLUMNS = [
  { key: "todo",       label: "To Do",      dot: "dot-todo" },
  { key: "inprogress", label: "In Progress", dot: "dot-progress" },
  { key: "done",       label: "Done",        dot: "dot-done" },
];

function TaskCard({ task, isAdmin, onEdit, onDelete }) {
  const overdue = task.due_date && task.status !== "done" && new Date(task.due_date) < new Date();
  return (
    <div className="task-card" onClick={() => onEdit(task)}>
      <div className="task-card__top">
        <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
        {isAdmin && (
          <button className="task-card__del"
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} title="Delete task">✕</button>
        )}
      </div>
      <p className="task-card__title">{task.title}</p>
      {task.description && <p className="task-card__desc">{task.description}</p>}
      <div className="task-card__footer">
        {task.assigned_name && (
          <span className="task-card__avatar" style={{ background: task.assigned_color || "#6366f1" }} title={task.assigned_name}>
            {task.assigned_name[0].toUpperCase()}
          </span>
        )}
        {task.due_date && (
          <span className={`task-card__due ${overdue ? "task-card__due--overdue" : ""}`}>
            {overdue ? "⚠ " : ""}
            {new Date(task.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject]     = useState(null);
  const [tasks, setTasks]         = useState([]);
  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalTask, setModalTask] = useState(null);
  const [tab, setTab]             = useState("board");

  const isAdmin = members.find(
  (m) => m.user_id?.toString() === user?.id?.toString() ||
         m.user_id?.toString() === user?._id?.toString()
)?.role === "admin";

  const load = useCallback(async () => {
  try {
    const [pRes, tRes, mRes] = await Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/tasks`),
      api.get(`/projects/${id}/members`),
    ]);
    setProject(pRes.data);
    setTasks(tRes.data);
    setMembers(mRes.data);

    // ADD THESE TWO LINES TEMPORARILY
    console.log("Members from API:", mRes.data);
    console.log("Current user:", user);

  } catch (err) {
    if (err.response?.status === 404) navigate("/projects");
  } finally {
    setLoading(false);
  }
}, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((t) => t.filter((x) => x.id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task.");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member.");
    }
  };

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter((t) => t.status === col.key);
    return acc;
  }, {});

  if (loading) return (
    <div style={{ display: "flex", height: "60vh", alignItems: "center", justifyContent: "center" }}>
      <span className="spinner" style={{ borderTopColor: "var(--accent)", width: 28, height: 28, borderWidth: 3 }} />
    </div>
  );

  return (
    <div className="project-detail page-enter">
      <div className="pd-header">
        <div className="pd-header__left">
          <button className="pd-back" onClick={() => navigate("/projects")}>← Projects</button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div className="pd-color-dot" style={{ background: project?.color }} />
              <h1 className="pd-title">{project?.name}</h1>
            </div>
            {project?.description && <p className="pd-desc">{project.description}</p>}
          </div>
        </div>
        <div className="pd-header__actions">
          {isAdmin && (
            <button className="btn-accent" onClick={() => setModalTask({})}>+ Add Task</button>
          )}
        </div>
      </div>

      <div className="pd-tabs">
        <button className={`pd-tab ${tab === "board" ? "active" : ""}`} onClick={() => setTab("board")}>Board</button>
        <button className={`pd-tab ${tab === "members" ? "active" : ""}`} onClick={() => setTab("members")}>
          Members ({members.length})
        </button>
      </div>

      {tab === "board" && (
        <div className="kanban">
          {COLUMNS.map((col) => (
            <div key={col.key} className="kanban-col">
              <div className="kanban-col__header">
                <i className={`dot ${col.dot}`} />
                <span>{col.label}</span>
                <span className="kanban-col__count">{grouped[col.key].length}</span>
              </div>
              <div className="kanban-col__cards">
                {grouped[col.key].length === 0 && <div className="kanban-empty">No tasks</div>}
                {grouped[col.key].map((t) => (
                  <TaskCard key={t.id} task={t} isAdmin={isAdmin}
                    onEdit={setModalTask} onDelete={handleDeleteTask} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "members" && (
        <div className="pd-members">
          {members.map((m) => (
            <div key={m.user_id} className="member-row">
              <span className="member-avatar" style={{ background: m.avatar_color }}>
                {m.name[0].toUpperCase()}
              </span>
              <div className="member-info">
                <span className="member-name">{m.name}</span>
                <span className="member-email">{m.email}</span>
              </div>
              <span className={`member-role role-${m.role}`}>{m.role}</span>
              {isAdmin && m.user_id?.toString() !== user?.id?.toString() && (
                <button className="member-remove" onClick={() => handleRemoveMember(m.user_id)}>Remove</button>
              )}
            </div>
          ))}
          {isAdmin && <AddMemberForm projectId={id} onAdded={load} />}
        </div>
      )}

      {modalTask !== null && (
        <TaskModal
          task={modalTask}
          projectId={id}
          members={members}
          isAdmin={isAdmin}
          currentUser={user}
          onClose={() => setModalTask(null)}
          onSaved={() => { setModalTask(null); load(); }}
        />
      )}
    </div>
  );
}

function AddMemberForm({ projectId, onAdded }) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post(`/projects/${projectId}/members`, { email });
      setEmail("");
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || "User not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-member-form" onSubmit={handleAdd}>
      <h4>Add member by email</h4>
      {error && <div className="auth-error" style={{ marginBottom: "0.75rem" }}>{error}</div>}
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <input type="email" placeholder="colleague@example.com" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          style={{ flex: 1, background: "var(--bg-3)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", color: "var(--text)", padding: "0.65rem 1rem", fontSize: "0.9rem" }} />
        <button type="submit" className="btn-accent" disabled={loading}>
          {loading ? <span className="spinner" /> : "Add"}
        </button>
      </div>
    </form>
  );
}