const express = require("express");
const multer = require("multer");
const path = require("path");
const CrackReport = require("../models/CrackReport");

const router = express.Router();

/* ── multer config ── */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `crack_${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|bmp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

/* ─────────────────────────────────────────────
   POST /api/upload-crack-data
   Accepts multipart/form-data:
     - image   (file)
     - latitude, longitude, distance_from_sensor, timestamp (text fields)
   ───────────────────────────────────────────── */
router.post("/upload-crack-data", upload.single("image"), async (req, res) => {
  try {
    const { latitude, longitude, distance_from_sensor, timestamp } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required." });
    }

    if (!latitude || !longitude || !distance_from_sensor || !timestamp) {
      return res.status(400).json({ error: "Missing required fields: latitude, longitude, distance_from_sensor, timestamp." });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const report = await CrackReport.create({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      distance_from_sensor: parseFloat(distance_from_sensor),
      timestamp,
      imageUrl,
    });

    // Emit real-time event to all connected clients
    const io = req.app.get("io");
    if (io) {
      io.emit("new-crack-report", report);
    }

    const ledMessage = `CRACK @ ${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`;

    res.status(200).json({ 
      message: "Crack report saved successfully.", 
      report,
      ledMessage
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

/* ─────────────────────────────────────────────
   GET /api/crack-reports
   Returns all reports, newest first
   ───────────────────────────────────────────── */
router.get("/crack-reports", async (_req, res) => {
  try {
    const reports = await CrackReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

/* ─────────────────────────────────────────────
   GET /api/status
   Returns system uptime and last report time
   ───────────────────────────────────────────── */
router.get("/status", async (_req, res) => {
  try {
    const totalReports = await CrackReport.countDocuments();
    const lastReport = await CrackReport.findOne().sort({ createdAt: -1 });

    res.json({
      uptime: process.uptime(),
      totalReports,
      lastReportTime: lastReport ? lastReport.createdAt : null,
      lastLedMessage: lastReport
        ? `CRACK @ ${lastReport.latitude.toFixed(4)}, ${lastReport.longitude.toFixed(4)}`
        : "NO ALERTS",
    });
  } catch (err) {
    console.error("Status error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
