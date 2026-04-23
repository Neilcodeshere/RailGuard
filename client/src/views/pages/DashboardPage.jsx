/**
 * VIEW — DashboardPage v3 — Responsive + Heavily Animated
 */
import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Activity, AlertTriangle, CheckCircle, TrendingUp,
  Zap, Radio, Cpu, Play, Square, Wifi, WifiOff,
  ChevronRight, Signal, Satellite,
} from "lucide-react";
import StatCard from "../components/StatCard";

/* ── constants ─────────────────────────────────────────────────────────────── */
const SEV = {
  CRITICAL: { color: "var(--red)",   bg: "var(--red-lo)",        glow: "rgba(239,68,68,.25)" },
  HIGH:     { color: "#f97316",      bg: "rgba(249,115,22,.12)", glow: "rgba(249,115,22,.22)" },
  MEDIUM:   { color: "var(--amber)", bg: "var(--amber-lo)",      glow: "var(--amber-glow)" },
  LOW:      { color: "var(--green)", bg: "var(--green-lo)",      glow: "rgba(34,197,94,.18)" },
};
const TYPE_ICONS = {
  CRACK: "🔍", OBSTACLE: "🚧", WELD_DEFECT: "⚡",
  SURFACE_DAMAGE: "🪨", FOREIGN_OBJECT: "📦",
};

/* ── stagger container ─────────────────────────────────────────────────────── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* ── animated progress bar ─────────────────────────────────────────────────── */
function BarRow({ label, value, max = 100, color, suffix = "" }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color, fontWeight: 700 }}>{value}{suffix}</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,.07)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: "100%", background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

/* ── bot control ────────────────────────────────────────────────────────────── */
function BotControl({ botRunning, startBot, stopBot, rtdbConnected }) {
  const [pressing, setPressing] = useState(null);

  const doStart = () => { setPressing("start"); startBot(); setTimeout(() => setPressing(null), 800); };
  const doStop  = () => { setPressing("stop");  stopBot();  setTimeout(() => setPressing(null), 800); };

  return (
    <motion.div variants={fadeUp} className="glass noise"
      style={{
        borderRadius: "var(--r-xl)", padding: "22px",
        border: botRunning ? "1px solid rgba(34,197,94,.3)" : "1px solid var(--border)",
        boxShadow: botRunning ? "0 0 32px rgba(34,197,94,.12)" : "none",
        transition: "border-color .4s, box-shadow .4s",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Cpu size={15} color="var(--cyan)" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Bot Command</span>
        </div>
        <motion.span
          animate={{ opacity: rtdbConnected ? 1 : 0.5 }}
          style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
            background: rtdbConnected ? "var(--cyan-lo)" : "rgba(255,255,255,.04)",
            color: rtdbConnected ? "var(--cyan)" : "var(--text-3)",
            border: `1px solid ${rtdbConnected ? "rgba(6,182,212,.25)" : "var(--border)"}`,
            display: "flex", alignItems: "center", gap: 5,
          }}
        >
          {rtdbConnected ? <Wifi size={9}/> : <WifiOff size={9}/>}
          {rtdbConnected ? "Firebase Live" : "Connecting…"}
        </motion.span>
      </div>

      {/* status strip */}
      <motion.div
        animate={{
          background: botRunning ? "rgba(34,197,94,.08)" : "rgba(255,255,255,.03)",
          borderColor: botRunning ? "rgba(34,197,94,.22)" : "var(--border)",
        }}
        style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 18,
          padding: "10px 14px", borderRadius: "var(--r-md)", border: "1px solid",
        }}
      >
        <motion.div
          animate={botRunning
            ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }
            : { scale: 1, opacity: 0.4 }}
          transition={{ repeat: Infinity, duration: 1.1 }}
          style={{ width: 8, height: 8, borderRadius: "50%", background: botRunning ? "var(--green)" : "#475569", flexShrink: 0 }}
        />
        <span style={{ fontSize: 13, fontWeight: 600, color: botRunning ? "var(--green)" : "var(--text-3)" }}>
          {botRunning ? "🚗  Vehicle MOVING on track" : "⏹  Vehicle STOPPED / Standby"}
        </span>
      </motion.div>

      {/* buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { key: "start", label: "START", icon: Play,   disabled: botRunning || !rtdbConnected,
            bg: "linear-gradient(135deg,#22c55e,#16a34a)", glow: "rgba(34,197,94,.35)", action: doStart },
          { key: "stop",  label: "STOP",  icon: Square, disabled: !botRunning || !rtdbConnected,
            bg: "linear-gradient(135deg,#ef4444,#dc2626)", glow: "rgba(239,68,68,.35)", action: doStop },
        ].map(({ key, label, icon: Ic, disabled, bg, glow, action }) => (
          <motion.button
            key={key}
            whileHover={disabled ? {} : { scale: 1.04, boxShadow: `0 6px 24px ${glow}` }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            animate={pressing === key ? { scale: [1, 0.93, 1] } : {}}
            disabled={disabled}
            onClick={action}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "12px 0",
              background: disabled ? "rgba(255,255,255,.04)" : bg,
              border: `1px solid ${disabled ? "var(--border)" : "transparent"}`,
              borderRadius: "var(--r-md)",
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: 13, fontWeight: 800, color: disabled ? "var(--text-3)" : "#fff",
              letterSpacing: "0.06em",
              transition: "background .25s, opacity .25s",
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <Ic size={13} /> {label}
          </motion.button>
        ))}
      </div>

      <p style={{ fontSize: 10, color: "var(--text-3)", textAlign: "center", marginTop: 12 }}>
        Writes to <code style={{ color: "var(--cyan)" }}>/bot_control</code> → ESP8266 acts instantly
      </p>
    </motion.div>
  );
}

/* ── live waveform (ultrasonic visualiser) ─────────────────────────────────── */
function UltrasonicWave({ value }) {
  const color = value <= 10 ? "var(--red)" : value <= 25 ? "var(--amber)" : "var(--green)";
  const intensity = 1 - Math.min(value / 50, 1);
  const bars = 20;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Ultrasonic Distance</span>
        <motion.span
          key={value}
          initial={{ scale: 1.3, color: "#fff" }}
          animate={{ scale: 1, color }}
          style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700 }}
        >
          {value} cm
        </motion.span>
      </div>
      {/* wave bars */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, height: 36, marginBottom: 8 }}>
        {Array.from({ length: bars }, (_, i) => {
          const mid = bars / 2;
          const dist = Math.abs(i - mid) / mid;
          const h = (1 - dist) * intensity * 100;
          return (
            <motion.div
              key={i}
              animate={{ scaleY: [1, 1 + h * 0.04, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 + dist * 0.4, delay: dist * 0.1, ease: "easeInOut" }}
              style={{
                flex: 1, height: `${Math.max(h * 0.8 + 15, 12)}%`,
                background: `${color}${Math.round((1 - dist * 0.6) * 255).toString(16).padStart(2, "0")}`,
                borderRadius: 3, transformOrigin: "center",
              }}
            />
          );
        })}
      </div>
      {/* progress bar */}
      <div style={{ height: 5, background: "rgba(255,255,255,.07)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div
          animate={{ width: `${Math.min((value / 50) * 100, 100)}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

/* ── report row ─────────────────────────────────────────────────────────────── */
function ReportRow({ report, index, onClick, selected }) {
  const sev = SEV[report.severity] ?? SEV.LOW;
  const isLatest = index === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -24, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.97 }}
      transition={{ delay: index * 0.035, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,.045)" }}
      onClick={() => onClick(report)}
      style={{
        display: "grid",
        gridTemplateColumns: "38px 1fr auto auto auto",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: "var(--r-md)",
        background: selected ? `${sev.color}12` : "rgba(255,255,255,.025)",
        border: `1px solid ${selected ? sev.color + "40" : isLatest ? sev.color + "25" : "transparent"}`,
        boxShadow: isLatest ? `0 0 18px ${sev.glow}` : "none",
        cursor: "pointer",
        transition: "background .18s, border-color .18s",
      }}
    >
      {/* icon */}
      <motion.div
        whileHover={{ scale: 1.15, rotate: 5 }}
        style={{
          width: 38, height: 38, borderRadius: 10,
          background: sev.bg, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17, flexShrink: 0,
          border: `1px solid ${sev.color}20`,
        }}
      >
        {TYPE_ICONS[report.type] ?? "🔔"}
      </motion.div>

      {/* info */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {report.type.replace(/_/g, " ")}
          </p>
          {isLatest && report.source === "firebase" && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              style={{ fontSize: 9, fontWeight: 800, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}
            >● LIVE</motion.span>
          )}
        </div>
        <p style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {report.corridor}
          {report.satellites > 0 && <span style={{ marginLeft: 6, color: "var(--cyan)" }}>🛰 {report.satellites}</span>}
        </p>
      </div>

      {/* distance */}
      <motion.span
        key={report.ultrasonicCm}
        initial={{ y: -6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: report.ultrasonicCm <= 10 ? "var(--red)" : "var(--text-3)", flexShrink: 0 }}
      >
        {report.ultrasonicCm}cm
      </motion.span>

      {/* severity pill */}
      <span style={{
        padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 800,
        background: sev.bg, color: sev.color,
        border: `1px solid ${sev.color}25`,
        flexShrink: 0, letterSpacing: "0.05em",
      }}>
        {report.severity}
      </span>

      {/* chevron */}
      <motion.div animate={{ x: selected ? 3 : 0 }} style={{ color: "var(--text-3)", flexShrink: 0 }}>
        <ChevronRight size={14} />
      </motion.div>
    </motion.div>
  );
}

/* ── detail drawer (expanded report) ───────────────────────────────────────── */
function DetailDrawer({ report, onClose }) {
  if (!report) return null;
  const sev = SEV[report.severity] ?? SEV.LOW;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ overflow: "hidden" }}
    >
      <div style={{
        margin: "0 0 8px", padding: "16px 18px",
        background: `linear-gradient(135deg, ${sev.bg}, rgba(255,255,255,.02))`,
        border: `1px solid ${sev.color}25`,
        borderRadius: "var(--r-lg)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: sev.color }}>{report.type.replace(/_/g, " ")}</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            ["ID",          report.id],
            ["Severity",    report.severity],
            ["Corridor",    report.corridor],
            ["Distance",    `${report.ultrasonicCm} cm`],
            ["Latitude",    report.latitude?.toFixed(5)],
            ["Longitude",   report.longitude?.toFixed(5)],
            ["Confidence",  `${report.confidence}%`],
            ["Buzzer",      report.buzzerActive ? "🔊 Triggered" : "Silent"],
            ["Source",      report.source === "firebase" ? "🔴 Firebase" : "Mock"],
            ["Time",        new Date(report.timestamp).toLocaleString("en-IN")],
          ].map(([k, v]) => (
            <div key={k}>
              <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{k}</p>
              <p style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-1)" }}>{v}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── main page ──────────────────────────────────────────────────────────────── */
export default function DashboardPage({
  reports, stats, telemetry, deviceOnline, rtdbConnected, botRunning, startBot, stopBot,
}) {
  const [selected, setSelected] = useState(null);
  const latest = reports.slice(0, 10);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const toggle = (r) => setSelected(prev => prev?.id === r.id ? null : r);

  return (
    <div ref={ref} style={{ padding: "clamp(16px,3vw,28px)", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Stat cards ── */}
      <motion.div
        variants={stagger} initial="hidden" animate={inView ? "show" : "hidden"}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}
      >
        <motion.div variants={fadeUp}><StatCard icon={Activity}      label="Total Detections" value={stats.total}         accent="amber" /></motion.div>
        <motion.div variants={fadeUp}><StatCard icon={AlertTriangle} label="Critical / High"  value={stats.critical}      accent="red"   /></motion.div>
        <motion.div variants={fadeUp}><StatCard icon={CheckCircle}   label="Today's Events"  value={stats.today}         accent="green" /></motion.div>
        <motion.div variants={fadeUp}><StatCard icon={TrendingUp}    label="Avg Confidence"  value={stats.avgConfidence} unit="%" accent="cyan" /></motion.div>
      </motion.div>

      {/* ── Second row: Bot + Sensors + Last alert ── */}
      <motion.div
        variants={stagger} initial="hidden" animate={inView ? "show" : "hidden"}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}
      >
        {/* Bot Control */}
        <BotControl botRunning={botRunning} startBot={startBot} stopBot={stopBot} rtdbConnected={rtdbConnected} />

        {/* Sensor readings */}
        <motion.div variants={fadeUp} className="glass noise" style={{ borderRadius: "var(--r-xl)", padding: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Zap size={15} color="var(--amber)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Sensor Readings</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <UltrasonicWave value={reports[0]?.ultrasonicCm ?? 25} />
            <BarRow label="Vehicle Speed"    value={telemetry.speed}          max={60}  color="var(--cyan)"  suffix=" km/h" />
            <BarRow label="Signal Strength"  value={telemetry.signalStrength} max={100} color={telemetry.signalStrength > 70 ? "var(--green)" : "var(--amber)"} suffix="%" />
            <BarRow label="Battery"          value={telemetry.batteryPct}     max={100} color={telemetry.batteryPct > 30 ? "var(--green)" : "var(--red)"} suffix="%" />
          </div>
        </motion.div>

        {/* Last alert card */}
        <motion.div variants={fadeUp} className="glass noise"
          style={{
            borderRadius: "var(--r-xl)", padding: "22px",
            border: reports[0]?.buzzerActive ? "1px solid rgba(239,68,68,.3)" : "1px solid var(--border)",
            boxShadow: reports[0]?.buzzerActive ? "0 0 28px rgba(239,68,68,.12)" : "none",
            transition: "border-color .4s, box-shadow .4s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Radio size={15} color="var(--cyan)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Latest Alert</span>
            {reports[0]?.buzzerActive && (
              <motion.span animate={{ scale: [1,1.2,1] }} transition={{ repeat: Infinity, duration: 0.7 }}
                style={{ fontSize: 14 }}>🔊</motion.span>
            )}
          </div>
          {reports[0] ? (
            <AnimatePresence mode="wait">
              <motion.div key={reports[0].id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <p style={{ fontSize: 22, fontWeight: 800, color: SEV[reports[0].severity]?.color ?? "var(--amber)", marginBottom: 6 }}>
                  {reports[0].type.replace(/_/g, " ")}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>{reports[0].corridor}</p>
                <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-2)", marginBottom: 4 }}>
                  📡 {reports[0].latitude?.toFixed(5)}, {reports[0].longitude?.toFixed(5)}
                </p>
                <p style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: reports[0].ultrasonicCm <= 10 ? "var(--red)" : "var(--amber)", marginBottom: 10 }}>
                  Ultrasonic: {reports[0].ultrasonicCm} cm
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                    background: SEV[reports[0].severity]?.bg, color: SEV[reports[0].severity]?.color,
                    border: `1px solid ${SEV[reports[0].severity]?.color}25` }}>
                    {reports[0].severity}
                  </span>
                  <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                    background: reports[0].source === "firebase" ? "var(--green-lo)" : "var(--amber-lo)",
                    color: reports[0].source === "firebase" ? "var(--green)" : "var(--amber)" }}>
                    {reports[0].source === "firebase" ? "🔴 Firebase" : "Mock"}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>No alerts yet</p>
          )}
        </motion.div>
      </motion.div>

      {/* ── Live detection feed ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="glass noise"
        style={{ borderRadius: "var(--r-xl)", padding: "20px 22px" }}
      >
        {/* feed header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}>
              <Activity size={16} color="var(--amber)" />
            </motion.div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-1)" }}>Live Detection Feed</h3>
            {rtdbConnected && (
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 99,
                  background: "var(--green-lo)", color: "var(--green)",
                  border: "1px solid rgba(34,197,94,.25)", textTransform: "uppercase", letterSpacing: "0.08em" }}
              >● RTDB</motion.span>
            )}
          </div>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>
            {latest.length} / {reports.length} events
          </span>
        </div>

        {/* rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <AnimatePresence initial={false}>
            {latest.map((r, i) => (
              <div key={r.id}>
                <ReportRow report={r} index={i} onClick={toggle} selected={selected?.id === r.id} />
                <AnimatePresence>
                  {selected?.id === r.id && <DetailDrawer key="drawer" report={selected} onClose={() => setSelected(null)} />}
                </AnimatePresence>
              </div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

    </div>
  );
}
