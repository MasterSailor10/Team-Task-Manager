import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./Projects.css";

const PROJECT_COLORS = ["#d4ff57","#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#f97316"];

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

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: "", description: "", color: PROJECT_COLORS[0] });
  const [creating, setCreating] = useState(false);
  const [error, setError]       = useState("");

  const load = () => {
    setLoading(true);
    api.get("/projects")
      .then((r) => setProjects(r.data))
      .catch(() => setError("Failed to load projects."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    setError("");
    try {
      await api.post("/projects", form);
      setShowForm(false);
      setForm({ name: "", description: "", color: PROJECT_COLORS[0] });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="projects page-enter">
      <div className="projects-header">
        <div>
          <h1>Projects</h1>
          <p className="projects-sub">Your workspaces and collaborations</p>
        </div>
        <button className="btn-accent" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "+ New Project"}
        </button>
      </div>

      {showForm && (
        <div className="new-project-form">
          <h3>New Project</h3>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="field">
              <label>Name</label>
              <input type="text" placeholder="e.g. Website Redesign" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="field">
              <label>Description (optional)</label>
              <textarea rows={2} placeholder="What's this project about?" value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="field">
              <label>Colour</label>
              <div className="color-picker">
                {PROJECT_COLORS.map((c) => (
                  <button key={c} type="button"
                    className={`color-dot ${form.color === c ? "selected" : ""}`}
                    style={{ background: c }}
                    onClick={() => setForm((f) => ({ ...f, color: c }))} />
                ))}
              </div>
            </div>
            <button type="submit" className="btn-accent" disabled={creating}
              style={{ width: "100%", justifyContent: "center" }}>
              {creating ? <span className="spinner" /> : "Create Project"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="projects-loading"><span className="spinner" style={{ borderTopColor: "var(--accent)" }} /></div>
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