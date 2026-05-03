const router = require("express").Router();
const auth   = require("../middleware/auth");
const { Project, User, Task } = require("../initDB");

// ─── Helpers ──────────────────────────────────────────────────
const isProjectAdmin = (project, userId) =>
  project.members.some((m) => {
    const memberId = m.user?._id ? m.user._id.toString() : m.user.toString();
    return memberId === userId.toString() && m.role === "admin";
  });

const isMember = (project, userId) =>
  project.members.some((m) => {
    const memberId = m.user?._id ? m.user._id.toString() : m.user.toString();
    return memberId === userId.toString();
  });

// ─── GET /api/projects ────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find({ "members.user": req.user._id })
      .populate("created_by", "name email avatar_color")
      .populate("members.user", "name email avatar_color")
      .lean();

    const result = await Promise.all(
      projects.map(async (p) => {
        const total_tasks = await Task.countDocuments({ project: p._id });
        const done_tasks  = await Task.countDocuments({ project: p._id, status: "done" });
        const userMember  = p.members.find(
          (m) => m.user._id.toString() === req.user._id.toString()
        );

        return {
          id:           p._id.toString(),
          name:         p.name,
          description:  p.description,
          color:        p.color,
          role:         userMember?.role || "member",
          total_tasks,
          done_tasks,
          member_count: p.members.length,
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("Get projects error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── POST /api/projects ───────────────────────────────────────
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) return res.status(400).json({ message: "Project name is required" });

    const project = await Project.create({
      name,
      description,
      color:      color || "#6366f1",
      created_by: req.user._id,
      members:    [{ user: req.user._id, role: "admin" }],
    });

    res.status(201).json({
      id:           project._id.toString(),
      name:         project.name,
      description:  project.description,
      color:        project.color,
      role:         "admin",
      total_tasks:  0,
      done_tasks:   0,
      member_count: 1,
    });
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── GET /api/projects/:id ────────────────────────────────────
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members.user", "name email avatar_color")
      .lean();

    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!isMember(project, req.user._id))
      return res.status(403).json({ message: "Access denied" });

    res.json({
      id:          project._id.toString(),
      name:        project.name,
      description: project.description,
      color:       project.color,
      created_by:  project.created_by?.toString(),
    });
  } catch (err) {
    console.error("Get project error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── DELETE /api/projects/:id ─────────────────────────────────
router.delete("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members.user", "name email avatar_color")
      .lean();

    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!isProjectAdmin(project, req.user._id))
      return res.status(403).json({ message: "Only admins can delete projects" });

    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error("Delete project error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── GET /api/projects/:id/members ───────────────────────────
router.get("/:id/members", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members.user", "name email avatar_color")
      .lean();

    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!isMember(project, req.user._id))
      return res.status(403).json({ message: "Access denied" });

    const members = project.members.map((m) => ({
      user_id:      m.user._id.toString(),
      name:         m.user.name,
      email:        m.user.email,
      avatar_color: m.user.avatar_color,
      role:         m.role,
      joined_at:    m.joinedAt,
    }));

    res.json(members);
  } catch (err) {
    console.error("Get members error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── POST /api/projects/:id/members ──────────────────────────
router.post("/:id/members", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members.user", "name email avatar_color")
      .lean();

    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!isProjectAdmin(project, req.user._id))
      return res.status(403).json({ message: "Only admins can add members" });

    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: "No user found with that email" });

    const alreadyMember = project.members.some(
      (m) => m.user._id.toString() === userToAdd._id.toString()
    );
    if (alreadyMember)
      return res.status(400).json({ message: "User is already a member" });

    // Use findByIdAndUpdate to avoid lean() issue
    await Project.findByIdAndUpdate(req.params.id, {
      $push: { members: { user: userToAdd._id, role: "member" } },
    });

    res.status(201).json({ message: "Member added" });
  } catch (err) {
    console.error("Add member error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── DELETE /api/projects/:id/members/:userId ─────────────────
router.delete("/:id/members/:userId", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members.user", "name email avatar_color")
      .lean();

    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!isProjectAdmin(project, req.user._id))
      return res.status(403).json({ message: "Only admins can remove members" });

    if (req.params.userId === req.user._id.toString())
      return res.status(400).json({ message: "Cannot remove yourself" });

    await Project.findByIdAndUpdate(req.params.id, {
      $pull: { members: { user: req.params.userId } },
    });

    res.json({ message: "Member removed" });
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── GET /api/projects/:id/tasks ─────────────────────────────
router.get("/:id/tasks", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members.user", "name email avatar_color")
      .lean();

    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!isMember(project, req.user._id))
      return res.status(403).json({ message: "Access denied" });

    const tasks = await Task.find({ project: req.params.id })
      .populate("assigned_to", "name email avatar_color")
      .populate("created_by", "name")
      .lean();

    const result = tasks.map((t) => ({
      id:             t._id.toString(),
      title:          t.title,
      description:    t.description,
      status:         t.status,
      priority:       t.priority,
      due_date:       t.due_date,
      assigned_to:    t.assigned_to?._id?.toString() || null,
      assigned_name:  t.assigned_to?.name || null,
      assigned_color: t.assigned_to?.avatar_color || null,
      created_by:     t.created_by?._id?.toString() || null,
    }));

    res.json(result);
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── POST /api/projects/:id/tasks ────────────────────────────
router.post("/:id/tasks", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members.user", "name email avatar_color")
      .lean();

    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!isProjectAdmin(project, req.user._id))
      return res.status(403).json({ message: "Only admins can create tasks" });

    const { title, description, status, priority, due_date, assigned_to } = req.body;
    if (!title) return res.status(400).json({ message: "Task title is required" });

    const task = await Task.create({
      project:     req.params.id,
      title,
      description,
      status:      status      || "todo",
      priority:    priority    || "medium",
      due_date:    due_date    || null,
      assigned_to: assigned_to || null,
      created_by:  req.user._id,
    });

    const populated = await task.populate("assigned_to", "name email avatar_color");

    res.status(201).json({
      id:             populated._id.toString(),
      title:          populated.title,
      description:    populated.description,
      status:         populated.status,
      priority:       populated.priority,
      due_date:       populated.due_date,
      assigned_to:    populated.assigned_to?._id?.toString() || null,
      assigned_name:  populated.assigned_to?.name || null,
      assigned_color: populated.assigned_to?.avatar_color || null,
    });
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;