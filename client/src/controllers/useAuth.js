/**
 * CONTROLLER — useAuth (thin wrapper around Firebase AuthContext)
 * Uses the AuthContext hook for the controller layer.
 * Note: Must re-export as a default to avoid Vite Fast Refresh conflicts.
 */
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function useAuth() {
  return useContext(AuthContext);
}
