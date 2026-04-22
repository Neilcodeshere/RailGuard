require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const crackRoutes = require("./routes/crackRoutes");

/* ── App & Server ── */
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

/* ── Middleware ── */
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images as static files
app.use("/uploads", express.static(uploadsDir));

/* ── Share Socket.io instance with routes ── */
app.set("io", io);

/* ── Routes ── */
app.use("/api", crackRoutes);

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "RailGuard API is running." });
});

/* ── State ── */
let esp32Status = "offline";
let lastStatusUpdate = Date.now();

/* ── Socket.io ── */
io.on("connection", (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // Send initial status to new clients
  socket.emit("esp32-status-update", { status: esp32Status });

  socket.on("esp32-status", (data) => {
    console.log(`📡 Status from ESP32: ${data.status}`);
    esp32Status = data.status;
    lastStatusUpdate = Date.now();
    // Broadcast ESP32 status to all dashboard clients (including sender)
    io.emit("esp32-status-update", data);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Watchdog for ESP32 status (if no heartbeat for 15s, mark as offline)
setInterval(() => {
  if (esp32Status === "online" && Date.now() - lastStatusUpdate > 15000) {
    esp32Status = "offline";
    io.emit("esp32-status-update", { status: "offline" });
    console.log("⚠️ ESP32 timed out - marking as offline");
  }
}, 5000);

/* ── MongoDB & Start ── */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/railway_cracks";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
