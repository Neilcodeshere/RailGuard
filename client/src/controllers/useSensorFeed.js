/**
 * CONTROLLER — useSensorFeed
 * Listens to Firebase RTDB for the selected vehicle's sensor logs and bot control.
 * Paths are derived from the selected vehicle's logPath / ctrlPath.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { ref, onValue, set } from "firebase/database";
import { database } from "../config/firebase";
import { parseFirebaseLog, getInitialReports, createGpsTelemetry } from "../models/sensorModel";
import { sendWhatsAppAlert } from "./whatsappController";

export function useSensorFeed(vehicle, whatsappNumber) {
  const logPath  = vehicle?.logPath  ?? "railway_logs/RG-001";
  const ctrlPath = vehicle?.ctrlPath ?? "bot_control/RG-001";

  const [reports,       setReports]       = useState(() => getInitialReports(8));
  const [telemetry,     setTelemetry]     = useState(() => createGpsTelemetry());
  const [deviceOnline,  setDeviceOnline]  = useState(false);
  const [botRunning,    setBotRunning]    = useState(false);
  const [alertActive,   setAlertActive]   = useState(false);
  const [alertMsg,      setAlertMsg]      = useState("");
  const [rtdbConnected, setRtdbConnected] = useState(false);
  const hasRealData = useRef(false);
  const lastAlertId = useRef(null);

  // Reset when vehicle changes
  useEffect(() => {
    hasRealData.current = false;
    lastAlertId.current = null;
    setReports(getInitialReports(8));
    setTelemetry(createGpsTelemetry());
    setDeviceOnline(false);
    setBotRunning(false);
    setRtdbConnected(false);
  }, [logPath]);

  // Subscribe to logs
  useEffect(() => {
    const logsRef = ref(database, logPath);
    const unsub = onValue(logsRef, (snapshot) => {
      setRtdbConnected(true);
      setDeviceOnline(true);
      const raw = snapshot.val();
      if (!raw) return;

      const parsed = Object.entries(raw)
        .map(([key, payload]) => parseFirebaseLog(key, payload))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 100);

      if (parsed.length > 0) {
        hasRealData.current = true;
        setReports(parsed);

        const withGps = parsed.find(r => r.satellites > 0);
        if (withGps) {
          setTelemetry(prev => ({
            ...prev,
            latitude: withGps.latitude, longitude: withGps.longitude,
            corridor: withGps.corridor, satellites: withGps.satellites,
            speed: withGps.speed, timestamp: withGps.timestamp,
          }));
        }

        const latest = parsed[0];
        if (latest.buzzerActive) {
          setAlertActive(true);
          setAlertMsg(`⚠ ${latest.severity}: ${latest.type.replace("_"," ")} @ ${latest.corridor} — ${latest.ultrasonicCm} cm`);
          
          // WhatsApp Auto-Alert
          if (whatsappNumber && lastAlertId.current !== latest.id && (latest.severity === "CRITICAL" || latest.severity === "HIGH")) {
            lastAlertId.current = latest.id;
            sendWhatsAppAlert(whatsappNumber, {
              type: latest.type,
              vehicleName: vehicle?.name || "Unknown Vehicle",
              vehicleId: vehicle?.id || "N/A",
              corridor: latest.corridor,
              severity: latest.severity,
              location: latest.latitude ? `${latest.latitude}, ${latest.longitude}` : "Unknown",
              photoUrl: latest.photoUrl || "http://localhost:5173/dashboard",
            });
          }
        }
      }
    }, (err) => {
      console.error(`RTDB ${logPath} error:`, err.message);
      setRtdbConnected(false);
      setDeviceOnline(false);
    });
    return () => unsub();
  }, [logPath]);

  // Subscribe to bot_control
  useEffect(() => {
    const ctrlRef = ref(database, ctrlPath);
    const unsub = onValue(ctrlRef, (snap) => setBotRunning(snap.val() === 1),
      err => console.error(`RTDB ${ctrlPath}:`, err.message));
    return () => unsub();
  }, [ctrlPath]);

  const sendBotCommand = useCallback(async (cmd) => {
    try { await set(ref(database, ctrlPath), cmd); }
    catch (err) { console.error("Bot command failed:", err.message); }
  }, [ctrlPath]);

  const startBot = useCallback(() => sendBotCommand(1), [sendBotCommand]);
  const stopBot  = useCallback(() => sendBotCommand(0), [sendBotCommand]);
  const clearAlerts = useCallback(() => { setAlertActive(false); setAlertMsg(""); }, []);

  const criticalReports = reports.filter(r => r.severity === "CRITICAL" || r.severity === "HIGH");
  const todayStr = new Date().toDateString();
  const stats = {
    total:    reports.length,
    critical: criticalReports.length,
    today:    reports.filter(r => new Date(r.timestamp).toDateString() === todayStr).length,
    avgConfidence: reports.length
      ? parseFloat((reports.reduce((s, r) => s + r.confidence, 0) / reports.length).toFixed(1))
      : 0,
  };

  return {
    reports, telemetry, stats, criticalReports,
    deviceOnline, rtdbConnected, botRunning,
    alertActive, alertMsg, clearAlerts,
    startBot, stopBot,
  };
}
