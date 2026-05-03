import { Component } from "react";
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

// ── TaskCard (no state, keep as function) ─────────────────────
function TaskCard({ task, isAdmin, onEdit, onDelete }) {
  const overdue = task.due_date && task.status !== "done" && new Date(task.due_date) < new Date();
  return (
    <div className="task-card" onClick={() => onEdit(task)}>
      <div className="task-card__top">
        <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
        {isAdmin && (
          <button
            className="task-card__del"
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            title="Delete task"
          >✕</button>
        )}
      </div>
      <p className="task-card__title">{task.title}</p>
      {task.description && <p className="task-card__desc">{task.description}</p>}
      <div className="task-card__footer">
        {task.assigned_name && (
          <span
            className="task-card__avatar"
            style={{ background: task.assigned_color || "#6366f1" }}
            title={task.assigned_name}
          >
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

// ── AddMemberForm class component ─────────────────────────────
class AddMemberForm extends Component {
  constructor(props) {
    super(props);
    this.state = { email: "", loading: false, error: "" };
    this.handleAdd = this.handleAdd.bind(this);
  }

  async handleAdd(e) {
    e.preventDefault();
    this.setState({ error: "", loading: true });
    try {
      await api.post(`/projects/${this.props.projectId}/members`, { email: this.state.email });
      this.setState({ email: "" });
      this.props.onAdded();
    } catch (err) {
      this.setState({ error: err.response?.data?.message || "User not found." });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { email, loading, error } = this.state;
    return (
      <form className="add-member-form" onSubmit={this.handleAdd}>
        <h4>Add member by email</h4>
        {error && <div className="auth-error" style={{ marginBottom: "0.75rem" }}>{error}</div>}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <input
            type="email"
            placeholder="colleague@example.com"
            value={email}
            onChange={(e) => this.setState({ email: e.target.value })}
            required
            style={{
              flex: 1, background: "var(--bg-3)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", color: "var(--text)",
              padding: "0.65rem 1rem", fontSize: "0.9rem",
            }}
          />
          <button type="submit" className="btn-accent" disabled={loading}>
            {loading ? <span className="spinner" /> : "Add"}
          </button>
        </div>
      </form>
    );
  }
}

// ── Wrapper to inject hooks into class component ──────────────
function ProjectDetail(props) {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  return <ProjectDetailClass id={id} user={user} navigate={navigate} {...props} />;
}

// ── Main ProjectDetail class component ────────────────────────
class ProjectDetailClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      project:   null,
      tasks:     [],
      members:   [],
      loading:   true,
      modalTask: null,
      tab:       "board",
    };
    this.load               = this.load.bind(this);
    this.handleDeleteTask   = this.handleDeleteTask.bind(this);
    this.handleRemoveMember = this.handleRemoveMember.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.load();
    }
  }

  async load() {
    try {
      const [pRes, tRes, mRes] = await Promise.all([
        api.get(`/projects/${this.props.id}`),
        api.get(`/projects/${this.props.id}/tasks`),
        api.get(`/projects/${this.props.id}/members`),
      ]);
      this.setState({
        project: pRes.data,
        tasks:   tRes.data,
        members: mRes.data,
      });
    } catch (err) {
      if (err.response?.status === 404) this.props.navigate("/projects");
    } finally {
      this.setState({ loading: false });
    }
  }

  async handleDeleteTask(taskId) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      this.setState((prev) => ({
        tasks: prev.tasks.filter((x) => x.id !== taskId),
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task.");
    }
  }

  async handleRemoveMember(memberId) {
    if (!window.confirm("Remove this member?")) return;
    try {
      await api.delete(`/projects/${this.props.id}/members/${memberId}`);
      this.load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member.");
    }
  }

  render() {
    const { user, id }                        = this.props;
    const { project, tasks, members, loading, modalTask, tab } = this.state;

    const isAdmin = members.find(
      (m) => m.user_id?.toString() === user?.id?.toString() ||
             m.user_id?.toString() === user?._id?.toString()
    )?.role === "admin";

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
        {/* Header */}
        <div className="pd-header">
          <div className="pd-header__left">
            <button className="pd-back" onClick={() => this.props.navigate("/projects")}>← Projects</button>
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
              <button className="btn-accent" onClick={() => this.setState({ modalTask: {} })}>
                + Add Task
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="pd-tabs">
          <button
            className={`pd-tab ${tab === "board" ? "active" : ""}`}
            onClick={() => this.setState({ tab: "board" })}
          >Board</button>
          <button
            className={`pd-tab ${tab === "members" ? "active" : ""}`}
            onClick={() => this.setState({ tab: "members" })}
          >Members ({members.length})</button>
        </div>

        {/* Board view */}
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
                    <TaskCard
                      key={t.id}
                      task={t}
                      isAdmin={isAdmin}
                      onEdit={(task) => this.setState({ modalTask: task })}
                      onDelete={this.handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Members tab */}
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
                  <button className="member-remove" onClick={() => this.handleRemoveMember(m.user_id)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            {isAdmin && <AddMemberForm projectId={id} onAdded={this.load} />}
          </div>
        )}

        {/* Task modal */}
        {modalTask !== null && (
          <TaskModal
            task={modalTask}
            projectId={id}
            members={members}
            isAdmin={isAdmin}
            currentUser={user}
            onClose={() => this.setState({ modalTask: null })}
            onSaved={() => { this.setState({ modalTask: null }); this.load(); }}
          />
        )}
      </div>
    );
  }
}

export default ProjectDetail;
