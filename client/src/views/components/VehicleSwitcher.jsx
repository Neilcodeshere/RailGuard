/**
 * VIEW — VehicleSwitcher v2
 * Fixed: renders correctly when sidebar is collapsed or expanded.
 * Shows all vehicles from Firebase (no hardcoding).
 * Saves selection to Firestore via onSwitch callback.
 */
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, X, Battery, RefreshCw, ExternalLink, Phone } from "lucide-react";
import { STATUS_META } from "../../models/vehicleModel";

/* ── Mini battery bar ── */
function BatteryBar({ pct }) {
  const color = pct > 50 ? "var(--green)" : pct > 20 ? "var(--amber)" : "var(--red)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <Battery size={11} color={color} />
      <div style={{ width: 40, height: 3, background: "rgba(255,255,255,.1)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct ?? 0}%`, height: "100%", background: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>{pct ?? 0}%</span>
    </div>
  );
}

/* ── Status pill ── */
function StatusPill({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.OFFLINE;
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, padding: "1px 7px", borderRadius: 99, flexShrink: 0,
      background: meta.bg, color: meta.color,
      border: `1px solid ${meta.color}30`,
      textTransform: "uppercase", letterSpacing: "0.08em",
    }}>
      {meta.label}
    </span>
  );
}

/* ── Vehicle card inside modal ── */
function VehicleCard({ vehicle, isCurrent, onSelect, index }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,.05)" }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(vehicle)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 16px", width: "100%", textAlign: "left",
        background: isCurrent ? "rgba(245,166,35,.1)" : "rgba(255,255,255,.03)",
        border: `1px solid ${isCurrent ? "rgba(245,166,35,.35)" : "rgba(255,255,255,.07)"}`,
        borderRadius: 12, cursor: "pointer",
        transition: "background .18s, border-color .18s",
        boxShadow: isCurrent ? "0 0 16px rgba(245,166,35,.12)" : "none",
      }}
    >
      {/* Emoji */}
      <span style={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}>{vehicle.emoji ?? "🚗"}</span>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{vehicle.name}</span>
          <StatusPill status={vehicle.status} />
        </div>
        <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>
          {vehicle.type ?? "Inspection Bot"} &nbsp;·&nbsp;
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }}>{vehicle.id}</span>
        </p>
        <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          📍 {vehicle.corridor ?? "—"}
        </p>
        <BatteryBar pct={vehicle.batteryPct} />
      </div>

      {/* Active tick */}
      {isCurrent && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
          <Check size={18} color="var(--amber)" strokeWidth={3} />
        </motion.div>
      )}
    </motion.button>
  );
}

/* ── Main export ── */
export default function VehicleSwitcher({ 
  vehicles = [], current, onSwitch, 
  collapsed, loading, whatsappNumber, onSaveWhatsapp 
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (v) => {
    onSwitch(v);
    setOpen(false);
  };

  const handleEditWhatsapp = () => {
    const n = prompt("Enter WhatsApp number for real-time alerts (+country code):", whatsappNumber || "+91");
    if (n !== null && n.trim()) onSaveWhatsapp(n.trim());
  };

  const meta = current ? (STATUS_META[current.status] ?? STATUS_META.OFFLINE) : null;

  /* ── Modal rendered via portal so it escapes sidebar's stacking context ── */
  const modal = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9000,
              background: "rgba(0,0,0,0.82)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          />

          {/* Centering wrapper */}
          <div
            key="modal-wrap"
            style={{
              position: "fixed", inset: 0, zIndex: 9001,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 16, pointerEvents: "none",
            }}
          >
            <motion.div
              key="modal-panel"
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: "min(460px, 100%)",
                maxHeight: "88vh",
                borderRadius: 20,
                overflow: "hidden",
                background: "#090f1e",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 32px 100px rgba(0,0,0,0.9), 0 0 60px rgba(245,158,11,0.05)",
                display: "flex",
                flexDirection: "column",
                pointerEvents: "all",
              }}
            >
              {/* Header */}
              <div style={{
                padding: "18px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                flexShrink: 0,
                background: "rgba(255,255,255,0.02)",
              }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-1)", marginBottom: 3 }}>
                    🚂 Switch Vehicle
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--text-3)" }}>
                    {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} in fleet
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer", color: "var(--text-3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Vehicle list */}
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", flex: 1 }}>
                {loading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 24, color: "var(--text-3)" }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <RefreshCw size={15} />
                    </motion.div>
                    <span style={{ fontSize: 13 }}>Loading fleet from Firebase…</span>
                  </div>
                ) : vehicles.length === 0 ? (
                  <p style={{ padding: 20, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
                    No vehicles found in fleet
                  </p>
                ) : (
                  vehicles.map((v, i) => (
                    <VehicleCard
                      key={v.id}
                      vehicle={v}
                      isCurrent={current?.id === v.id}
                      onSelect={handleSelect}
                      index={i}
                    />
                  ))
                )}
              </div>

              {/* Footer — WhatsApp */}
              <div style={{
                padding: "14px 18px",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(0,0,0,0.25)",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Phone size={13} color="var(--green)" />
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        WhatsApp Alerts
                      </p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: whatsappNumber ? "var(--text-1)" : "var(--text-3)" }}>
                        {whatsappNumber || "Not configured"}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={handleEditWhatsapp}
                      style={{
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8, padding: "5px 10px", cursor: "pointer",
                        color: "var(--text-2)", fontSize: 11, fontWeight: 700,
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => window.open("https://wa.me/14155238886?text=join%20heat-taste", "_blank")}
                      style={{
                        background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
                        borderRadius: 8, padding: "5px 10px", cursor: "pointer",
                        color: "var(--green)", fontSize: 11, fontWeight: 700,
                        display: "flex", alignItems: "center", gap: 4,
                      }}
                    >
                      Activate <ExternalLink size={10} />
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: 9, color: "var(--text-3)", marginTop: 8, textAlign: "center" }}>
                  Send "join heat-taste" on WhatsApp to +1 415 523 8886 to activate alerts
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* ── Trigger button ── */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        title={collapsed ? (current?.name ?? "Select vehicle") : undefined}
        style={{
          display: "flex", alignItems: "center",
          gap: collapsed ? 0 : 10,
          padding: collapsed ? "11px" : "11px 14px",
          justifyContent: "center",
          width: "100%",
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.22)",
          borderRadius: 10, cursor: "pointer",
          transition: "background .2s",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {current?.status === "ONLINE" && (
          <motion.div
            animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            style={{ position: "absolute", width: 8, height: 8, borderRadius: "50%", background: "var(--green)", top: 8, right: 8 }}
          />
        )}

        <span style={{ fontSize: collapsed ? 20 : 18, flexShrink: 0 }}>
          {current ? (current.emoji ?? "🚗") : "🚗"}
        </span>

        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {current?.name ?? "Select Vehicle"}
            </p>
            {meta && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: meta.color, fontWeight: 600 }}>{meta.label}</span>
              </div>
            )}
          </div>
        )}

        {!collapsed && <ChevronDown size={14} color="var(--text-3)" style={{ flexShrink: 0 }} />}
      </motion.button>

      {/* Portal modal */}
      {createPortal(modal, document.body)}
    </>
  );
}
