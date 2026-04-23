/**
 * VIEW — Topbar
 * Sticky top header showing device status, GPS coordinates, RTDB connection, and user info.
 */
import { motion } from "framer-motion";
import { Battery, Gauge, Navigation, Shield, Database } from "lucide-react";

export default function Topbar({ telemetry, deviceOnline, rtdbConnected, user }) {
  const espColor  = deviceOnline  ? "var(--green)" : "var(--red)";
  const rtdbColor = rtdbConnected ? "var(--cyan)"  : "var(--text-3)";

  return (
    <motion.header
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass"
      style={{
        position: "sticky", top: 0, zIndex: 100,
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderRadius: 0,
      }}
    >
      {/* Left — device + RTDB status */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

        {/* ESP8266 online indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            style={{ width: 7, height: 7, borderRadius: "50%", background: espColor, flexShrink: 0 }}
          />
          <span style={{ fontSize: 11, fontWeight: 600, color: espColor, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {deviceOnline ? "ESP8266 Online" : "Device Offline"}
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: "var(--border)" }} />

        {/* Firebase RTDB status */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Database size={12} color={rtdbColor} />
          <span style={{ fontSize: 11, fontWeight: 600, color: rtdbColor, letterSpacing: "0.06em" }}>
            {rtdbConnected ? "RTDB Live" : "RTDB Connecting…"}
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: "var(--border)" }} />

        {/* GPS coordinates */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-3)", fontSize: 11 }}>
          <Navigation size={12} />
          <span style={{ fontFamily: "var(--font-mono)" }}>
            {telemetry.latitude.toFixed(5)}, {telemetry.longitude.toFixed(5)}
          </span>
          {telemetry.satellites > 0 && (
            <span style={{ color: "var(--green)", fontSize: 10, marginLeft: 2 }}>
              🛰 {telemetry.satellites}
            </span>
          )}
        </div>

        {/* Speed */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-3)", fontSize: 11 }}>
          <Gauge size={12} />
          <span style={{ fontFamily: "var(--font-mono)" }}>{telemetry.speed} km/h</span>
        </div>
      </div>

      {/* Right — battery + user */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-3)", fontSize: 11 }}>
          <Battery size={13} color={telemetry.batteryPct > 30 ? "var(--green)" : "var(--red)"} />
          <span style={{ fontFamily: "var(--font-mono)", color: telemetry.batteryPct > 30 ? "var(--green)" : "var(--red)" }}>
            {telemetry.batteryPct}%
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: "var(--border)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #f5a623, #ef4444)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff",
          }}>
            {user?.email?.[0]?.toUpperCase() ?? "R"}
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)", lineHeight: 1 }}>
              {user?.displayName ?? "Rail Operator"}
            </p>
            <p style={{ fontSize: 10, color: "var(--text-3)", lineHeight: 1.4 }}>Authorised Personnel</p>
          </div>
          <Shield size={13} color="var(--amber)" style={{ marginLeft: 2 }} />
        </div>
      </div>
    </motion.header>
  );
}
