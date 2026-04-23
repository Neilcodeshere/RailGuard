/**
 * MODEL — VehicleModel
 * Defines vehicle shapes and seed data written to Firebase on first load.
 */

export const VEHICLE_STATUS = { ONLINE: "ONLINE", OFFLINE: "OFFLINE", MAINTENANCE: "MAINTENANCE" };

/**
 * @typedef {Object} Vehicle
 * @property {string}  id          Firebase key (e.g. "RG-001")
 * @property {string}  name        Display name
 * @property {string}  type        "Inspection Bot" | "Track Scanner" | ...
 * @property {string}  status      ONLINE | OFFLINE | MAINTENANCE
 * @property {string}  corridor    Last known corridor
 * @property {number}  batteryPct
 * @property {string}  lastSeen    ISO timestamp
 * @property {string}  logPath     Firebase path for logs (relative, e.g. "/railway_logs/RG-001")
 * @property {string}  ctrlPath    Firebase path for control
 */

export const SEED_VEHICLES = [
  {
    id:         "RG-001",
    name:       "RailGuard Alpha",
    type:       "Inspection Bot",
    status:     "ONLINE",
    corridor:   "CST–Dadar Corridor",
    batteryPct: 87,
    lastSeen:   new Date().toISOString(),
    logPath:    "railway_logs/RG-001",
    ctrlPath:   "bot_control/RG-001",
    emoji:      "🚗",
  },
  {
    id:         "RG-002",
    name:       "RailGuard Beta",
    type:       "Track Scanner",
    status:     "OFFLINE",
    corridor:   "Andheri–Borivali Corridor",
    batteryPct: 42,
    lastSeen:   new Date(Date.now() - 3600000).toISOString(),
    logPath:    "railway_logs/RG-002",
    ctrlPath:   "bot_control/RG-002",
    emoji:      "🔍",
  },
  {
    id:         "RG-003",
    name:       "RailGuard Gamma",
    type:       "Weld Inspector",
    status:     "MAINTENANCE",
    corridor:   "Thane–Mulund Corridor",
    batteryPct: 0,
    lastSeen:   new Date(Date.now() - 86400000).toISOString(),
    logPath:    "railway_logs/RG-003",
    ctrlPath:   "bot_control/RG-003",
    emoji:      "⚡",
  },
];

export const STATUS_META = {
  ONLINE:      { color: "var(--green)", bg: "var(--green-lo)", label: "Online"      },
  OFFLINE:     { color: "var(--text-3)", bg: "rgba(255,255,255,.05)", label: "Offline" },
  MAINTENANCE: { color: "var(--amber)", bg: "var(--amber-lo)", label: "Maintenance" },
};
