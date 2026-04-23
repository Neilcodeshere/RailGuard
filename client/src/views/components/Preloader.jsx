/**
 * VIEW — Preloader
 * Full-screen railway inspection vehicle animation shown on first app load.
 * SVG animated train/bot on tracks with RailGuard branding.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Animated track ties ─────────────────────────────────────────────────── */
function Track() {
  const ties = Array.from({ length: 14 });
  return (
    <svg width="100%" height="48" viewBox="0 0 560 48" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0 }}>
      {/* Rails */}
      <line x1="0" y1="14" x2="560" y2="14" stroke="#334155" strokeWidth="4" strokeLinecap="round"/>
      <line x1="0" y1="34" x2="560" y2="34" stroke="#334155" strokeWidth="4" strokeLinecap="round"/>
      {/* Animated ties */}
      {ties.map((_, i) => (
        <motion.rect
          key={i}
          x={i * 40}
          y="8"
          width="20"
          height="28"
          rx="2"
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="1"
          animate={{ x: [i * 40, i * 40 - 560] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "linear", delay: 0 }}
        />
      ))}
    </svg>
  );
}

/* ── Inspection vehicle SVG ──────────────────────────────────────────────── */
function InspectionBot() {
  return (
    <svg width="160" height="90" viewBox="0 0 160 90" fill="none">
      {/* Body */}
      <rect x="18" y="18" width="124" height="52" rx="10" fill="#0f172a" stroke="#f5a623" strokeWidth="2"/>
      {/* Roof stripe */}
      <rect x="18" y="18" width="124" height="12" rx="10" fill="#f5a623" opacity="0.9"/>
      <rect x="18" y="26" width="124" height="4" fill="#f5a623" opacity="0.9"/>

      {/* Windows */}
      <rect x="30" y="32" width="22" height="16" rx="4" fill="#06b6d4" opacity="0.7"/>
      <rect x="60" y="32" width="22" height="16" rx="4" fill="#06b6d4" opacity="0.7"/>
      <rect x="90" y="32" width="22" height="16" rx="4" fill="#06b6d4" opacity="0.7"/>

      {/* Antenna / sensor arm */}
      <line x1="80" y1="18" x2="80" y2="6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
      <motion.circle
        cx="80" cy="5" r="4" fill="#ef4444"
        animate={{ opacity: [1, 0.2, 1], r: [4, 6, 4] }}
        transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }}
      />

      {/* Ultrasonic sensor on front */}
      <rect x="138" y="30" width="16" height="10" rx="3" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5"/>
      <motion.line
        x1="154" y1="35" x2="174" y2="35"
        stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3"
        animate={{ strokeDashoffset: [0, -14] }}
        transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
      />

      {/* Wheels */}
      {[36, 72, 108].map((cx, i) => (
        <g key={i}>
          <motion.circle
            cx={cx} cy="72" r="14"
            fill="#1e293b" stroke="#f5a623" strokeWidth="2"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            style={{ transformOrigin: `${cx}px 72px` }}
          />
          {/* Spoke */}
          <motion.line
            x1={cx} y1={72-14} x2={cx} y2={72+14}
            stroke="#f5a623" strokeWidth="1.5" opacity="0.6"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            style={{ transformOrigin: `${cx}px 72px` }}
          />
          <motion.line
            x1={cx-14} y1={72} x2={cx+14} y2={72}
            stroke="#f5a623" strokeWidth="1.5" opacity="0.6"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            style={{ transformOrigin: `${cx}px 72px` }}
          />
          <circle cx={cx} cy="72" r="4" fill="#f5a623"/>
        </g>
      ))}

      {/* Headlight */}
      <motion.ellipse
        cx="152" cy="44" rx="5" ry="4"
        fill="#fef9c3"
        animate={{ opacity: [1, 0.5, 1], rx: [5, 7, 5] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      />

      {/* Label */}
      <text x="45" y="56" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#f5a623" letterSpacing="1">RG-001</text>
    </svg>
  );
}

/* ── Steam/dust particles ────────────────────────────────────────────────── */
function Particles() {
  return (
    <div style={{ position: "absolute", left: "calc(50% - 160px)", bottom: 52, pointerEvents: "none" }}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{
            x:  [-10, -40 - i * 12],
            y:  [0, -20 - i * 8],
            opacity: [0.6, 0],
            scale: [0.5, 1.5],
          }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.25, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: 8 + i * 3, height: 8 + i * 3,
            borderRadius: "50%",
            background: "rgba(148,163,184,0.5)",
          }}
        />
      ))}
    </div>
  );
}

/* ── Progress bar ────────────────────────────────────────────────────────── */
function ProgressBar({ progress }) {
  return (
    <div style={{ width: 220, height: 3, background: "rgba(255,255,255,.1)", borderRadius: 99, overflow: "hidden" }}>
      <motion.div
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ height: "100%", background: "linear-gradient(90deg,#f5a623,#ef4444)", borderRadius: 99 }}
      />
    </div>
  );
}

/* ── Main Preloader ──────────────────────────────────────────────────────── */
export default function Preloader({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [status,   setStatus]   = useState("Initialising systems…");

  const steps = [
    [20,  "Connecting to Firebase…"],
    [45,  "Loading vehicle fleet…"],
    [68,  "Calibrating sensors…"],
    [85,  "Authenticating operator…"],
    [100, "All systems ready ✓"],
  ];

  useEffect(() => {
    let i = 0;
    const tick = () => {
      if (i >= steps.length) return;
      const [pct, msg] = steps[i++];
      setProgress(pct);
      setStatus(msg);
      if (i < steps.length) setTimeout(tick, 480);
      else setTimeout(() => onDone(), 600);
    };
    const t = setTimeout(tick, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "radial-gradient(ellipse at 40% 40%, #0d1a35 0%, #03050d 70%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(245,166,35,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,.04) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }}/>

      {/* Glow */}
      <div style={{
        position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)",
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(245,166,35,.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }}/>

      {/* Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "linear-gradient(135deg,#f5a623,#ef4444)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, boxShadow: "0 0 32px rgba(245,166,35,.5)",
        }}>🚂</div>
        <div>
          <h1 style={{
            fontFamily: "'Inter','system-ui',sans-serif",
            fontSize: 32, fontWeight: 900, letterSpacing: "-0.05em",
            background: "linear-gradient(135deg,#f5a623,#ef4444)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1,
          }}>RailGuard</h1>
          <p style={{ fontSize: 11, color: "#475569", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 3 }}>
            Railway Inspection System
          </p>
        </div>
      </motion.div>

      {/* Vehicle + track scene */}
      <motion.div
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.22,1,0.36,1] }}
        style={{
          position: "relative",
          width: 320, height: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 40,
        }}
      >
        <motion.div
          animate={{ y: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
          style={{ position: "relative", zIndex: 2 }}
        >
          <InspectionBot />
        </motion.div>
        <Particles />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 48 }}>
          <Track />
        </div>
      </motion.div>

      {/* Status + progress */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
      >
        <ProgressBar progress={progress} />
        <motion.p
          key={status}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 12, color: "#475569", fontFamily: "monospace", letterSpacing: "0.06em" }}
        >
          {status}
        </motion.p>
      </motion.div>

      {/* Version */}
      <p style={{ position: "absolute", bottom: 24, fontSize: 10, color: "#1e293b", letterSpacing: "0.1em" }}>
        V2.0 · ESP8266 + Firebase RTDB
      </p>
    </motion.div>
  );
}
