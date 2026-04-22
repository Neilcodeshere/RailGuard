import { useEffect } from "react";
import { X, ZoomIn } from "lucide-react";

export default function ImageModal({ src, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="relative max-w-4xl max-h-[90vh] mx-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-red-500 transition-all"
          id="modal-close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700/50">
            <ZoomIn className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-slate-300">
              Crack Image — Full Resolution
            </span>
          </div>
          <img
            src={src}
            alt="Crack detection - full resolution"
            className="w-full max-h-[80vh] object-contain bg-black/30"
          />
        </div>
      </div>
    </div>
  );
}
