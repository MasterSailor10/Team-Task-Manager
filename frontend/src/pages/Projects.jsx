import { Component } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./Projects.css";

const PROJECT_COLORS = ["#d4ff57","#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#f97316"];

// ── ProjectCard (no state, keep as function) ──────────────────
function ProjectCard({ project }) {
  const progress = project.total_tasks > 0
    ? Math.round((project.done_tasks / project.total_tasks) * 100) : 0;

  return (
    <Link to={`/projects/${project.id}`} className="project-card">
      <div className="project-card__color-bar" style={{ background: project.color }} />
      <div className="project-card__body">
        <div className="project-card__header">
          <span className="project-card__role">{project.role}</span>
          <h3 className="project-card__name">{project.name}</h3>
          {project.description && <p className="project-card__desc">{project.description}</p>}
        </div>
        <div className="project-card__footer">
          <div className="project-card__progress">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%`, background: project.color }} />
            </div>
            <span className="progress-pct">{progress}%</span>
          </div>
          <div className="project-card__meta">
            <span>{project.total_tasks} tasks</span>
            <span>{project.member_count} member{project.member_count !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Projects class component ──────────────────────────────────
class Projects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      loading:  true,
      showForm: false,
      form:     { name: "", description: "", color: PROJECT_COLORS[0] },
      creating: false,
      error:    "",
    };
    this.load         = this.load.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  load() {
    this.setState({ loading: true });
    api.get("/projects")
      .then((r) => this.setState({ projects: r.data }))
      .catch(() => this.setState({ error: "Failed to load projects." }))
      .finally(() => this.setState({ loading: false }));
  }

  handleFormChange(key, value) {
    this.setState((prev) => ({
      form: { ...prev.form, [key]: value },
    }));
  }

  async handleCreate(e) {
    e.preventDefault();
    if (!this.state.form.name.trim()) return;
    this.setState({ creating: true, error: "" });
    try {
      await api.post("/projects", this.state.form);
      this.setState({
        showForm: false,
        form: { name: "", description: "", color: PROJECT_COLORS[0] },
      });
      this.load();
    } catch (err) {
      this.setState({ error: err.response?.data?.message || "Failed to create project." });
    } finally {
      this.setState({ creating: false });
    }
  }

  render() {
    const { projects, loading, showForm, form, creating, error } = this.state;

    return (
      <div className="projects page-enter">
        <div className="projects-header">
          <div>
            <h1>Projects</h1>
            <p className="projects-sub">Your workspaces and collaborations</p>
          </div>
          <button
            className="btn-accent"
            onClick={() => this.setState({ showForm: !showForm })}
          >
            {showForm ? "✕ Cancel" : "+ New Project"}
          </button>
        </div>

        {showForm && (
          <div className="new-project-form">
            <h3>New Project</h3>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={this.handleCreate}>
              <div className="field">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="e.g. Website Redesign"
                  value={form.name}
                  onChange={(e) => this.handleFormChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label>Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="What's this project about?"
                  value={form.description}
                  onChange={(e) => this.handleFormChange("description", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Colour</label>
                <div className="color-picker">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c} type="button"
                      className={`color-dot ${form.color === c ? "selected" : ""}`}
                      style={{ background: c }}
                      onClick={() => this.handleFormChange("color", c)}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="btn-accent"
                disabled={creating}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {creating ? <span className="spinner" /> : "Create Project"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="projects-loading">
            <span className="spinner" style={{ borderTopColor: "var(--accent)" }} />
          </div>
        ) : projects.length === 0 ? (
          <div className="projects-empty">
            <p>No projects yet.</p>
            <span>Create your first project to get started.</span>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>
    );
  }
}

export default Projects;
