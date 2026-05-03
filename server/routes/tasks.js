const router = require("express").Router();
const auth   = require("../middleware/auth");
const { Task, Project } = require("../initDB");

// ─── Helper ───────────────────────────────────────────────────
const isProjectAdmin = (project, userId) =>
  project.members.some(
    (m) => m.user.toString() === userId.toString() && m.role === "admin"
  );

// ─── GET /api/tasks/mine ──────────────────────────────────────
// Get all tasks assigned to the logged-in user
router.get("/mine", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assigned_to: req.user._id })
      .populate("project", "name color")
      .populate("assigned_to", "name avatar_color")
      .lean();

    const result = tasks.map((t) => ({
      id:           t._id,
      title:        t.title,
      description:  t.description,
      status:       t.status,
      priority:     t.priority,
      due_date:     t.due_date,
      project_id:   t.project?._id,
      project_name: t.project?.name || "Unknown",
      project_color: t.project?.color,
    }));

    res.json(result);
  } catch (err) {
    console.error("Get my tasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── PATCH /api/tasks/:id ─────────────────────────────────────
// Admin: update anything | Member: update only status of their own task
router.patch("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const admin = isProjectAdmin(project, req.user._id);
    const isAssigned = task.assigned_to?.toString() === req.user._id.toString();

    // Must be admin OR assigned member
    if (!admin && !isAssigned)
      return res.status(403).json({ message: "Access denied" });

    if (admin) {
      // Admin can update everything
      const { title, description, status, priority, due_date, assigned_to } = req.body;
      if (title)       task.title       = title;
      if (description !== undefined) task.description = description;
      if (status)      task.status      = status;
      if (priority)    task.priority    = priority;
      if (due_date     !== undefined) task.due_date    = due_date || null;
      if (assigned_to  !== undefined) task.assigned_to = assigned_to || null;
    } else {
      // Member can only update status
      if (req.body.status) task.status = req.body.status;
    }

    await task.save();
    const updated = await task.populate("assigned_to", "name avatar_color");

    res.json({
      id:             updated._id,
      title:          updated.title,
      description:    updated.description,
      status:         updated.status,
      priority:       updated.priority,
      due_date:       updated.due_date,
      assigned_to:    updated.assigned_to?._id || null,
      assigned_name:  updated.assigned_to?.name || null,
      assigned_color: updated.assigned_to?.avatar_color || null,
    });
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── DELETE /api/tasks/:id ────────────────────────────────────
// Only admins can delete tasks
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!isProjectAdmin(project, req.user._id))
      return res.status(403).json({ message: "Only admins can delete tasks" });

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;