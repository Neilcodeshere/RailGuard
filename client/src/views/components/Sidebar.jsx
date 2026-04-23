/**
 * VIEW — Sidebar v2 — Responsive (desktop collapse, mobile overlay drawer)
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VehicleSwitcher from "./VehicleSwitcher";
import { LayoutDashboard, Map, ClipboardList, Radio, Train, LogOut, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Dashboard",     icon: LayoutDashboard },
  { id: "map",       label: "GPS & Map",      icon: Map },
  { id: "telemetry", label: "Live Telemetry", icon: Radio },
  { id: "history",   label: "History Log",    icon: ClipboardList },
];

function NavItem({ id, label, icon: Icon, isActive, collapsed, onClick, badge }) {
  return (
    <motion.button
      whileHover={{ x: collapsed ? 0 : 3 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onClick(id)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: collapsed ? "11px 0" : "11px 14px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: "var(--r-md)",
        border: "none", cursor: "pointer", width: "100%",
        background: isActive
          ? "linear-gradient(135deg,rgba(245,166,35,.16),rgba(239,68,68,.08))"
          : "transparent",
        boxShadow: isActive ? "inset 0 0 0 1px rgba(245,166,35,.22)" : "none",
        position: "relative", transition: "background .2s",
      }}
    >
      {isActive && (
        <motion.div layoutId="activePill" style={{
          position: "absolute", left: 0, top: "18%", bottom: "18%",
          width: 3, borderRadius: 99,
          background: "linear-gradient(180deg,#f5a623,#ef4444)",
        }} />
      )}
      <Icon size={18} strokeWidth={2}
        color={isActive ? "var(--amber)" : "var(--text-3)"} style={{ flexShrink: 0 }} />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
            style={{ fontSize: 13, fontWeight: 600, color: isActive ? "var(--text-1)" : "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden" }}
          >
            {label}
            {badge > 0 && (
              <span style={{ marginLeft: 8, background: "var(--red)", color: "#fff", fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 99 }}>
                {badge}
              </span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
      {collapsed && badge > 0 && (
        <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "var(--red)" }} />
      )}
    </motion.button>
  );
}

export default function Sidebar({ activeTab, onTabChange, onLogout, criticalCount = 0, vehicles = [], vehiclesLoading = false, selectedVehicle, onSwitchVehicle }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleNav = (id) => {
    onTabChange(id);
    if (isMobile) setMobileOpen(false);
  };

  const SidebarContent = ({ col }) => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <div style={{
        padding: col ? "20px 0" : "20px",
        display: "flex", alignItems: "center", gap: 12,
        justifyContent: col ? "center" : "flex-start",
        borderBottom: "1px solid var(--border)",
      }}>
        <motion.div whileHover={{ rotate: 10 }} style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg,#f5a623,#ef4444)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 22px rgba(245,166,35,.4)",
        }}>
          <Train size={18} color="#fff" strokeWidth={2} />
        </motion.div>
        <AnimatePresence>
          {!col && (
            <motion.div
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
            >
              <p style={{ fontWeight: 800, fontSize: 15, color: "var(--text-1)", lineHeight: 1 }}>RailGuard</p>
              <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-3)", marginTop: 2 }}>
                ESP8266 · Firebase
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
        {NAV.map(n => (
          <NavItem
            key={n.id} {...n}
            isActive={activeTab === n.id}
            collapsed={col}
            onClick={handleNav}
            badge={n.id === "history" ? criticalCount : 0}
          />
        ))}
      </nav>

      {/* Vehicle switcher */}
      <div style={{ padding: "8px" }}>
        <VehicleSwitcher
          vehicles={vehicles}
          current={selectedVehicle}
          onSwitch={onSwitchVehicle}
          collapsed={col}
          loading={vehiclesLoading}
        />
      </div>

      {/* Bottom */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 4 }}>
        <motion.button
          whileHover={{ x: col ? 0 : 3 }}
          whileTap={{ scale: 0.96 }}
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: col ? "10px 0" : "10px 14px",
            justifyContent: col ? "center" : "flex-start",
            borderRadius: "var(--r-md)", border: "none", cursor: "pointer",
            background: "transparent", width: "100%",
          }}
        >
          <LogOut size={18} color="var(--text-3)" strokeWidth={2} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!col && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", whiteSpace: "nowrap" }}
              >Sign Out</motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {!isMobile && (
          <button onClick={() => setCollapsed(c => !c)} style={{
            alignSelf: "center", width: 28, height: 28, borderRadius: "50%",
            background: "rgba(255,255,255,.05)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--text-3)",
          }}>
            {col ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        )}
      </div>
    </div>
  );

  /* Desktop sidebar */
  if (!isMobile) return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 220 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="glass"
      style={{ height: "100vh", position: "fixed", left: 0, top: 0, zIndex: 200, borderRight: "1px solid var(--border)", overflow: "hidden", borderRadius: 0 }}
    >
      <SidebarContent col={collapsed} />
    </motion.aside>
  );

  /* Mobile: hamburger + overlay drawer */
  return (
    <>
      {/* Hamburger trigger */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setMobileOpen(true)}
        style={{
          position: "fixed", top: 14, left: 14, zIndex: 300,
          width: 40, height: 40, borderRadius: "var(--r-md)",
          background: "rgba(13,20,37,.9)", backdropFilter: "blur(12px)",
          border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--text-1)",
        }}
      >
        <Menu size={18} />
      </motion.button>

      {/* Overlay + drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 250, backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="glass"
              style={{ position: "fixed", left: 0, top: 0, width: 240, height: "100vh", zIndex: 260, borderRight: "1px solid var(--border)", borderRadius: 0 }}
            >
              <button onClick={() => setMobileOpen(false)} style={{
                position: "absolute", top: 14, right: 14,
                background: "none", border: "none", cursor: "pointer", color: "var(--text-3)",
              }}>
                <X size={18} />
              </button>
              <SidebarContent col={false} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
