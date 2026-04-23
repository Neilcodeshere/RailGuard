/**
 * VIEW — MapPage
 * Full-screen Leaflet map with detection markers and live GPS trail.
 */
import { useEffect } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Radio, Zap } from "lucide-react";

// Fix default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const SEVERITY_COLORS = { CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#f59e0b", LOW: "#10b981" };

function makeIcon(color) {
  return L.divIcon({
    html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:${color};
      border:2.5px solid rgba(255,255,255,0.7);
      box-shadow:0 0 14px ${color}90, 0 0 6px ${color}60;
    "></div>`,
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function gpsIcon() {
  return L.divIcon({
    html: `<div style="position:relative;width:22px;height:22px;display:flex;align-items:center;justify-content:center;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(6,182,212,0.25);
        animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;
      "></div>
      <div style="
        width:13px;height:13px;border-radius:50%;
        background:#06b6d4;
        border:2.5px solid #fff;
        box-shadow:0 0 18px #06b6d490;
        position:relative;z-index:1;
      "></div>
    </div>
    <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>`,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], map.getZoom());
  }, [lat, lng]);
  return null;
}

function StatPill({ icon, label, value, color = "var(--text-2)" }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      padding: "7px 14px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 999,
    }}>
      <span style={{ color }}>{icon}</span>
      <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, color, fontWeight: 700 }}>{value}</span>
    </div>
  );
}

export default function MapPage({ reports, telemetry }) {
  const trailPositions = reports
    .slice(0, 25)
    .map(r => [r.latitude, r.longitude])
    .filter(([a, b]) => a && b)
    .reverse();

  const critCount = reports.filter(r => r.severity === "CRITICAL" || r.severity === "HIGH").length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "20px 24px 24px",
        gap: 14,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em" }}>
            GPS Tracking Map
          </h2>
          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
            Live vehicle position · {reports.length} detections plotted
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <StatPill icon={<Navigation size={12} />} label="Speed" value={`${telemetry.speed} km/h`} color="var(--cyan)" />
          <StatPill icon={<Radio size={12} />} label="GPS" value={`${telemetry.satellites ?? 0} sats`} color="var(--green)" />
          <StatPill icon={<Zap size={12} />} label="Critical" value={critCount} color={critCount > 0 ? "var(--red)" : "var(--text-3)"} />
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
        {Object.entries(SEVERITY_COLORS).map(([s, c]) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` }} />
            <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.06em" }}>{s}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#06b6d4", boxShadow: "0 0 6px #06b6d4" }} />
          <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.06em" }}>LIVE GPS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 20, height: 2, background: "#06b6d4", opacity: 0.5, borderRadius: 99 }} />
          <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.06em" }}>TRAIL</span>
        </div>
      </div>

      {/* Map container */}
      <div style={{
        flex: 1,
        borderRadius: "var(--r-xl)",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        minHeight: 0,
      }}>
        <MapContainer
          center={[telemetry.latitude, telemetry.longitude]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          <RecenterMap lat={telemetry.latitude} lng={telemetry.longitude} />

          {/* Live GPS marker */}
          <Marker position={[telemetry.latitude, telemetry.longitude]} icon={gpsIcon()}>
            <Popup>
              <div style={{ fontFamily: "var(--font-body)", minWidth: 170 }}>
                <p style={{ fontWeight: 800, marginBottom: 6, fontSize: 13 }}>🛰 RailGuard Vehicle</p>
                <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>Speed: <b style={{ color: "#06b6d4" }}>{telemetry.speed} km/h</b></p>
                <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>Battery: <b style={{ color: "#10b981" }}>{telemetry.batteryPct}%</b></p>
                <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>Corridor: {telemetry.corridor}</p>
                <p style={{ fontSize: 10, color: "#475569", marginTop: 6 }}>{new Date(telemetry.timestamp).toLocaleTimeString("en-IN")}</p>
              </div>
            </Popup>
          </Marker>

          {/* GPS trail */}
          {trailPositions.length > 1 && (
            <Polyline
              positions={trailPositions}
              pathOptions={{ color: "#06b6d4", weight: 2.5, opacity: 0.55, dashArray: "8 6" }}
            />
          )}

          {/* Detection markers */}
          {reports.slice(0, 40).map(r => (
            <Marker key={r.id} position={[r.latitude, r.longitude]} icon={makeIcon(SEVERITY_COLORS[r.severity] ?? "#f59e0b")}>
              <Popup>
                <div style={{ fontFamily: "var(--font-body)", minWidth: 190 }}>
                  <p style={{ fontWeight: 800, marginBottom: 5, color: SEVERITY_COLORS[r.severity], fontSize: 13 }}>
                    {r.severity} — {r.type.replace(/_/g, " ")}
                  </p>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{r.corridor}</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>ID: {r.id}</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>Distance: {r.ultrasonicCm} cm</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>Confidence: {r.confidence}%</p>
                  <p style={{ fontSize: 10, color: "#475569", marginTop: 6 }}>{new Date(r.timestamp).toLocaleString("en-IN")}</p>
                </div>
              </Popup>
              {(r.severity === "CRITICAL" || r.severity === "HIGH") && (
                <Circle
                  center={[r.latitude, r.longitude]}
                  radius={100}
                  pathOptions={{
                    color: SEVERITY_COLORS[r.severity],
                    fillColor: SEVERITY_COLORS[r.severity],
                    fillOpacity: 0.08,
                    weight: 1.5,
                    dashArray: "4 4",
                  }}
                />
              )}
            </Marker>
          ))}
        </MapContainer>
      </div>
    </motion.div>
  );
}
