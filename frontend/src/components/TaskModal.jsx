import { useState, useEffect } from "react";
import api from "../api/axios";
import "./TaskModal.css";

const STATUS_OPTIONS = [
  { value: "todo",       label: "To Do" },
  { value: "inprogress", label: "In Progress" },
  { value: "done",       label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High" },
];

export default function TaskModal({ task, projectId, members, isAdmin, currentUser, onClose, onSaved }) {
  const isNew = !task?.id;

  // If not admin, member can only update status of their own task
  const canEdit = isAdmin || task?.assigned_to === currentUser?.id;

  const [form, setForm] = useState({
    title:       task?.title       || "",
    description: task?.description || "",
    status:      task?.status      || "todo",
    priority:    task?.priority    || "medium",
    due_date:    task?.due_date    ? task.due_date.slice(0, 10) : "",
    assigned_to: task?.assigned_to || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        assigned_to: form.assigned_to || null,
        due_date:    form.due_date    || null,
      };

      if (isNew) {
        await api.post(`/projects/${projectId}/tasks`, payload);
      } else {
        // Members can only update status
        const update = isAdmin ? payload : { status: form.status };
        await api.patch(`/tasks/${task.id}`, update);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save task.");
    } finally {
      setSaving(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2>{isNew ? "New Task" : canEdit ? "Edit Task" : "Task Details"}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="auth-error" style={{ margin:"0 1.5rem 0.5rem" }}>{error}</div>}

        <form className="modal__body" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="field">
            <label>Title</label>
            <input
              type="text"
              name="title"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={handleChange}
              required
              disabled={!isNew && !isAdmin}
            />
          </div>

          {/* Description */}
          {(isNew || isAdmin) && (
            <div className="field">
              <label>Description</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Add some context…"
                value={form.description}
                onChange={handleChange}
                disabled={!isNew && !isAdmin}
              />
            </div>
          )}

          {/* Status + Priority in row */}
          <div className="modal__row">
            <div className="field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange} disabled={!canEdit}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} disabled={!isAdmin && !isNew}>
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date + Assignee in row */}
          <div className="modal__row">
            <div className="field">
              <label>Due Date</label>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                disabled={!isAdmin && !isNew}
              />
            </div>
            <div className="field">
              <label>Assign To</label>
              <select name="assigned_to" value={form.assigned_to} onChange={handleChange} disabled={!isAdmin && !isNew}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {canEdit && (
            <div className="modal__footer">
              <button type="button" className="modal__cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-accent" disabled={saving}>
                {saving ? <span className="spinner" /> : isNew ? "Create Task" : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}