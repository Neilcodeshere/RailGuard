/**
 * VIEW — StatCard v2
 * Animated metric tile with count-up number, sparkline bar,
 * interactive hover glow, and ripple click effect.
 */
import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

// Animated count-up number
function AnimatedNumber({ value, duration = 1.2 }) {
  const spring = useSpring(0, { stiffness: 80, damping: 22, duration });
  const display = useTransform(spring, (v) =>
    Number.isInteger(value) ? Math.round(v) : parseFloat(v.toFixed(1))
  );
  const [shown, setShown] = useState(0);

  useEffect(() => {
    spring.set(value);
    const unsub = display.on("change", (v) => setShown(v));
    return unsub;
  }, [value]);

  return <>{shown}</>;
}

// Mini sparkline (last 6 values faked from current)
function Sparkline({ value, max, color }) {
  const bars = [0.4, 0.6, 0.5, 0.75, 0.55, Math.min(value / max, 1)];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 24 }}>
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.6 + i * 0.06, duration: 0.4, ease: "backOut" }}
          style={{
            flex: 1,
            height: `${Math.max(h * 100, 15)}%`,
            background: i === bars.length - 1 ? color : `${color}55`,
            borderRadius: 3,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  );
}

export default function StatCard({
  icon: Icon, label, value, unit = "", accent = "amber", trend, delay = 0,
}) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const accentMap = {
    amber:  { color: "var(--amber)",  lo: "var(--amber-lo)",  glow: "rgba(245,166,35,.45)" },
    red:    { color: "var(--red)",    lo: "var(--red-lo)",    glow: "rgba(239,68,68,.45)" },
    green:  { color: "var(--green)",  lo: "var(--green-lo)",  glow: "rgba(34,197,94,.45)" },
    cyan:   { color: "var(--cyan)",   lo: "var(--cyan-lo)",   glow: "rgba(6,182,212,.40)" },
    purple: { color: "var(--purple)", lo: "var(--purple-lo)", glow: "rgba(139,92,246,.45)" },
  };
  const a = accentMap[accent] ?? accentMap.amber;
  const numericMax = { amber: 100, red: 20, green: 50, cyan: 100, purple: 100 }[accent] ?? 100;

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={handleClick}
      className="glass noise"
      style={{
        borderRadius: "var(--r-xl)",
        padding: "20px 22px 18px",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hovered ? `0 8px 40px ${a.glow}` : "none",
        transition: "box-shadow 0.35s",
        userSelect: "none",
      }}
    >
      {/* Animated top accent bar */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0.3, opacity: hovered ? 1 : 0.6 }}
        transition={{ duration: 0.35 }}
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${a.color}, ${a.color}80, transparent)`,
          borderRadius: "var(--r-xl) var(--r-xl) 0 0",
          transformOrigin: "left",
        }}
      />

      {/* Glow blob — expands on hover */}
      <motion.div
        animate={{ scale: hovered ? 1.5 : 1, opacity: hovered ? 0.9 : 0.5 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "absolute", top: -24, right: -24,
          width: 100, height: 100,
          background: a.lo,
          borderRadius: "50%",
          filter: "blur(22px)",
          pointerEvents: "none",
        }}
      />

      {/* Ripple on click */}
      {clicked && (
        <motion.div
          initial={{ scale: 0, opacity: 0.4 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute", inset: 0,
            background: a.lo,
            borderRadius: "50%",
            pointerEvents: "none",
            transformOrigin: "center",
          }}
        />
      )}

      {/* Icon + trend */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, position: "relative" }}>
        <motion.div
          animate={{ rotate: hovered ? 5 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            width: 42, height: 42, borderRadius: "var(--r-md)",
            background: a.lo,
            border: `1px solid ${a.color}35`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: hovered ? `0 0 14px ${a.glow}` : "none",
            transition: "box-shadow 0.3s",
          }}
        >
          {Icon && <Icon size={19} color={a.color} strokeWidth={2.2} />}
        </motion.div>
        {trend !== undefined && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.4 }}
            style={{
              fontSize: 11, fontWeight: 700,
              color: trend >= 0 ? "var(--green)" : "var(--red)",
              background: trend >= 0 ? "var(--green-lo)" : "var(--red-lo)",
              padding: "2px 7px", borderRadius: 99,
              border: `1px solid ${trend >= 0 ? "rgba(34,197,94,.2)" : "rgba(239,68,68,.2)"}`,
            }}
          >
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </motion.span>
        )}
      </div>

      {/* Label */}
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--text-3)", marginBottom: 5,
      }}>
        {label}
      </p>

      {/* Number */}
      <p style={{
        fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
        fontWeight: 800, letterSpacing: "-0.04em",
        lineHeight: 1, color: a.color,
        marginBottom: 14,
      }}>
        <AnimatedNumber value={typeof value === "number" ? value : 0} />
        {unit && <span style={{ fontSize: "0.42em", fontWeight: 600, color: "var(--text-3)", marginLeft: 4 }}>{unit}</span>}
      </p>

      {/* Sparkline */}
      <Sparkline value={typeof value === "number" ? value : 0} max={numericMax} color={a.color} />
    </motion.div>
  );
}
