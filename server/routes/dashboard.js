const router = require("express").Router();
const auth   = require("../middleware/auth");
const { Task, Project, User } = require("../initDB");

// ─── GET /api/dashboard ───────────────────────────────────────
router.get("/", auth, async (req, res) => {
  try {
    // Get all projects user is part of
    const projects = await Project.find({ "members.user": req.user._id }).lean();
    const projectIds = projects.map((p) => p._id);

    // All tasks across user's projects
    const allTasks = await Task.find({ project: { $in: projectIds } }).lean();

    const now = new Date();

    const totalTasks = allTasks.length;
    const done       = allTasks.filter((t) => t.status === "done").length;
    const inProgress = allTasks.filter((t) => t.status === "inprogress").length;
    const todo       = allTasks.filter((t) => t.status === "todo").length;
    const overdue    = allTasks.filter(
      (t) => t.due_date && t.status !== "done" && new Date(t.due_date) < now
    ).length;

    // Tasks per user (assigned_to)
    const assignedTasks = allTasks.filter((t) => t.assigned_to);
    const userTaskMap   = {};
    assignedTasks.forEach((t) => {
      const uid = t.assigned_to.toString();
      userTaskMap[uid] = (userTaskMap[uid] || 0) + 1;
    });

    const userIds  = Object.keys(userTaskMap);
    const users    = await User.find({ _id: { $in: userIds } }).select("name avatar_color").lean();
    const perUser  = users.map((u) => ({
      id:           u._id,
      name:         u.name,
      avatar_color: u.avatar_color,
      task_count:   userTaskMap[u._id.toString()] || 0,
    }));

    // Overdue tasks with project name
    const overdueTaskDocs = await Task.find({
      project:  { $in: projectIds },
      due_date: { $lt: now },
      status:   { $ne: "done" },
    })
      .populate("project", "name")
      .lean();

    const overdueTasks = overdueTaskDocs.map((t) => ({
      id:           t._id,
      title:        t.title,
      priority:     t.priority,
      due_date:     t.due_date,
      project_name: t.project?.name || "Unknown",
    }));

    res.json({
      totalTasks,
      done,
      inProgress,
      todo,
      overdue,
      perUser,
      overdueTasks,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;