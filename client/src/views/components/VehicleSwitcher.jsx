/**
 * VIEW — VehicleSwitcher
 * Compact card + animated modal for switching active vehicle.
 * Placed inside Sidebar.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, RefreshCw, X } from "lucide-react";
import { STATUS_META } from "../../models/vehicleModel";

export default function VehicleSwitcher({ vehicles, current, onSwitch, collapsed }) {
  const [open, setOpen] = useState(false);

  if (!current) return null;
  const meta = STATUS_META[current.status] ?? STATUS_META.OFFLINE;

  return (
    <>
      {/* Trigger button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: collapsed ? "10px 0" : "10px 12px",
          justifyContent: collapsed ? "center" : "flex-start",
          width: "100%",
          background: "rgba(245,166,35,.08)",
          border: "1px solid rgba(245,166,35,.2)",
          borderRadius: "var(--r-md)", cursor: "pointer",
          transition: "background .2s",
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>{current.emoji ?? "🚗"}</span>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
              style={{ flex: 1, minWidth: 0, overflow: "hidden" }}
            >
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {current.name}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: meta.color, fontWeight: 600 }}>{meta.label}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!collapsed && <ChevronDown size={14} color="var(--text-3)" />}
      </motion.button>

      {/* Modal overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 500, backdropFilter: "blur(6px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="glass"
              style={{
                position: "fixed", top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                width: "clamp(300px, 90vw, 440px)",
                zIndex: 510, borderRadius: "var(--r-xl)",
                border: "1px solid var(--border)",
                boxShadow: "0 24px 80px rgba(0,0,0,.6)",
                overflow: "hidden",
              }}
            >
              {/* Modal header */}
              <div style={{
                padding: "18px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderBottom: "1px solid var(--border)",
              }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-1)" }}>Switch Vehicle</h3>
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>Select a vehicle from the fleet below</p>
                </div>
                <button onClick={() => setOpen(false)}
                  style={{ background: "rgba(255,255,255,.06)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", cursor: "pointer", padding: "6px", color: "var(--text-3)", display: "flex" }}>
                  <X size={14} />
                </button>
              </div>

              {/* Vehicle list */}
              <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 8, maxHeight: "60vh", overflowY: "auto" }}>
                {vehicles.map((v, i) => {
                  const vm       = STATUS_META[v.status] ?? STATUS_META.OFFLINE;
                  const isCur    = current?.id === v.id;
                  const offline  = v.status !== "ONLINE";
                  return (
                    <motion.button
                      key={v.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={offline ? {} : { x: 4 }}
                      whileTap={offline && !isCur ? {} : { scale: 0.98 }}
                      onClick={() => { if (!offline || isCur) { onSwitch(v); setOpen(false); } }}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "13px 14px",
                        background: isCur ? "rgba(245,166,35,.1)" : "rgba(255,255,255,.03)",
                        border: `1px solid ${isCur ? "rgba(245,166,35,.35)" : "var(--border)"}`,
                        borderRadius: "var(--r-md)",
                        cursor: offline && !isCur ? "not-allowed" : "pointer",
                        opacity: offline && !isCur ? 0.45 : 1,
                        textAlign: "left", width: "100%",
                        transition: "background .18s",
                      }}
                    >
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{v.emoji ?? "🚗"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{v.name}</span>
                          <span style={{
                            fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 99,
                            background: vm.bg, color: vm.color,
                            border: `1px solid ${vm.color}30`,
                            textTransform: "uppercase", letterSpacing: "0.08em",
                          }}>{vm.label}</span>
                        </div>
                        <p style={{ fontSize: 11, color: "var(--text-3)" }}>{v.type} · {v.id}</p>
                        {/* mini battery */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
                          <div style={{ width: 48, height: 4, background: "rgba(255,255,255,.1)", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{
                              width: `${v.batteryPct}%`, height: "100%", borderRadius: 99,
                              background: v.batteryPct > 50 ? "var(--green)" : v.batteryPct > 20 ? "var(--amber)" : "var(--red)",
                            }}/>
                          </div>
                          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>{v.batteryPct}%</span>
                        </div>
                      </div>
                      {isCur && <Check size={16} color="var(--amber)" />}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
