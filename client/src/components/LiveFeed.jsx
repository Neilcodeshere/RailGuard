import { useRef, useEffect } from "react";
import {
  AlertTriangle,
  MapPin,
  Ruler,
  Clock,
  ImageIcon,
  Zap,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function LiveFeed({ reports }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [reports.length]);

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-slate-800/60 flex items-center justify-center border border-slate-700/50">
          <Zap className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-400">
          No Detections Yet
        </h3>
        <p className="text-sm text-slate-500 text-center max-w-md">
          The system is monitoring. When the ESP32-CAM detects a crack, reports
          will appear here in real time.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="status-dot-online" />
          <span className="text-xs text-slate-500">Listening for events…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={AlertTriangle}
          label="Total Detections"
          value={reports.length}
          color="red"
        />
        <StatCard
          icon={Clock}
          label="Latest Report"
          value={formatTime(reports[0]?.createdAt || reports[0]?.timestamp)}
          color="amber"
        />
        <StatCard
          icon={Ruler}
          label="Avg Distance"
          value={`${avgDistance(reports)} cm`}
          color="blue"
        />
        <StatCard
          icon={MapPin}
          label="Unique Locations"
          value={uniqueLocations(reports)}
          color="green"
        />
      </div>

      {/* Live feed */}
      <div>
        <h2 className="section-title mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          Live Detection Feed
          <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 font-normal">
            <div className="status-dot-online" />
            Real-time
          </span>
        </h2>

        <div
          ref={scrollRef}
          className="space-y-3 max-h-[600px] overflow-y-auto pr-2"
        >
          {reports.map((report, i) => (
            <ReportCard key={report._id || i} report={report} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Report Card ── */
function ReportCard({ report, index }) {
  return (
    <div
      className="glass-card-hover p-4 flex gap-4 animate-slide-up"
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0">
        {report.imageUrl ? (
          <img
            src={`${API_BASE}${report.imageUrl}`}
            alt="Crack detection"
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-slate-700/50"
            loading="lazy"
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700/50">
            <ImageIcon className="w-6 h-6 text-slate-600" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-red-500/20 text-red-400 border border-red-500/30">
              Crack Detected
            </span>
            <span className="text-xs text-slate-500 font-mono">
              #{String(index + 1).padStart(3, "0")}
            </span>
          </div>
          <span className="text-xs text-slate-500 flex-shrink-0">
            {formatTime(report.createdAt || report.timestamp)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <p className="data-label">Coordinates</p>
            <p className="data-value">
              {parseFloat(report.latitude).toFixed(6)},{" "}
              {parseFloat(report.longitude).toFixed(6)}
            </p>
          </div>
          <div>
            <p className="data-label">Sensor Distance</p>
            <p className="data-value">
              {parseFloat(report.distance_from_sensor).toFixed(1)} cm
            </p>
          </div>
          <div>
            <p className="data-label">Timestamp</p>
            <p className="data-value font-mono text-xs">
              {formatTime(report.timestamp)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    green: "text-green-400 bg-green-500/10 border-green-500/20",
  };

  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorMap[color]}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="data-label">{label}</p>
        <p className="text-lg font-bold text-slate-100">{value}</p>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function formatTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function avgDistance(reports) {
  if (reports.length === 0) return "0.0";
  const sum = reports.reduce(
    (acc, r) => acc + parseFloat(r.distance_from_sensor || 0),
    0
  );
  return (sum / reports.length).toFixed(1);
}

function uniqueLocations(reports) {
  const set = new Set(
    reports.map(
      (r) =>
        `${parseFloat(r.latitude).toFixed(4)}_${parseFloat(r.longitude).toFixed(4)}`
    )
  );
  return set.size;
}
