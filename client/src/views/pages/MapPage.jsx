/**
 * VIEW — MapPage
 * Full-screen Leaflet map with detection markers and live GPS trail.
 */
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const SEVERITY_COLORS = { CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#f5a623", LOW: "#22c55e" };

function makeIcon(color) {
  return L.divIcon({
    html: `<div style="
      width:20px;height:20px;border-radius:50%;
      background:${color};
      border:3px solid rgba(255,255,255,.6);
      box-shadow:0 0 12px ${color}80;
    "></div>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function gpsIcon() {
  return L.divIcon({
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:#06b6d4;
      border:3px solid #fff;
      box-shadow:0 0 16px #06b6d480, 0 0 32px #06b6d440;
      animation:pulse 2s infinite;
    "></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng]);
  return null;
}

export default function MapPage({ reports, telemetry }) {
  const trailPositions = reports.slice(0, 20).map(r => [r.latitude, r.longitude]).reverse();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      style={{ height: "calc(100vh - 56px)", display: "flex", flexDirection: "column", padding: "20px 28px 28px", gap: 16 }}
    >
      {/* Map header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)" }}>GPS Tracking Map</h2>
        <div style={{ display: "flex", gap: 10 }}>
          {Object.entries(SEVERITY_COLORS).map(([s, c]) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-3)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
              {s}
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-3)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#06b6d4" }} />
            LIVE GPS
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, borderRadius: "var(--r-xl)", overflow: "hidden", border: "1px solid var(--border)" }}>
        <MapContainer
          center={[telemetry.latitude, telemetry.longitude]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          <RecenterMap lat={telemetry.latitude} lng={telemetry.longitude} />

          {/* Live GPS */}
          <Marker position={[telemetry.latitude, telemetry.longitude]} icon={gpsIcon()}>
            <Popup>
              <div style={{ fontFamily: "var(--font-body)", minWidth: 160 }}>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>🛰 RailGuard Vehicle</p>
                <p style={{ fontSize: 12, color: "#94a3b8" }}>Speed: {telemetry.speed} km/h</p>
                <p style={{ fontSize: 12, color: "#94a3b8" }}>Heading: {telemetry.heading}°</p>
                <p style={{ fontSize: 12, color: "#94a3b8" }}>Battery: {telemetry.batteryPct}%</p>
              </div>
            </Popup>
          </Marker>

          {/* GPS trail */}
          {trailPositions.length > 1 && (
            <Polyline positions={trailPositions} pathOptions={{ color: "#06b6d4", weight: 2, opacity: 0.5, dashArray: "6 6" }} />
          )}

          {/* Detection markers */}
          {reports.slice(0, 30).map(r => (
            <Marker key={r.id} position={[r.latitude, r.longitude]} icon={makeIcon(SEVERITY_COLORS[r.severity] ?? "#f5a623")}>
              <Popup>
                <div style={{ fontFamily: "var(--font-body)", minWidth: 180 }}>
                  <p style={{ fontWeight: 700, marginBottom: 4, color: SEVERITY_COLORS[r.severity] }}>
                    {r.severity} — {r.type.replace("_", " ")}
                  </p>
                  <p style={{ fontSize: 11, color: "#94a3b8" }}>{r.corridor}</p>
                  <p style={{ fontSize: 11, color: "#94a3b8" }}>ID: {r.id}</p>
                  <p style={{ fontSize: 11, color: "#94a3b8" }}>Ultrasonic: {r.ultrasonicCm} cm</p>
                  <p style={{ fontSize: 11, color: "#94a3b8" }}>Confidence: {r.confidence}%</p>
                  <p style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(r.timestamp).toLocaleString("en-IN")}</p>
                </div>
              </Popup>
              {(r.severity === "CRITICAL" || r.severity === "HIGH") && (
                <Circle
                  center={[r.latitude, r.longitude]}
                  radius={120}
                  pathOptions={{ color: SEVERITY_COLORS[r.severity], fillColor: SEVERITY_COLORS[r.severity], fillOpacity: 0.08, weight: 1 }}
                />
              )}
            </Marker>
          ))}
        </MapContainer>
      </div>
    </motion.div>
  );
}
