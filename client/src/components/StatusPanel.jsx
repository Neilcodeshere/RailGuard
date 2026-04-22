import {
  Wifi,
  WifiOff,
  Cpu,
  Monitor,
  AlertTriangle,
  Hash,
} from "lucide-react";

export default function StatusPanel({
  connected,
  esp32Status,
  lastLedMessage,
  totalReports,
}) {
  return (
    <div className="hidden md:flex items-center gap-4">
      {/* WebSocket Status */}
      <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-lg">
        {connected ? (
          <Wifi className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-red-400" />
        )}
        <span
          className={`text-xs font-medium ${connected ? "text-green-400" : "text-red-400"}`}
        >
          {connected ? "Live" : "Offline"}
        </span>
        <div
          className={connected ? "status-dot-online" : "status-dot-offline"}
        />
      </div>

      {/* ESP32 Status */}
      <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-lg">
        <Cpu className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs text-slate-400">ESP32:</span>
        <span
          className={`text-xs font-semibold ${
            esp32Status === "online" ? "text-green-400" : "text-slate-500"
          }`}
        >
          {esp32Status === "online" ? "Connected" : "Standby"}
        </span>
      </div>

      {/* LED Message */}
      <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-lg max-w-[220px]">
        <Monitor className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span className="text-xs font-mono text-amber-400 truncate">
          {lastLedMessage}
        </span>
      </div>

      {/* Total Reports */}
      <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-lg">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
        <span className="text-xs font-bold text-red-400">{totalReports}</span>
        <span className="text-xs text-slate-500">alerts</span>
      </div>
    </div>
  );
}
