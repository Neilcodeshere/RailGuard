import { useState, useMemo } from "react";
import { Search, Eye, Download, Clock, SlidersHorizontal } from "lucide-react";
import ImageModal from "./ImageModal";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function HistoricalLog({ reports }) {
  const [search, setSearch] = useState("");
  const [modalImage, setModalImage] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const perPage = 15;

  /* filter + sort */
  const filtered = useMemo(() => {
    let list = [...reports];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.latitude?.toString().includes(q) ||
          r.longitude?.toString().includes(q) ||
          r.distance_from_sensor?.toString().includes(q) ||
          r.timestamp?.toLowerCase().includes(q) ||
          (r.createdAt && new Date(r.createdAt).toLocaleString().toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      let va = a[sortField];
      let vb = b[sortField];
      if (sortField === "createdAt") {
        va = new Date(va || 0).getTime();
        vb = new Date(vb || 0).getTime();
      } else {
        va = parseFloat(va) || 0;
        vb = parseFloat(vb) || 0;
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });

    return list;
  }, [reports, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="section-title">
          <Clock className="w-5 h-5 text-amber-500" />
          Historical Detection Log
          <span className="text-sm font-normal text-slate-500 ml-2">
            ({filtered.length} records)
          </span>
        </h2>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="search-reports"
            type="text"
            placeholder="Search by coordinates, date..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-16">#</th>
                <th
                  className="cursor-pointer select-none hover:text-amber-400 transition-colors"
                  onClick={() => toggleSort("createdAt")}
                >
                  Timestamp {sortField === "createdAt" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="cursor-pointer select-none hover:text-amber-400 transition-colors"
                  onClick={() => toggleSort("latitude")}
                >
                  Latitude {sortField === "latitude" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="cursor-pointer select-none hover:text-amber-400 transition-colors"
                  onClick={() => toggleSort("longitude")}
                >
                  Longitude {sortField === "longitude" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="cursor-pointer select-none hover:text-amber-400 transition-colors"
                  onClick={() => toggleSort("distance_from_sensor")}
                >
                  Distance {sortField === "distance_from_sensor" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th className="w-28">Image</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    {search ? "No matching records found." : "No detections recorded yet."}
                  </td>
                </tr>
              ) : (
                paginated.map((report, i) => (
                  <tr key={report._id || i}>
                    <td className="font-mono text-xs text-slate-500">
                      {String((page - 1) * perPage + i + 1).padStart(3, "0")}
                    </td>
                    <td className="font-mono text-xs">
                      {formatDateTime(report.createdAt || report.timestamp)}
                    </td>
                    <td className="font-mono">
                      {parseFloat(report.latitude).toFixed(6)}
                    </td>
                    <td className="font-mono">
                      {parseFloat(report.longitude).toFixed(6)}
                    </td>
                    <td className="font-mono">
                      {parseFloat(report.distance_from_sensor).toFixed(1)} cm
                    </td>
                    <td>
                      {report.imageUrl ? (
                        <button
                          id={`view-image-${i}`}
                          onClick={() => setModalImage(`${API_BASE}${report.imageUrl}`)}
                          className="btn-outline text-xs !px-2 !py-1 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/50">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline text-xs !px-2 !py-1 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(
                  1,
                  Math.min(page - 2, totalPages - 4)
                );
                const num = start + i;
                if (num > totalPages) return null;
                return (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      page === num
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-amber-400"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-outline text-xs !px-2 !py-1 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {modalImage && (
        <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
      )}
    </div>
  );
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}
