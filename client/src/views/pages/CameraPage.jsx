/**
 * VIEW — CameraPage
 * ESP32-CAM live stream viewer + Feedback form
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Link2, Play, RefreshCw, WifiOff, Wifi,
  MessageSquare, Star, Send, CheckCircle, X, AlertCircle,
} from "lucide-react";

/* ── tiny helpers ─────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

/* ══════════════════════════════════════════════════════════════════════════ */
/*  ESP32 Camera Section                                                      */
/* ══════════════════════════════════════════════════════════════════════════ */
function CameraSection() {
  const [url,        setUrl]        = useState("");
  const [activeUrl,  setActiveUrl]  = useState("");
  const [mode,       setMode]       = useState("page"); // page | direct
  const [status,     setStatus]     = useState("idle"); // idle | loading | live | error
  const [inputFocus, setInputFocus] = useState(false);
  const inputRef = useRef(null);

  // Launch stream whenever activeUrl changes
  useEffect(() => {
    if (!activeUrl) return;
    setStatus("loading");
  }, [activeUrl, mode]);

  const launch = () => {
    let cleaned = url.trim();
    if (!cleaned) return;
    if (!/^https?:\/\//i.test(cleaned)) cleaned = "http://" + cleaned;
    setActiveUrl(cleaned);
    setUrl(cleaned);
  };

  const handleKey = (e) => { if (e.key === "Enter") launch(); };
  const clear      = () => { setActiveUrl(""); setUrl(""); setStatus("idle"); };

  return (
    <motion.div variants={fadeUp} className="glass noise"
      style={{ borderRadius: "var(--r-xl)", overflow: "hidden" }}
    >
      {/* ── header ── */}
      <div style={{
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg,rgba(6,182,212,.25),rgba(6,182,212,.06))",
            border: "1px solid rgba(6,182,212,.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Camera size={16} color="var(--cyan)" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: "var(--text-1)" }}>ESP32-CAM Live Stream</p>
            <p style={{ fontSize: 11, color: "var(--text-3)" }}>Real-time visual monitoring</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Mode Switcher */}
          <div style={{
            display: "flex", background: "rgba(255,255,255,.05)", padding: 3, borderRadius: 8, border: "1px solid var(--border)"
          }}>
            {["page", "direct"].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: "4px 10px", borderRadius: 6, border: "none", fontSize: 10, fontWeight: 700,
                  background: mode === m ? "rgba(6,182,212,.2)" : "transparent",
                  color: mode === m ? "var(--cyan)" : "var(--text-3)",
                  cursor: "pointer", transition: "all .2s",
                  textTransform: "uppercase"
                }}
              >
                {m === "page" ? "Web UI" : "MJPEG Stream"}
              </button>
            ))}
          </div>

          {/* status pill */}
          <motion.div
            animate={{
              background: status === "live"    ? "rgba(34,197,94,.12)"  :
                          status === "error"   ? "rgba(239,68,68,.12)"  :
                          status === "loading" ? "rgba(245,166,35,.12)" :
                                                "rgba(255,255,255,.05)",
              borderColor: status === "live"    ? "rgba(34,197,94,.35)"  :
                           status === "error"   ? "rgba(239,68,68,.35)"  :
                           status === "loading" ? "rgba(245,166,35,.35)" :
                                                 "var(--border)",
            }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 99, border: "1px solid",
              fontSize: 11, fontWeight: 700,
              color: status === "live"    ? "var(--green)"  :
                     status === "error"   ? "var(--red)"    :
                     status === "loading" ? "var(--amber)"  : "var(--text-3)",
            }}
          >
            {status === "live"    && <><motion.span animate={{ opacity: [1,.3,1] }} transition={{ repeat: Infinity, duration: 1.3 }}>●</motion.span> LIVE</>}
            {status === "error"   && <><WifiOff size={10} /> OFFLINE</>}
            {status === "loading" && <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: .9, ease: "linear" }}><RefreshCw size={10} /></motion.span> Connecting…</>}
            {status === "idle"    && <><Wifi size={10} /> Ready</>}
          </motion.div>
        </div>
      </div>

      {/* ── URL input bar ── */}
      <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
        <div style={{
          display: "flex", gap: 10, alignItems: "stretch",
        }}>
          <div style={{
            flex: 1, position: "relative",
            borderRadius: "var(--r-md)",
            border: `1px solid ${inputFocus ? "rgba(6,182,212,.5)" : "var(--border)"}`,
            background: "rgba(255,255,255,.04)",
            boxShadow: inputFocus ? "0 0 0 3px rgba(6,182,212,.1)" : "none",
            transition: "border-color .2s, box-shadow .2s",
            display: "flex", alignItems: "center",
          }}>
            <span style={{ paddingLeft: 14, color: "var(--text-3)", flexShrink: 0 }}>
              <Link2 size={15} />
            </span>
            <input
              ref={inputRef}
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
              placeholder={mode === "page" ? "http://192.168.x.x (Web Panel)" : "http://192.168.x.x:81/stream (Raw MJPEG)"}
              style={{
                flex: 1, padding: "12px 14px",
                background: "transparent", border: "none",
                color: "var(--text-1)", fontSize: 13,
                outline: "none", fontFamily: "var(--font-mono)",
              }}
            />
            {url && (
              <button onClick={clear} style={{
                paddingRight: 12, background: "none", border: "none",
                cursor: "pointer", color: "var(--text-3)",
              }}>
                <X size={14} />
              </button>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={launch}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 20px", borderRadius: "var(--r-md)", border: "none",
              background: "linear-gradient(135deg,#06b6d4,#0891b2)",
              color: "#fff", fontSize: 13, fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 18px rgba(6,182,212,.35)",
            }}
          >
            <Play size={13} fill="#fff" /> Stream
          </motion.button>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>
          💡 Tip: Use <strong style={{ color: "var(--cyan)" }}>MJPEG Stream</strong> mode if you want to see the raw feed directly without the camera's web UI.
        </p>
      </div>

      {/* ── Stream viewer ── */}
      <div style={{
        position: "relative", width: "100%", minHeight: 420,
        background: "rgba(0,0,0,.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <AnimatePresence mode="wait">
          {activeUrl ? (
            <motion.div key={activeUrl + mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ width: "100%", height: 420, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
            >
              {mode === "page" ? (
                <iframe
                  src={activeUrl}
                  title="ESP32-CAM Page"
                  allow="camera"
                  style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                  onLoad={() => setStatus("live")}
                  onError={() => setStatus("error")}
                />
              ) : (
                <img
                  src={activeUrl}
                  alt="ESP32 MJPEG Stream"
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  onLoad={() => setStatus("live")}
                  onError={() => setStatus("error")}
                />
              )}
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: 40, textAlign: "center" }}
            >
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(6,182,212,.08)",
                border: "1px solid rgba(6,182,212,.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Camera size={30} color="var(--cyan)" strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-2)", marginBottom: 6 }}>No Stream Active</p>
                <p style={{ fontSize: 12, color: "var(--text-3)", maxWidth: 320 }}>
                  Enter your ESP32-CAM's address above and press <strong style={{ color: "var(--cyan)" }}>Stream</strong>.
                  Toggle mode if the image doesn't appear.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Feedback Form Section                                                     */
/* ══════════════════════════════════════════════════════════════════════════ */
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <motion.button
          key={n}
          type="button"
          whileHover={{ scale: 1.25 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 2,
          }}
        >
          <Star
            size={24}
            fill={(hover || value) >= n ? "#f5a623" : "none"}
            color={(hover || value) >= n ? "#f5a623" : "var(--text-3)"}
            strokeWidth={1.5}
          />
        </motion.button>
      ))}
    </div>
  );
}

function FeedbackSection() {
  const [form, setForm] = useState({ name: "", email: "", category: "general", rating: 0, message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    background: "rgba(255,255,255,.04)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    color: "var(--text-1)", fontSize: 13,
    outline: "none", boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s",
    fontFamily: "var(--font-sans)",
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.message.trim()) e.message = "Message is required";
    if (!form.rating) e.rating = "Please select a rating";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setBusy(true);
    // Simulate async submit
    await new Promise(r => setTimeout(r, 1200));
    setBusy(false);
    setSubmitted(true);
  };

  const reset = () => {
    setForm({ name: "", email: "", category: "general", rating: 0, message: "" });
    setSubmitted(false);
  };

  const CATEGORIES = [
    { id: "general",     label: "General" },
    { id: "bug",         label: "🐛 Bug Report" },
    { id: "feature",     label: "💡 Feature Request" },
    { id: "performance", label: "⚡ Performance" },
    { id: "camera",      label: "📷 Camera Issue" },
  ];

  return (
    <motion.div variants={fadeUp} className="glass noise"
      style={{ borderRadius: "var(--r-xl)", overflow: "hidden" }}
    >
      {/* header */}
      <div style={{
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: "linear-gradient(135deg,rgba(245,166,35,.25),rgba(239,68,68,.1))",
          border: "1px solid rgba(245,166,35,.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <MessageSquare size={16} color="var(--amber)" />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: "var(--text-1)" }}>Send Feedback</p>
          <p style={{ fontSize: 11, color: "var(--text-3)" }}>Help us improve RailGuard</p>
        </div>
      </div>

      <div style={{ padding: "24px 22px" }}>
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 0", textAlign: "center" }}
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 250, damping: 18 }}
                style={{
                  width: 68, height: 68, borderRadius: "50%",
                  background: "rgba(34,197,94,.12)",
                  border: "1px solid rgba(34,197,94,.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <CheckCircle size={32} color="var(--green)" />
              </motion.div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>Thank you, {form.name.split(" ")[0]}!</p>
                <p style={{ fontSize: 13, color: "var(--text-3)", maxWidth: 300 }}>
                  Your feedback has been recorded. Our team will review it shortly.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={reset}
                style={{
                  padding: "10px 24px", borderRadius: "var(--r-md)", border: "1px solid var(--border)",
                  background: "rgba(255,255,255,.05)", color: "var(--text-2)",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Send Another
              </motion.button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* Row 1: name + email */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                    style={{ ...inputStyle, borderColor: errors.name ? "var(--red)" : "var(--border)" }}
                  />
                  {errors.name && <p style={{ fontSize: 10, color: "var(--red)", marginTop: 4 }}>{errors.name}</p>}
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Email</label>
                  <input
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    type="email"
                    style={{ ...inputStyle, borderColor: errors.email ? "var(--red)" : "var(--border)" }}
                  />
                  {errors.email && <p style={{ fontSize: 10, color: "var(--red)", marginTop: 4 }}>{errors.email}</p>}
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Category</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, category: c.id }))}
                      style={{
                        padding: "6px 14px", borderRadius: 99,
                        border: `1px solid ${form.category === c.id ? "rgba(245,166,35,.4)" : "var(--border)"}`,
                        background: form.category === c.id ? "rgba(245,166,35,.12)" : "rgba(255,255,255,.04)",
                        color: form.category === c.id ? "var(--amber)" : "var(--text-3)",
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                        transition: "all .18s",
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Star rating */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Overall Rating</label>
                <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
                {errors.rating && <p style={{ fontSize: 10, color: "var(--red)", marginTop: 4 }}>{errors.rating}</p>}
              </div>

              {/* Message */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your feedback, issue, or suggestion in detail…"
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: "vertical", lineHeight: 1.6,
                    borderColor: errors.message ? "var(--red)" : "var(--border)",
                  }}
                />
                {errors.message && <p style={{ fontSize: 10, color: "var(--red)", marginTop: 4 }}>{errors.message}</p>}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={busy}
                whileHover={busy ? {} : { scale: 1.02 }}
                whileTap={busy ? {} : { scale: 0.97 }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px", borderRadius: "var(--r-lg)", border: "none",
                  background: "linear-gradient(135deg,#f5a623,#ef4444)",
                  color: "#fff", fontSize: 14, fontWeight: 800,
                  cursor: busy ? "not-allowed" : "pointer",
                  boxShadow: "0 6px 24px rgba(245,166,35,.35)",
                  opacity: busy ? 0.75 : 1,
                  transition: "opacity .2s",
                }}
              >
                {busy
                  ? <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: .8, ease: "linear" }}><RefreshCw size={14} /></motion.span> Sending…</>
                  : <><Send size={14} /> Submit Feedback</>
                }
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Page export                                                               */
/* ══════════════════════════════════════════════════════════════════════════ */
export default function CameraPage() {
  return (
    <motion.div
      variants={stagger} initial="hidden" animate="show"
      style={{ padding: "clamp(16px,3vw,28px)", display: "flex", flexDirection: "column", gap: 22 }}
    >
      {/* Page title */}
      <motion.div variants={fadeUp}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>
          📷 Camera & Feedback
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-3)" }}>
          Connect to your ESP32-CAM live stream and send us your feedback.
        </p>
      </motion.div>

      {/* Camera */}
      <CameraSection />

      {/* Feedback */}
      <FeedbackSection />
    </motion.div>
  );
}
