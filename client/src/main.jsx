/**
 * ENTRY — main.jsx
 * Renders Preloader first, then the authenticated app shell.
 */
import React, { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import Preloader from "./views/components/Preloader";
import App from "./App";
import { ToastProvider } from "./contexts/ToastContext";
import "./index.css";

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 32, color: "#ef4444", fontFamily: "monospace" }}>
        <h2>⚠ Render Error</h2>
        <pre style={{ marginTop: 12, fontSize: 12 }}>{this.state.error.message}</pre>
      </div>
    );
    return this.props.children;
  }
}

function Root() {
  const [ready, setReady] = useState(false);
  return (
    <>
      <AnimatePresence>
        {!ready && <Preloader key="preloader" onDone={() => setReady(true)} />}
      </AnimatePresence>
      {ready && (
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      )}
    </>
  );
}

const el = document.getElementById("root");
if (el) createRoot(el).render(<StrictMode><Root /></StrictMode>);
