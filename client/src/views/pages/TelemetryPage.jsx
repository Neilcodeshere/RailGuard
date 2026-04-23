/**
 * VIEW — TelemetryPage v2 — Animated Gauges + Responsive
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gauge, Battery, Navigation2, Zap, Cpu, Wifi, Volume2, VolumeX, RefreshCw } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22,1,0.36,1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

/* ── SVG Arc Gauge ─────────────────────────────────────────────────────────── */
function ArcGauge({ value, max, label, unit, color, icon: Icon, size = 140 }) {
  const pct    = Math.min(value / max, 1);
  const r      = size * 0.38;
  const cx     = size / 2;
  const cy     = size / 2 + 4;
  const arc    = Math.PI * r;
  const dash   = pct * arc;
  const angle  = -90 + pct * 180;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, boxShadow: `0 8px 32px ${color}40` }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="glass noise"
      style={{ borderRadius: "var(--r-xl)", padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "default", transition: "box-shadow .3s" }}
    >
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
        {/* track */}
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
          fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={10} strokeLinecap="round" />
        {/* value arc */}
        <motion.path
          d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
          fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={`${dash} ${arc}`}
          initial={{ strokeDasharray: `0 ${arc}` }}
          animate={{ strokeDasharray: `${dash} ${arc}` }}
          transition={{ duration: 1.2, ease: [0.22,1,0.36,1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color}90)` }}
        />
        {/* needle */}
        <motion.g
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          animate={{ rotate: angle }}
          transition={{ duration: 1.2, ease: [0.22,1,0.36,1] }}
        >
          <line x1={cx} y1={cy} x2={cx} y2={cy - r + 14} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        </motion.g>
        <motion.circle cx={cx} cy={cy} r={5} fill={color}
          animate={{ r: hovered ? 7 : 5, opacity: hovered ? 1 : 0.85 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        {/* tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const a = Math.PI * t;
          const tx = cx - r * Math.cos(a) + Math.cos(a) * 14;
          const ty = cy - r * Math.sin(a) + Math.sin(a) * 14;
          return <circle key={i} cx={cx - r * Math.cos(a)} cy={cy - r * Math.sin(a)} r={2} fill="rgba(255,255,255,.2)" />;
        })}
      </svg>

      {/* value text */}
      <motion.p key={value}
        initial={{ scale: 1.15, color: "#fff" }}
        animate={{ scale: 1, color }}
        style={{ fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}
      >
        {typeof value === "number" ? (value < 10 ? value.toFixed(1) : Math.round(value)) : value}
        <span style={{ fontSize: "0.42em", color: "var(--text-3)", marginLeft: 3 }}>{unit}</span>
      </motion.p>

      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <Icon size={12} color="var(--text-3)" />
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)" }}>{label}</span>
      </div>
    </motion.div>
  );
}

/* ── Compass ───────────────────────────────────────────────────────────────── */
function Compass({ heading }) {
  const dirs = [["N","#ef4444"], ["E","#475569"], ["S","#475569"], ["W","#475569"]];
  const pos  = [{ top:6,left:"50%",transform:"translateX(-50%)" }, { right:6,top:"50%",transform:"translateY(-50%)" }, { bottom:6,left:"50%",transform:"translateX(-50%)" }, { left:6,top:"50%",transform:"translateY(-50%)" }];
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="glass noise"
      style={{ borderRadius: "var(--r-xl)", padding: "22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
        <Navigation2 size={14} color="var(--cyan)" />
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Heading</span>
      </div>
      <div style={{ position: "relative", width: 96, height: 96 }}>
        <div style={{
          width: "100%", height: "100%", borderRadius: "50%",
          background: "rgba(6,182,212,.06)",
          border: "2px solid rgba(6,182,212,.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {dirs.map(([d, c], i) => (
            <span key={d} style={{ position: "absolute", fontSize: 11, fontWeight: 800, color: c, ...pos[i] }}>{d}</span>
          ))}
          <motion.div
            animate={{ rotate: heading }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Navigation2 size={26} color="var(--cyan)" />
          </motion.div>
        </div>
      </div>
      <motion.p key={heading} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
        style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--cyan)", letterSpacing: "-0.04em" }}
      >
        {heading?.toFixed(0) ?? 0}°
      </motion.p>
    </motion.div>
  );
}

/* ── Buzzer card ───────────────────────────────────────────────────────────── */
function BuzzerCard({ active }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="glass noise"
      style={{
        borderRadius: "var(--r-xl)", padding: "22px",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
        border: active ? "1px solid rgba(239,68,68,.35)" : "1px solid var(--border)",
        boxShadow: active ? "0 0 32px rgba(239,68,68,.15)" : "none",
        transition: "border-color .4s, box-shadow .4s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        {active ? <Volume2 size={14} color="var(--red)" /> : <VolumeX size={14} color="var(--text-3)" />}
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-2)" }}>Buzzer</span>
      </div>
      <motion.div
        animate={active ? {
          scale: [1, 1.25, 1],
          boxShadow: ["0 0 10px rgba(239,68,68,.3)", "0 0 44px rgba(239,68,68,.7)", "0 0 10px rgba(239,68,68,.3)"]
        } : {}}
        transition={{ repeat: Infinity, duration: 0.7 }}
        style={{
          width: 68, height: 68, borderRadius: "50%",
          background: active ? "rgba(239,68,68,.15)" : "rgba(34,197,94,.1)",
          border: `2px solid ${active ? "var(--red)" : "var(--green)"}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
        }}
      >
        {active ? "🔊" : "🔕"}
      </motion.div>
      <p style={{ fontWeight: 800, fontSize: 14, color: active ? "var(--red)" : "var(--green)" }}>
        {active ? "ALERT ACTIVE" : "All Clear"}
      </p>
      <p style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", lineHeight: 1.5 }}>
        {active ? "Critical/High detection triggered alert" : "No critical detections"}
      </p>
    </motion.div>
  );
}

/* ── Raw data table ────────────────────────────────────────────────────────── */
function RawFrame({ report }) {
  const [open, setOpen] = useState(true);
  if (!report) return null;
  const rows = [
    ["Report ID", report.id], ["Type", report.type.replace(/_/g, " ")],
    ["Severity", report.severity], ["Corridor", report.corridor],
    ["Latitude", report.latitude?.toFixed(6)], ["Longitude", report.longitude?.toFixed(6)],
    ["Ultrasonic", `${report.ultrasonicCm} cm`], ["Speed", `${report.speed} km/h`],
    ["Confidence", `${report.confidence}%`], ["Buzzer", report.buzzerActive ? "Triggered 🔊" : "Silent"],
    ["Satellites", report.satellites ?? 0], ["Source", report.source ?? "mock"],
    ["Timestamp", new Date(report.timestamp).toLocaleString("en-IN")],
  ];
  return (
    <motion.div variants={fadeUp} className="glass noise" style={{ borderRadius: "var(--r-xl)", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "16px 22px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "none", border: "none", cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Cpu size={14} color="var(--purple)" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Latest Sensor Frame
          </span>
          <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 99, background: "var(--purple-lo)", color: "var(--purple)", fontWeight: 700 }}>
            {report.source === "firebase" ? "🔴 Firebase" : "Mock"}
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} style={{ color: "var(--text-3)" }}>
          <RefreshCw size={13} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 22px 18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8 }}>
                {rows.map(([k, v]) => (
                  <motion.div key={k}
                    whileHover={{ background: "rgba(255,255,255,.04)" }}
                    style={{ padding: "8px 12px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", transition: "background .2s" }}
                  >
                    <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{k}</p>
                    <p style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-1)", wordBreak: "break-all" }}>{v}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── main export ────────────────────────────────────────────────────────────── */
export default function TelemetryPage({ telemetry, reports }) {
  const latest = reports[0];
  const buzzerActive = latest?.buzzerActive ?? false;

  return (
    <div style={{ padding: "clamp(16px,3vw,28px)", display: "flex", flexDirection: "column", gap: 20 }}>
      <motion.h2 initial={{ opacity:0,x:-20 }} animate={{ opacity:1,x:0 }}
        style={{ fontSize: 18, fontWeight: 800, color: "var(--text-1)" }}>Live Telemetry</motion.h2>

      {/* Gauges */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}
      >
        <ArcGauge value={telemetry.speed}          max={60}  label="Speed"       unit="km/h" color="var(--cyan)"   icon={Gauge}   />
        <ArcGauge value={latest?.ultrasonicCm ?? 30} max={50} label="Ultrasonic" unit="cm"   color="var(--amber)"  icon={Zap}     />
        <ArcGauge value={telemetry.signalStrength} max={100} label="Signal"      unit="%"    color="var(--green)"  icon={Wifi}    />
        <ArcGauge value={telemetry.batteryPct}     max={100} label="Battery"     unit="%"
          color={telemetry.batteryPct < 30 ? "var(--red)" : "var(--green)"} icon={Battery} />
      </motion.div>

      {/* Compass + Buzzer row */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}
      >
        <Compass heading={telemetry.heading} />
        <BuzzerCard active={buzzerActive} />
      </motion.div>

      {/* Raw sensor frame */}
      <motion.div variants={stagger} initial="hidden" animate="show">
        <RawFrame report={latest} />
      </motion.div>
    </div>
  );
}
