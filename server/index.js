require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const { connectDB } = require("./initDB");

const app = express();

// ─── Connect Database ─────────────────────────────────────────
console.log("MONGO_URI:", process.env.MONGO_URI);
connectDB();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────
app.use("/api/auth",      require("./routes/auth"));
app.use("/api/projects",  require("./routes/projects"));
app.use("/api/tasks",     require("./routes/tasks"));
app.use("/api/dashboard", require("./routes/dashboard"));

// ─── Health check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ─── 404 handler ─────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// ─── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));