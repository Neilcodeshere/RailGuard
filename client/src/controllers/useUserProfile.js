/**
 * CONTROLLER — useUserProfile
 * Reads and writes the user's profile document in Firestore.
 * Firestore path: users/{uid}
 * Stores: lastVehicleId, displayName, email, lastLogin
 *
 * On every login, the profile is upserted.
 * When the user switches vehicle, lastVehicleId is updated.
 * On next login, the last vehicle is auto-selected.
 */
import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export function useUserProfile(currentUser) {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);

  // Load or create profile on login
  useEffect(() => {
    if (!currentUser) { setProfile(null); setLoading(false); return; }

    const ref = doc(db, "users", currentUser.uid);

    (async () => {
      try {
        const snap = await getDoc(ref);
        const base = {
          uid:           currentUser.uid,
          email:         currentUser.email ?? "",
          displayName:   currentUser.displayName ?? currentUser.email?.split("@")[0] ?? "Operator",
          photoURL:      currentUser.photoURL ?? null,
          lastLogin:     serverTimestamp(),
        };

        if (!snap.exists()) {
          // First time — create profile
          await setDoc(ref, { ...base, lastVehicleId: null, createdAt: serverTimestamp() });
          setProfile({ ...base, lastVehicleId: null });
        } else {
          // Existing — update lastLogin
          await updateDoc(ref, { lastLogin: serverTimestamp() });
          setProfile({ ...snap.data(), ...base });
        }
      } catch (err) {
        console.error("useUserProfile error:", err.message);
        // Graceful fallback — still allow login
        setProfile({ uid: currentUser.uid, email: currentUser.email, lastVehicleId: null });
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser?.uid]);

  /** Call this whenever the user switches vehicle */
  const saveLastVehicle = useCallback(async (vehicleId) => {
    if (!currentUser?.uid) return;
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        lastVehicleId: vehicleId,
        lastSwitchedAt: serverTimestamp(),
      });
      setProfile(prev => prev ? { ...prev, lastVehicleId: vehicleId } : prev);
    } catch (err) {
      console.error("saveLastVehicle error:", err.message);
    }
  }, [currentUser?.uid]);

  return { profile, loading, saveLastVehicle };
}
