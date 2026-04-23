/**
 * VIEW — AlertBanner
 * Animated toast-style alert that slides in when buzzer triggers.
 */
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export default function AlertBanner({ active, message, onDismiss }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="alert"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          style={{
            position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
            zIndex: 9999,
            display: "flex", alignItems: "center", gap: 10,
            background: "linear-gradient(135deg, rgba(239,68,68,.18), rgba(245,166,35,.12))",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(239,68,68,.4)",
            borderRadius: "var(--r-xl)",
            padding: "12px 18px",
            minWidth: 320, maxWidth: 480,
            boxShadow: "0 8px 40px rgba(239,68,68,.25)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
            style={{ color: "var(--red)", flexShrink: 0 }}
          >
            <AlertTriangle size={20} strokeWidth={2.5} />
          </motion.div>
          <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#fca5a5" }}>{message}</p>
          <button
            onClick={onDismiss}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 2 }}
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
