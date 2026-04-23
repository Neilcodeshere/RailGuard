/**
 * APP — Root MVC coordinator
 * Manages auth state, selected vehicle, and routes between Login and dashboard.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Controllers
import { useAuth }         from "./contexts/AuthContext";
import { useSensorFeed }   from "./controllers/useSensorFeed";
import { useVehicles }     from "./controllers/useVehicles";

// Views
import LoginPage     from "./views/pages/LoginPage";
import DashboardPage from "./views/pages/DashboardPage";
import MapPage       from "./views/pages/MapPage";
import TelemetryPage from "./views/pages/TelemetryPage";
import HistoryPage   from "./views/pages/HistoryPage";
import Sidebar       from "./views/components/Sidebar";
import Topbar        from "./views/components/Topbar";
import AlertBanner   from "./views/components/AlertBanner";

const PAGE_TRANSITION = {
  initial:    { opacity: 0, y: 10 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -10 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

function DashboardShell({ currentUser, logout, selectedVehicle, vehicles, onSwitchVehicle }) {
  const {
    reports, telemetry, deviceOnline, rtdbConnected,
    alertActive, alertMsg, stats, criticalReports, clearAlerts,
    botRunning, startBot, stopBot,
  } = useSensorFeed(selectedVehicle);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-void)" }}>
      <AlertBanner active={alertActive} message={alertMsg} onDismiss={clearAlerts} />

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
        criticalCount={criticalReports.length}
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        onSwitchVehicle={onSwitchVehicle}
      />

      <div style={{ flex: 1, marginLeft: isMobile ? 0 : 220, display: "flex", flexDirection: "column", transition: "margin-left 0.35s", minWidth: 0 }}>
        <Topbar
          telemetry={telemetry}
          deviceOnline={deviceOnline}
          rtdbConnected={rtdbConnected}
          user={currentUser}
          vehicle={selectedVehicle}
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
                <HistoryPage reports={reports} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { currentUser, logout } = useAuth();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // When user logs in and no vehicle selected, show login → vehicle pick
  // selectedVehicle is set by LoginPage's onVehicleSelected callback
  const handleVehicleSelected = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleSwitchVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  // If logged in but no vehicle selected yet, persist the first online vehicle as default
  useEffect(() => {
    if (currentUser && !selectedVehicle && !vehiclesLoading && vehicles.length > 0) {
      // Don't auto-select — force the user through the vehicle picker step
      // (selectedVehicle stays null until login flow completes)
    }
  }, [currentUser, selectedVehicle, vehiclesLoading, vehicles]);

  // Not logged in → show login
  if (!currentUser) {
    return <LoginPage onVehicleSelected={handleVehicleSelected} />;
  }

  // Logged in but no vehicle chosen (e.g. page refresh) → re-show vehicle picker
  if (!selectedVehicle) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-void)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoginPage onVehicleSelected={handleVehicleSelected} />
      </div>
    );
  }

  return (
    <DashboardShell
      currentUser={currentUser}
      logout={logout}
      selectedVehicle={selectedVehicle}
      vehicles={vehicles}
      onSwitchVehicle={handleSwitchVehicle}
    />
  );
}
