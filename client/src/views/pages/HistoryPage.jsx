/**
 * VIEW — HistoryPage
 * Full sortable/filterable log of all sensor reports.
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Download, ChevronDown, ChevronUp } from "lucide-react";

const SEV_COLORS = { CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#f5a623", LOW: "#22c55e" };
const TYPE_ICONS = { CRACK: "🔍", OBSTACLE: "🚧", WELD_DEFECT: "⚡", SURFACE_DAMAGE: "🪨", FOREIGN_OBJECT: "📦" };

function exportCSV(reports) {
  const headers = ["ID", "Type", "Severity", "Corridor", "Latitude", "Longitude", "Ultrasonic(cm)", "Speed(km/h)", "Confidence%", "Buzzer", "Timestamp"];
  const rows = reports.map(r => [
    r.id, r.type, r.severity, r.corridor,
    r.latitude.toFixed(6), r.longitude.toFixed(6),
    r.ultrasonicCm, r.speed, r.confidence,
    r.buzzerActive ? "Yes" : "No",
    new Date(r.timestamp).toISOString(),
  ]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `railguard_log_${Date.now()}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export default function HistoryPage({ reports }) {
  const [search, setSearch]         = useState("");
  const [sevFilter, setSevFilter]   = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortDir, setSortDir]       = useState("desc");

  const severities  = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const types       = ["ALL", "CRACK", "OBSTACLE", "WELD_DEFECT", "SURFACE_DAMAGE", "FOREIGN_OBJECT"];

  const filtered = useMemo(() => {
    return reports
      .filter(r => {
        const q = search.toLowerCase();
        return (
          (sevFilter  === "ALL" || r.severity === sevFilter) &&
          (typeFilter === "ALL" || r.type     === typeFilter) &&
          (
            r.id.toLowerCase().includes(q) ||
            r.corridor.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q)
          )
        );
      })
      .sort((a, b) => {
        const diff = new Date(b.timestamp) - new Date(a.timestamp);
        return sortDir === "desc" ? diff : -diff;
      });
  }, [reports, search, sevFilter, typeFilter, sortDir]);

  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)" }}>History Log</h2>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => exportCSV(filtered)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px",
            background: "var(--amber-lo)",
            border: "1px solid rgba(245,166,35,.3)",
            borderRadius: "var(--r-md)",
            cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--amber)",
          }}
        >
          <Download size={13} /> Export CSV
        </motion.button>
      </div>

      {/* Filters */}
      <div className="glass" style={{ borderRadius: "var(--r-xl)", padding: "14px 18px", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ID, corridor, type…"
            style={{
              width: "100%", padding: "8px 10px 8px 32px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              color: "var(--text-1)", fontSize: 12,
            }}
          />
        </div>

        {/* Severity filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {severities.map(s => (
            <button key={s} onClick={() => setSevFilter(s)} style={{
              padding: "5px 10px",
              background: sevFilter === s ? (SEV_COLORS[s] ? `${SEV_COLORS[s]}22` : "var(--amber-lo)") : "transparent",
              border: `1px solid ${sevFilter === s ? (SEV_COLORS[s] ?? "var(--amber)") + "55" : "var(--border)"}`,
              borderRadius: 99, cursor: "pointer", fontSize: 11, fontWeight: 600,
              color: sevFilter === s ? (SEV_COLORS[s] ?? "var(--amber)") : "var(--text-3)",
              transition: "all 0.2s",
            }}>
              {s}
            </button>
          ))}
        </div>

        {/* Sort */}
        <button
          onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "5px 10px",
            background: "rgba(255,255,255,.04)",
            border: "1px solid var(--border)",
            borderRadius: 99, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "var(--text-3)",
          }}
        >
          {sortDir === "desc" ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          {sortDir === "desc" ? "Newest" : "Oldest"}
        </button>
      </div>

      {/* Count */}
      <p style={{ fontSize: 12, color: "var(--text-3)" }}>
        Showing <b style={{ color: "var(--text-2)" }}>{filtered.length}</b> of {reports.length} records
      </p>

      {/* Table */}
      <motion.div
        className="glass noise"
        style={{ borderRadius: "var(--r-xl)", overflow: "hidden" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ overflowX: "auto" }}>
          <table className="rg-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                {["ID", "Type", "Severity", "Corridor", "Ultrasonic", "Speed", "Confidence", "Buzzer", "Time"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: Math.min(i * 0.015, 0.3) }}
                  >
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)" }}>{r.id}</span>
                    </td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {TYPE_ICONS[r.type] ?? "🔔"}
                        <span>{r.type.replace("_", " ")}</span>
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                        background: `${SEV_COLORS[r.severity] ?? "#f5a623"}22`,
                        color: SEV_COLORS[r.severity] ?? "var(--amber)",
                        border: `1px solid ${SEV_COLORS[r.severity] ?? "var(--amber)"}33`,
                      }}>
                        {r.severity}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{r.corridor}</td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{r.ultrasonicCm} cm</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{r.speed} km/h</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                          flex: 1, maxWidth: 60, height: 4,
                          background: "rgba(255,255,255,.08)",
                          borderRadius: 99, overflow: "hidden",
                        }}>
                          <div style={{ width: `${r.confidence}%`, height: "100%", background: "var(--cyan)", borderRadius: 99 }} />
                        </div>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{r.confidence}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: "2px 7px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                        background: r.buzzerActive ? "var(--red-lo)" : "var(--green-lo)",
                        color: r.buzzerActive ? "var(--red)" : "var(--green)",
                      }}>
                        {r.buzzerActive ? "🔊 ON" : "OFF"}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, whiteSpace: "nowrap" }}>
                      {new Date(r.timestamp).toLocaleString("en-IN", { hour12: false })}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
