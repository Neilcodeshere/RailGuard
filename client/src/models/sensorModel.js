/**
 * MODEL — SensorModel
 * Defines the shape of all sensor data, provides mock generators,
 * and exports a parser to normalise raw Firebase RTDB payloads from
 * the ESP8266 firmware into the internal SensorReport shape.
 *
 * ESP8266 Firebase paths
 * ──────────────────────
 *   /railway_logs  – pushJSON  { distance, latitude?, longitude?, satellites?, location? }
 *   /bot_control   – setInt    0 | 1
 */

// ── Railway corridors (fallback when GPS fix not yet acquired) ──
const RAIL_CORRIDORS = [
  { lat: 19.0760, lng: 72.8777, name: "CST–Dadar Corridor" },
  { lat: 19.0178, lng: 72.8478, name: "Dadar–Kurla Corridor" },
  { lat: 19.1136, lng: 72.8697, name: "Andheri–Borivali Corridor" },
  { lat: 18.9696, lng: 72.8395, name: "Thane–Mulund Corridor" },
  { lat: 19.2183, lng: 72.9781, name: "Virar–Vasai Corridor" },
];

const SEVERITY_LEVELS    = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const DETECTION_TYPES    = ["CRACK", "OBSTACLE", "WELD_DEFECT", "SURFACE_DAMAGE", "FOREIGN_OBJECT"];

function randomBetween(min, max) { return Math.random() * (max - min) + min; }
function jitter(coord, amount = 0.005) { return coord + (Math.random() - 0.5) * amount; }

let _idCounter = 1000;

// ─────────────────────────────────────────────────────────────────────────────
// parseSeverityFromDistance
// Maps the ESP8266 ultrasonic reading to a severity level.
//   ≤ 5 cm  → CRITICAL (extremely close, immediate danger)
//   ≤ 10 cm → HIGH
//   ≤ 25 cm → MEDIUM
//   > 25 cm → LOW
// ─────────────────────────────────────────────────────────────────────────────
function parseSeverityFromDistance(distanceCm) {
  if (distanceCm <= 5)  return "CRITICAL";
  if (distanceCm <= 10) return "HIGH";
  if (distanceCm <= 25) return "MEDIUM";
  return "LOW";
}

// ─────────────────────────────────────────────────────────────────────────────
// parseFirebaseLog
// Converts a raw Firebase RTDB log entry (from ESP8266 pushJSON) into
// the internal SensorReport shape expected by every View component.
//
// @param {string} key          Firebase push key (e.g. "-NxAbCdEfGh")
// @param {object} payload      Raw Firebase value object
// @returns {SensorReport}
// ─────────────────────────────────────────────────────────────────────────────
export function parseFirebaseLog(key, payload) {
  const distCm      = parseFloat(payload.distance ?? 999);
  const severity    = parseSeverityFromDistance(distCm);
  const hasGps      = typeof payload.latitude === "number" && typeof payload.longitude === "number";

  // Derive corridor name from GPS or fall back to searching message
  const fallbackCorridor = payload.location ?? "Searching for Satellites…";
  const corridor = hasGps
    ? nearestCorridor(payload.latitude, payload.longitude)
    : fallbackCorridor;

  return {
    // Use Firebase push key as the unique ID (deterministic, no collision)
    id:           key,
    type:         distCm <= 10 ? "OBSTACLE" : "SURFACE_DAMAGE",
    severity,
    latitude:     hasGps ? payload.latitude  : jitter(19.0760, 0.05),
    longitude:    hasGps ? payload.longitude : jitter(72.8777, 0.05),
    corridor,
    ultrasonicCm: parseFloat(distCm.toFixed(1)),
    speed:        parseFloat(randomBetween(8, 30).toFixed(1)), // ESP8266 doesn't send speed yet
    confidence:   parseFloat(randomBetween(82, 99).toFixed(1)),
    satellites:   payload.satellites ?? 0,
    buzzerActive: severity === "HIGH" || severity === "CRITICAL",
    timestamp:    payload.timestamp ?? new Date().toISOString(),
    source:       "firebase", // distinguish from mock
  };
}

/** Find the nearest named corridor to a lat/lng pair. */
function nearestCorridor(lat, lng) {
  let best = RAIL_CORRIDORS[0], bestDist = Infinity;
  for (const c of RAIL_CORRIDORS) {
    const d = Math.hypot(c.lat - lat, c.lng - lng);
    if (d < bestDist) { bestDist = d; best = c; }
  }
  return best.name;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock generators (used as seed / fallback when Firebase has no data yet)
// ─────────────────────────────────────────────────────────────────────────────
export function createSensorReport(overrides = {}) {
  const corridor  = RAIL_CORRIDORS[Math.floor(Math.random() * RAIL_CORRIDORS.length)];
  const severity  = SEVERITY_LEVELS[Math.floor(Math.random() * SEVERITY_LEVELS.length)];
  const type      = DETECTION_TYPES[Math.floor(Math.random() * DETECTION_TYPES.length)];
  const ultrasonicCm = randomBetween(2, 45);
  const confidence   = randomBetween(72, 99.9);

  return {
    id:           `MOCK-${++_idCounter}`,
    type,
    severity,
    latitude:     jitter(corridor.lat),
    longitude:    jitter(corridor.lng),
    corridor:     corridor.name,
    ultrasonicCm: parseFloat(ultrasonicCm.toFixed(1)),
    speed:        parseFloat(randomBetween(8, 35).toFixed(1)),
    confidence:   parseFloat(confidence.toFixed(1)),
    satellites:   0,
    buzzerActive: severity === "HIGH" || severity === "CRITICAL",
    timestamp:    new Date().toISOString(),
    source:       "mock",
    ...overrides,
  };
}

export function getInitialReports(count = 8) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) =>
    createSensorReport({
      timestamp: new Date(now - i * 1000 * 60 * randomBetween(2, 20)).toISOString(),
    })
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/** GPS telemetry snapshot (mock / fallback) */
export function createGpsTelemetry(overrides = {}) {
  const corridor = RAIL_CORRIDORS[Math.floor(Math.random() * RAIL_CORRIDORS.length)];
  return {
    latitude:       jitter(corridor.lat, 0.002),
    longitude:      jitter(corridor.lng, 0.002),
    corridor:       corridor.name,
    speed:          parseFloat(randomBetween(8, 38).toFixed(1)),
    heading:        parseFloat(randomBetween(0, 360).toFixed(1)),
    batteryPct:     parseFloat(randomBetween(55, 98).toFixed(1)),
    signalStrength: Math.floor(randomBetween(60, 100)),
    satellites:     0,
    timestamp:      new Date().toISOString(),
    ...overrides,
  };
}
