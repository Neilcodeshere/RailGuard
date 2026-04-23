/**
 * APP — Root MVC coordinator
 * Manages auth, Firestore user profile, selected vehicle, and page routing.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Controllers
import { useAuth }        from "./contexts/AuthContext";
import { useSensorFeed }  from "./controllers/useSensorFeed";
import { useVehicles }    from "./controllers/useVehicles";
import { useUserProfile } from "./controllers/useUserProfile";

// Views
import LoginPage     from "./views/pages/LoginPage";
import DashboardPage from "./views/pages/DashboardPage";
import MapPage       from "./views/pages/MapPage";
import TelemetryPage from "./views/pages/TelemetryPage";
import HistoryPage   from "./views/pages/HistoryPage";
import CameraPage    from "./views/pages/CameraPage";
import Sidebar       from "./views/components/Sidebar";
import Topbar        from "./views/components/Topbar";
import AlertBanner   from "./views/components/AlertBanner";

const PAGE_TRANSITION = {
  initial:    { opacity: 0, y: 10 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -10 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

/* ── Dashboard shell (rendered once vehicle is chosen) ─────────────────────── */
function DashboardShell({ currentUser, profile, logout, selectedVehicle, vehicles, onSwitchVehicle, vehiclesLoading, onSaveWhatsapp }) {
  const {
    reports, telemetry, deviceOnline, rtdbConnected,
    alertActive, alertMsg, stats, criticalReports, clearAlerts,
    botRunning, startBot, stopBot,
  } = useSensorFeed(selectedVehicle, profile?.whatsappNumber);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const sidebarWidth = isMobile ? 0 : (collapsed ? 72 : 220);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-void)" }}>
      <AlertBanner active={alertActive} message={alertMsg} onDismiss={clearAlerts} />

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
        criticalCount={criticalReports.length}
        vehicles={vehicles}
        vehiclesLoading={vehiclesLoading}
        selectedVehicle={selectedVehicle}
        onSwitchVehicle={onSwitchVehicle}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        whatsappNumber={profile?.whatsappNumber}
        onSaveWhatsapp={onSaveWhatsapp}
      />

      <div style={{
        flex: 1,
        marginLeft: sidebarWidth,
        display: "flex", flexDirection: "column",
        transition: "margin-left 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        minWidth: 0, overflow: "hidden",
      }}>
        <Topbar
          telemetry={telemetry}
          deviceOnline={deviceOnline}
          rtdbConnected={rtdbConnected}
          user={currentUser}
          vehicle={selectedVehicle}
          whatsappNumber={profile?.whatsappNumber}
        />

        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div key="dashboard" {...PAGE_TRANSITION}>
                <DashboardPage
                  reports={reports} stats={stats} telemetry={telemetry}
                  deviceOnline={deviceOnline} rtdbConnected={rtdbConnected}
                  botRunning={botRunning} startBot={startBot} stopBot={stopBot}
                  vehicle={selectedVehicle}
                  whatsappNumber={profile?.whatsappNumber}
                />
              </motion.div>
            )}
            {activeTab === "map" && (
              <motion.div key="map" {...PAGE_TRANSITION} style={{ height: "100%" }}>
                <MapPage reports={reports} telemetry={telemetry} />
              </motion.div>
            )}
            {activeTab === "telemetry" && (
              <motion.div key="telemetry" {...PAGE_TRANSITION}>
                <TelemetryPage telemetry={telemetry} reports={reports} />
              </motion.div>
            )}
            {activeTab === "history" && (
              <motion.div key="history" {...PAGE_TRANSITION}>
                <HistoryPage 
                  reports={reports} 
                  whatsappNumber={profile?.whatsappNumber}
                  vehicle={selectedVehicle}
                />
              </motion.div>
            )}
            {activeTab === "camera" && (
              <motion.div key="camera" {...PAGE_TRANSITION}>
                <CameraPage />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* ── Root ──────────────────────────────────────────────────────────────────── */
export default function App() {
  const { currentUser, logout }                      = useAuth();
  const { vehicles, loading: vehiclesLoading }        = useVehicles();
  const { profile, loading: profileLoading,
          saveLastVehicle, saveWhatsappNumber }       = useUserProfile(currentUser);
  const [selectedVehicle, setSelectedVehicle]        = useState(null);
  const [vehicleRestored, setVehicleRestored]        = useState(false);

  // Auto-restore last used vehicle from Firestore profile
  useEffect(() => {
    if (vehicleRestored) return;                     // only run once per login
    if (profileLoading || vehiclesLoading) return;   // wait for both to load
    if (!currentUser || !profile) return;

    const lastId = profile.lastVehicleId;
    if (lastId && vehicles.length > 0) {
      const found = vehicles.find(v => v.id === lastId);
      if (found) {
        setSelectedVehicle(found);
        setVehicleRestored(true);
        return;
      }
    }
    setVehicleRestored(true); // no previous vehicle — show picker
  }, [profile, vehicles, profileLoading, vehiclesLoading, vehicleRestored, currentUser]);

  // Reset on logout
  useEffect(() => {
    if (!currentUser) {
      setSelectedVehicle(null);
      setVehicleRestored(false);
    }
  }, [currentUser]);

  const handleVehicleSelected = (vehicle, whatsapp) => {
    setSelectedVehicle(vehicle);
    saveLastVehicle(vehicle.id);
    if (whatsapp) saveWhatsappNumber(whatsapp);
  };

  const handleSwitchVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    saveLastVehicle(vehicle.id);
  };

  // Not logged in → Login page (step 1 = auth, step 2 = vehicle picker)
  if (!currentUser) {
    return <LoginPage onVehicleSelected={handleVehicleSelected} />;
  }

  // Profile still loading — show minimal spinner
  if (profileLoading || (vehiclesLoading && !vehicleRestored)) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg-void)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
      }}>
        <motion.div
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{ width: 36, height: 36, borderRadius: "50%",
            border: "3px solid rgba(245,166,35,.2)", borderTopColor: "#f5a623" }}
        />
        <p style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
          Restoring your session…
        </p>
      </div>
    );
  }

  // Logged in but no vehicle selected → show vehicle picker (step 2 only)
  if (!selectedVehicle) {
    return <LoginPage onVehicleSelected={handleVehicleSelected} />;
  }

  return (
    <DashboardShell
      currentUser={currentUser}
      profile={profile}
      logout={logout}
      selectedVehicle={selectedVehicle}
      vehicles={vehicles}
      vehiclesLoading={vehiclesLoading}
      onSwitchVehicle={handleSwitchVehicle}
      onSaveWhatsapp={saveWhatsappNumber}
    />
  );
}
