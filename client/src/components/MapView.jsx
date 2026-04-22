import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Map as MapIcon, Crosshair } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

// India center as default when no reports
const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

export default function MapView({ reports }) {
  const center = useMemo(() => {
    if (reports.length === 0) return DEFAULT_CENTER;
    const lat =
      reports.reduce((a, r) => a + parseFloat(r.latitude), 0) / reports.length;
    const lng =
      reports.reduce((a, r) => a + parseFloat(r.longitude), 0) / reports.length;
    return [lat, lng];
  }, [reports]);

  const zoom = reports.length === 0 ? DEFAULT_ZOOM : 12;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="section-title">
          <MapIcon className="w-5 h-5 text-amber-500" />
          Crack Detection Map
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-red-400" />
            <span className="text-xs text-slate-400">Detected Crack</span>
          </div>
          <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-1 rounded font-mono">
            {reports.length} markers
          </span>
        </div>
      </div>

      <div className="glass-card overflow-hidden" style={{ height: "600px" }}>
        <MapContainer
          center={center}
          zoom={zoom}
          className="w-full h-full"
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {reports.map((report, i) => (
            <CircleMarker
              key={report._id || i}
              center={[
                parseFloat(report.latitude),
                parseFloat(report.longitude),
              ]}
              radius={8}
              pathOptions={{
                color: "#ef4444",
                fillColor: "#dc2626",
                fillOpacity: 0.7,
                weight: 2,
              }}
            >
              <Popup>
                <div className="space-y-2 min-w-[200px]">
                  <div className="flex items-center gap-2 border-b border-slate-600 pb-2">
                    <Crosshair className="w-4 h-4 text-red-400" />
                    <span className="font-semibold text-sm">
                      Crack #{i + 1}
                    </span>
                  </div>

                  {report.imageUrl && (
                    <img
                      src={`${API_BASE}${report.imageUrl}`}
                      alt="Crack"
                      className="w-full h-28 object-cover rounded-lg"
                    />
                  )}

                  <div className="text-xs space-y-1">
                    <p>
                      <span className="text-slate-400">Lat:</span>{" "}
                      <span className="font-mono">
                        {parseFloat(report.latitude).toFixed(6)}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-400">Lng:</span>{" "}
                      <span className="font-mono">
                        {parseFloat(report.longitude).toFixed(6)}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-400">Distance:</span>{" "}
                      <span className="font-mono">
                        {parseFloat(report.distance_from_sensor).toFixed(1)} cm
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-400">Time:</span>{" "}
                      <span className="font-mono">{formatDateTime(report.timestamp)}</span>
                    </p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString("en-IN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
