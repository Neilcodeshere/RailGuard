import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Map,
  Clock,
  Radio,
  AlertTriangle,
  Train,
  BarChart3,
} from "lucide-react";
import socket from "./socket";
import StatusPanel from "./components/StatusPanel";
import LiveFeed from "./components/LiveFeed";
import MapView from "./components/MapView";
import HistoricalLog from "./components/HistoricalLog";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "map", label: "Map View", icon: Map },
  { id: "history", label: "Historical Log", icon: Clock },
];

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reports, setReports] = useState([]);
  const [connected, setConnected] = useState(socket.connected);
  const [esp32Status, setEsp32Status] = useState("offline");
  const [lastLedMessage, setLastLedMessage] = useState("NO ALERTS");
  const [loading, setLoading] = useState(true);

  /* ── Fetch initial data ── */
  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/crack-reports`);
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/status`);
      const data = await res.json();
      setLastLedMessage(data.lastLedMessage || "NO ALERTS");
    } catch (err) {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchStatus();

    /* ── Socket events ── */
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("new-crack-report", (report) => {
      setReports((prev) => [report, ...prev]);
      setLastLedMessage(
        `CRACK @ ${parseFloat(report.latitude).toFixed(4)}, ${parseFloat(report.longitude).toFixed(4)}`
      );
    });

    socket.on("esp32-status-update", (data) => {
      setEsp32Status(data.status || "offline");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("new-crack-report");
      socket.off("esp32-status-update");
    };
  }, [fetchReports, fetchStatus]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Train className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-950 animate-pulse-slow" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-100 tracking-tight">
                  RailGuard
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">
                  Crack Detection System
                </p>
              </div>
            </div>

            {/* Status Panel */}
            <StatusPanel
              connected={connected}
              esp32Status={esp32Status}
              lastLedMessage={lastLedMessage}
              totalReports={reports.length}
            />
          </div>
        </div>
      </header>

      {/* ── Tab navigation ── */}
      <nav className="bg-slate-900/50 border-b border-slate-800/40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  isActive
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === "dashboard" && reports.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    {reports.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="flex-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Loading reports…</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && <LiveFeed reports={reports} />}
              {activeTab === "map" && <MapView reports={reports} />}
              {activeTab === "history" && <HistoricalLog reports={reports} />}
            </>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 border-t border-slate-800/40 py-4">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-600">
          <span>© 2026 RailGuard — Autonomous Railway Crack Detection</span>
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-3 h-3" />
            v1.0.0
          </span>
        </div>
      </footer>
    </div>
  );
}
