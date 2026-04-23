/**
 * VIEW — HistoryPage
 * Full sortable/filterable log of all sensor reports.
 * Uses toast instead of alert() for non-blocking UX.
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Download, ChevronDown, ChevronUp, 
  MessageSquare, RefreshCw, CheckCircle, 
  ExternalLink 
} from "lucide-react";
import { sendWhatsAppSummary } from "../../controllers/whatsappController";
import { useToast } from "../../contexts/ToastContext";

const SEV_COLORS = { 
  CRITICAL: "#ef4444", 
  HIGH:     "#f97316", 
  MEDIUM:   "#f59e0b", 
  LOW:      "#10b981" 
};

const TYPE_ICONS = { 
  CRACK:          "🔍", 
  OBSTACLE:       "🚧", 
  WELD_DEFECT:    "⚡", 
  SURFACE_DAMAGE: "🪨", 
  FOREIGN_OBJECT: "📦" 
};

function exportCSV(reports) {
  if (!reports || reports.length === 0) return false;
  const safeNum = (v, d = 0) => (typeof v === "number" && !isNaN(v) ? v : d);
  const headers = ["ID","Type","Severity","Corridor","Latitude","Longitude","Ultrasonic(cm)","Speed(km/h)","Confidence%","Buzzer","Timestamp"];
  const rows    = reports.map(r => [
    r.id ?? "N/A",
    r.type ?? "UNKNOWN",
    r.severity ?? "LOW",
    r.corridor ?? "Unknown",
    safeNum(r.latitude, 0).toFixed(6),
    safeNum(r.longitude, 0).toFixed(6),
    safeNum(r.ultrasonicCm),
    safeNum(r.speed),
    safeNum(r.confidence),
    r.buzzerActive ? "Yes" : "No",
    r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString(),
  ]);
  const csv  = [headers, ...rows].map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `railguard_log_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/* ── Severity Pill ── */
function SevPill({ severity }) {
  const col = SEV_COLORS[severity] ?? "#94a3b8";
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 800,
      background: col + "18", color: col, border: `1px solid ${col}30`,
      letterSpacing: "0.06em", textAlign: "center", whiteSpace: "nowrap",
    }}>
      {severity}
    </span>
  );
}

/* ── Individual report row ── */
function ReportRow({ r, isSelected, onToggle }) {
  return (
    <div>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => onToggle(r)}
        style={{
          display: "grid",
          gridTemplateColumns: "90px 1fr 90px 90px 28px",
          padding: "14px 18px",
          background: isSelected ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.015)",
          border: `1px solid ${isSelected ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: "var(--r-lg)",
          cursor: "pointer",
          alignItems: "center",
          gap: 12,
          transition: "all .25s ease",
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.id}</span>

        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>{TYPE_ICONS[r.type] ?? "🔔"}</span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.type.replace(/_/g, " ")}</p>
            <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 1 }}>{r.corridor}</p>
          </div>
        </div>

        <SevPill severity={r.severity} />

        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-2)", textAlign: "right" }}>{r.ultrasonicCm} cm</span>

        <ChevronDown
          size={14}
          color="var(--text-3)"
          style={{ transform: isSelected ? "rotate(180deg)" : "none", transition: "transform .25s", justifySelf: "center" }}
        />
      </motion.div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              margin: "6px 0 4px 0",
              padding: "18px 20px",
              background: "rgba(245,158,11,0.03)",
              border: "1px solid rgba(245,158,11,0.12)",
              borderRadius: "var(--r-lg)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "16px 24px",
            }}>
              {[
                ["Confidence", `${r.confidence}%`],
                ["Speed",      `${r.speed} km/h`],
                ["GPS",        `${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}`],
                ["Buzzer",     r.buzzerActive ? "🔊 ACTIVE" : "— OFF"],
                ["Source",     r.source === "firebase" ? "Firebase RTDB" : "Local Mock"],
                ["Logged At",  new Date(r.timestamp).toLocaleString("en-IN")],
              ].map(([k, v]) => (
                <div key={k}>
                  <p style={{ fontSize: 9, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontWeight: 700 }}>{k}</p>
                  <p style={{ fontSize: 12, color: "var(--text-1)", fontWeight: 600 }}>{v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main export ── */
export default function HistoryPage({ reports, whatsappNumber, vehicle }) {
  const { toast } = useToast();
  const [search,     setSearch]     = useState("");
  const [sevFilter,  setSevFilter]  = useState("ALL");
  const [sortDir,    setSortDir]    = useState("desc");
  const [sending,    setSending]    = useState(false);
  const [sent,       setSent]       = useState(false);
  const [selected,   setSelected]   = useState(null);

  const severities = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

  const toggle = (r) => setSelected(prev => prev?.id === r.id ? null : r);

  const handleWhatsAppSummary = async () => {
    let targetNum = whatsappNumber;
    if (!targetNum) {
      toast.warning("No WhatsApp number linked. Go to sidebar → edit ✏ to add one.");
      return;
    }

    setSending(true);
    toast.info("Sending WhatsApp summary…");

    const critical = reports.filter(r => r.severity === "CRITICAL" || r.severity === "HIGH").length;
    const todayStr = new Date().toDateString();
    const today    = reports.filter(r => new Date(r.timestamp).toDateString() === todayStr).length;

    const res = await sendWhatsAppSummary(targetNum, {
      total: reports.length,
      critical,
      today,
      vehicleName: vehicle?.name || "RailGuard Vehicle",
    });

    setSending(false);
    if (res.success) {
      setSent(true);
      toast.success("📊 Summary sent to " + targetNum);
      setTimeout(() => setSent(false), 4000);
    } else {
      toast.error("WhatsApp failed: " + res.error);
    }
  };

  const filtered = useMemo(() => {
    return reports
      .filter(r => {
        const q = search.toLowerCase();
        return (
          (sevFilter === "ALL" || r.severity === sevFilter) &&
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
  }, [reports, search, sevFilter, sortDir]);

  return (
    <div style={{
      padding: "clamp(16px, 3vw, 28px)",
      display: "flex",
      flexDirection: "column",
      gap: 20,
      minHeight: "100%",
    }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 2 }}>
            History Log
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-3)" }}>
            {reports.length} records · {reports.filter(r => r.severity === "CRITICAL").length} critical
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {/* Activate link */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.open("https://wa.me/14155238886?text=join%20heat-taste", "_blank")}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "8px 12px",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: "var(--r-md)",
              cursor: "pointer", fontSize: 11, fontWeight: 700, color: "var(--green)",
            }}
          >
            <ExternalLink size={12} /> Activate WA
          </motion.button>

          {/* WhatsApp Summary */}
          <motion.button
            whileHover={sending ? {} : { scale: 1.03 }}
            whileTap={sending ? {} : { scale: 0.97 }}
            onClick={handleWhatsAppSummary}
            disabled={sending}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px",
              background: sent ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.08)",
              border: `1px solid ${sent ? "rgba(16,185,129,0.5)" : "rgba(16,185,129,0.25)"}`,
              borderRadius: "var(--r-md)",
              cursor: sending ? "not-allowed" : "pointer",
              fontSize: 12, fontWeight: 700, color: "var(--green)",
              opacity: sending ? 0.6 : 1,
              position: "relative",
            }}
          >
            {sending 
              ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}><RefreshCw size={12} /></motion.div>
              : sent 
                ? <CheckCircle size={12} />
                : <MessageSquare size={12} />
            }
            {sent ? "Sent!" : sending ? "Sending…" : "WA Summary"}
            {!whatsappNumber && !sent && !sending && (
              <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, background: "var(--amber)", borderRadius: "50%", border: "2px solid var(--bg-void)" }} />
            )}
          </motion.button>

          {/* Export CSV */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const ok = exportCSV(filtered);
              if (ok) toast.success(`✅ ${filtered.length} records exported as CSV`);
              else toast.warning("No records to export");
            }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px",
              background: "var(--amber-lo)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "var(--r-md)",
              cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--amber)",
            }}
          >
            <Download size={12} /> Export
          </motion.button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="glass" style={{ borderRadius: "var(--r-xl)", padding: "12px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ID, corridor, type…"
            style={{
              width: "100%", padding: "8px 10px 8px 30px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              color: "var(--text-1)", fontSize: 12,
              transition: "border-color .2s",
            }}
          />
        </div>

        {/* Severity filter pills */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {severities.map(s => (
            <button key={s} onClick={() => setSevFilter(s)} style={{
              padding: "5px 10px",
              background: sevFilter === s
                ? (SEV_COLORS[s] ? `${SEV_COLORS[s]}20` : "var(--amber-lo)")
                : "transparent",
              border: `1px solid ${sevFilter === s ? (SEV_COLORS[s] ?? "var(--amber)") + "50" : "var(--border)"}`,
              borderRadius: 99, cursor: "pointer", fontSize: 10, fontWeight: 700,
              color: sevFilter === s ? (SEV_COLORS[s] ?? "var(--amber)") : "var(--text-3)",
              transition: "all .2s", letterSpacing: "0.05em",
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
            borderRadius: 99, cursor: "pointer", fontSize: 10, fontWeight: 700, color: "var(--text-3)",
          }}
        >
          {sortDir === "desc" ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          {sortDir === "desc" ? "Newest" : "Oldest"}
        </button>
      </div>

      {/* ── Count ── */}
      <p style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.02em" }}>
        Showing <b style={{ color: "var(--text-2)" }}>{filtered.length}</b> of {reports.length} records
      </p>

      {/* ── List ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(r => (
            <ReportRow
              key={r.id}
              r={r}
              isSelected={selected?.id === r.id}
              onToggle={toggle}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-3)" }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
              <p style={{ fontWeight: 700, fontSize: 14 }}>No records match your filter</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Try clearing the search or changing the severity filter</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
