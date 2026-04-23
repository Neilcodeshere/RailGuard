/**
 * CONTROLLER — useVehicles
 * Manages Firebase vehicle registry at /vehicles.
 * Seeds default vehicles if the node is empty.
 */
import { useState, useEffect, useCallback } from "react";
import { ref, onValue, set, update, off } from "firebase/database";
import { database } from "../config/firebase";
import { SEED_VEHICLES } from "../models/vehicleModel";

export function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const vehiclesRef = ref(database, "vehicles");

    const unsub = onValue(vehiclesRef, (snap) => {
      const raw = snap.val();

      if (!raw) {
        // Seed default vehicles on first run
        const seedObj = {};
        SEED_VEHICLES.forEach(v => { seedObj[v.id] = v; });
        set(vehiclesRef, seedObj).catch(console.error);
        setVehicles(SEED_VEHICLES);
      } else {
        const list = Object.entries(raw).map(([id, data]) => ({ id, ...data }));
        setVehicles(list);
      }
      setLoading(false);
    }, (err) => {
      console.error("useVehicles RTDB error:", err.message);
      setVehicles(SEED_VEHICLES); // fallback
      setLoading(false);
    });

    return () => off(vehiclesRef, "value", unsub);
  }, []);

  /** Update a vehicle's status / battery / lastSeen */
  const updateVehicle = useCallback(async (id, patch) => {
    try {
      await update(ref(database, `vehicles/${id}`), patch);
    } catch (err) {
      console.error("updateVehicle error:", err.message);
    }
  }, []);

  return { vehicles, loading, updateVehicle };
}
