const mongoose = require("mongoose");

// ─── CONNECT ─────────────────────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected — taskManager db ready");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

// ─── USER ─────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, required: true },
  avatar_color: { type: String, default: "#6366f1" },
}, { timestamps: true });

// ─── PROJECT ──────────────────────────────────────────────────
const memberSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role:     { type: String, enum: ["admin", "member"], default: "member" },
  joinedAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  color:       { type: String, default: "#6366f1" },
  created_by:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members:     [memberSchema],
}, { timestamps: true });

// ─── TASK ─────────────────────────────────────────────────────
const taskSchema = new mongoose.Schema({
  project:     { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  status:      { type: String, enum: ["todo", "inprogress", "done"], default: "todo" },
  priority:    { type: String, enum: ["low", "medium", "high"], default: "medium" },
  due_date:    { type: Date, default: null },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  created_by:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

// ─── MODELS ───────────────────────────────────────────────────
const User    = mongoose.models.User    || mongoose.model("User",    userSchema);
const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);
const Task    = mongoose.models.Task    || mongoose.model("Task",    taskSchema);

module.exports = { connectDB, User, Project, Task };