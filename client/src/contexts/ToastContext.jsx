/**
 * CONTEXT — ToastContext
 * Provides a global toast notification system.
 * Usage: const { toast } = useToast();
 *        toast.success("Message"), toast.error("..."), toast.info("..."), toast.warning("...")
 */
import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastCtx = createContext(null);

const ICONS = {
  success: <CheckCircle size={16} color="#10b981" />,
  error:   <XCircle    size={16} color="#ef4444" />,
  info:    <Info       size={16} color="#06b6d4" />,
  warning: <AlertTriangle size={16} color="#f59e0b" />,
};

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const remove = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const toast = {
    success: (m, d) => addToast("success", m, d),
    error:   (m, d) => addToast("error",   m, d),
    info:    (m, d) => addToast("info",    m, d),
    warning: (m, d) => addToast("warning", m, d),
  };

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`toast toast-${t.type}`}
            >
              {ICONS[t.type]}
              <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 2, flexShrink: 0 }}
              >
                <X size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
