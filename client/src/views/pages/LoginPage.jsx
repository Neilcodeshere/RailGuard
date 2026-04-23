/**
 * VIEW — LoginPage v3
 * Step 1: Email/Password/Google/Phone auth
 * Step 2: Vehicle selection from Firebase registry
 * Fully responsive — stacked on mobile, split-screen on desktop.
 */
import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Train, Mail, Lock, Phone, Smartphone, KeyRound,
  Eye, EyeOff, ArrowRight, Shield, ChevronRight,
  CheckCircle, RefreshCw,
} from "lucide-react";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, signInWithPhoneNumber, RecaptchaVerifier,
} from "firebase/auth";
import { auth } from "../../config/firebase";
import { useVehicles } from "../../controllers/useVehicles";
import { STATUS_META } from "../../models/vehicleModel";
import { lazy } from "react";

const HeroGlobe = lazy(() => import("../components/HeroGlobe"));

const provider  = new GoogleAuthProvider();
const FEATURES  = [
  { icon: "📡", text: "Real-time GPS tracking via ESP8266" },
  { icon: "🔊", text: "Ultrasonic obstacle detection + buzzer" },
  { icon: "🔍", text: "AI-assisted crack detection (ESP32)" },
  { icon: "🚗", text: "Multi-vehicle fleet management" },
];

const slide = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22,1,0.36,1] } },
  exit:   (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.25 } }),
};

/* ── Vehicle picker (Step 2) ────────────────────────────────────────────────── */
function VehiclePicker({ onSelect, user }) {
  const { vehicles, loading } = useVehicles();
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg,#f5a623,#ef4444)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "#fff",
          }}>
            {user?.email?.[0]?.toUpperCase() ?? "R"}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>
              {user?.displayName ?? user?.email?.split("@")[0] ?? "Operator"}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-3)" }}>Authenticated ✓</p>
          </div>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>
          Select Vehicle
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-3)" }}>
          Choose the vehicle you want to monitor from the fleet.
        </p>
      </div>

      {/* Vehicle list */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-3)", padding: 20 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <RefreshCw size={15} />
          </motion.div>
          <span style={{ fontSize: 13 }}>Loading fleet from Firebase…</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {vehicles.map((v, i) => {
            const meta    = STATUS_META[v.status] ?? STATUS_META.OFFLINE;
            const isSel   = selected?.id === v.id;
            const offline = v.status !== "ONLINE";
            return (
              <motion.button
                key={v.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={offline ? {} : { x: 4 }}
                whileTap={offline ? {} : { scale: 0.98 }}
                onClick={() => !offline && setSelected(v)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px",
                  background: isSel
                    ? "linear-gradient(135deg,rgba(245,166,35,.14),rgba(239,68,68,.07))"
                    : "rgba(255,255,255,.03)",
                  border: isSel
                    ? "1px solid rgba(245,166,35,.4)"
                    : "1px solid var(--border)",
                  borderRadius: "var(--r-lg)",
                  cursor: offline ? "not-allowed" : "pointer",
                  opacity: offline ? 0.5 : 1,
                  textAlign: "left", width: "100%",
                  transition: "background .2s, border-color .2s",
                  boxShadow: isSel ? "0 0 20px rgba(245,166,35,.15)" : "none",
                }}
              >
                {/* Vehicle emoji */}
                <span style={{ fontSize: 26, flexShrink: 0 }}>{v.emoji ?? "🚗"}</span>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{v.name}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 99,
                      background: meta.bg, color: meta.color,
                      border: `1px solid ${meta.color}30`,
                      textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0,
                    }}>
                      {meta.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {v.type} · {v.corridor}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5 }}>
                    {/* battery bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 10, color: "var(--text-3)" }}>🔋</span>
                      <div style={{ width: 40, height: 4, background: "rgba(255,255,255,.1)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{
                          width: `${v.batteryPct}%`, height: "100%", borderRadius: 99,
                          background: v.batteryPct > 50 ? "var(--green)" : v.batteryPct > 20 ? "var(--amber)" : "var(--red)",
                        }} />
                      </div>
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>{v.batteryPct}%</span>
                    </div>
                    <span style={{ fontSize: 10, color: "var(--text-3)" }}>ID: {v.id}</span>
                  </div>
                </div>

                {/* Selection indicator */}
                {isSel
                  ? <CheckCircle size={18} color="var(--amber)" />
                  : <ChevronRight size={16} color="var(--text-3)" />
                }
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Confirm */}
      <motion.button
        whileHover={selected ? { scale: 1.02 } : {}}
        whileTap={selected ? { scale: 0.97 } : {}}
        disabled={!selected}
        onClick={() => selected && onSelect(selected)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          padding: "14px",
          background: selected
            ? "linear-gradient(135deg,#f5a623,#ef4444)"
            : "rgba(255,255,255,.05)",
          border: "none", borderRadius: "var(--r-lg)",
          cursor: selected ? "pointer" : "not-allowed",
          fontSize: 14, fontWeight: 800,
          color: selected ? "#fff" : "var(--text-3)",
          boxShadow: selected ? "0 6px 28px rgba(245,166,35,.35)" : "none",
          transition: "all .3s",
        }}
      >
        {selected ? `Launch Dashboard → ${selected.name}` : "Select a vehicle above"}
        {selected && <ArrowRight size={16} />}
      </motion.button>
    </div>
  );
}

/* ── Auth form (Step 1) ─────────────────────────────────────────────────────── */
function AuthForm({ onSuccess }) {
  const [mode,   setMode]   = useState("email"); // email | google | phone
  const [tab,    setTab]    = useState("signin"); // signin | signup
  const [email,  setEmail]  = useState("");
  const [pass,   setPass]   = useState("");
  const [phone,  setPhone]  = useState("");
  const [otp,    setOtp]    = useState("");
  const [show,   setShow]   = useState(false);
  const [err,    setErr]    = useState("");
  const [busy,   setBusy]   = useState(false);
  const [conf,   setConf]   = useState(null); // phone confirmation

  function getRecaptchaVerifier() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
    }
    return window.recaptchaVerifier;
  }

  const handleEmail = async e => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      if (tab === "signin") {
        await signInWithEmailAndPassword(auth, email, pass);
      } else {
        await createUserWithEmailAndPassword(auth, email, pass);
      }
      onSuccess();
    } catch (e) { setErr(e.message.replace("Firebase: ", "").replace(/\(.*\)/,"")); }
    finally { setBusy(false); }
  };

  const handleGoogle = async () => {
    setErr(""); setBusy(true);
    try { await signInWithPopup(auth, provider); onSuccess(); }
    catch (e) { setErr(e.message.replace("Firebase: ","")); }
    finally { setBusy(false); }
  };

  const handlePhone = async e => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const result = await signInWithPhoneNumber(auth, phone.startsWith("+") ? phone : `+${phone}`, getRecaptchaVerifier());
      setConf(result);
    } catch (e) { setErr(e.message.replace("Firebase: ","")); }
    finally { setBusy(false); }
  };

  const verifyOtp = async e => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { await conf.confirm(otp); onSuccess(); }
    catch (e) { setErr("Invalid OTP. Please try again."); }
    finally { setBusy(false); }
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px 12px 40px",
    background: "rgba(255,255,255,.05)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)", color: "var(--text-1)", fontSize: 14,
    outline: "none", boxSizing: "border-box",
    transition: "border-color .2s",
  };
  const iconWrap = { position: "relative" };
  const iconPos = { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", marginBottom: 6 }}>
          {tab === "signin" ? "Welcome back" : "Create account"}
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-3)" }}>
          {tab === "signin" ? "Sign in to access the fleet dashboard" : "Register to join the rail inspection team"}
        </p>
      </div>

      {/* Sign in / Sign up tabs */}
      <div style={{ display: "flex", background: "rgba(255,255,255,.04)", borderRadius: "var(--r-md)", padding: 3, gap: 3 }}>
        {["signin","signup"].map(t => (
          <button key={t} onClick={() => { setTab(t); setErr(""); }}
            style={{
              flex: 1, padding: "8px", borderRadius: "var(--r-sm)",
              background: tab === t ? "rgba(255,255,255,.1)" : "transparent",
              border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 700,
              color: tab === t ? "var(--text-1)" : "var(--text-3)",
              transition: "all .2s",
            }}
          >{t === "signin" ? "Sign In" : "Sign Up"}</button>
        ))}
      </div>

      {/* Auth mode tabs */}
      <div style={{ display: "flex", gap: 6 }}>
        {[
          { id: "email",  label: "Email", icon: <Mail size={12}/> },
          { id: "google", label: "Google", icon: <span style={{fontSize:12}}>G</span> },
          { id: "phone",  label: "Phone", icon: <Phone size={12}/> },
        ].map(({ id, label, icon }) => (
          <button key={id} onClick={() => { setMode(id); setErr(""); }}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              padding: "8px 6px",
              background: mode === id ? "rgba(245,166,35,.12)" : "rgba(255,255,255,.04)",
              border: `1px solid ${mode === id ? "rgba(245,166,35,.3)" : "var(--border)"}`,
              borderRadius: "var(--r-md)", cursor: "pointer",
              fontSize: 11, fontWeight: 700,
              color: mode === id ? "var(--amber)" : "var(--text-3)",
              transition: "all .2s",
            }}
          >{icon} {label}</button>
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {err && (
          <motion.p initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            style={{ fontSize:12, color:"var(--red)", background:"var(--red-lo)", padding:"10px 14px", borderRadius:"var(--r-md)", border:"1px solid rgba(239,68,68,.2)" }}>
            {err}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Email form */}
      {mode === "email" && (
        <form onSubmit={handleEmail} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={iconWrap}>
            <span style={iconPos}><Mail size={15}/></span>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@railway.gov.in" required style={inputStyle} />
          </div>
          <div style={iconWrap}>
            <span style={iconPos}><Lock size={15}/></span>
            <input value={pass} onChange={e=>setPass(e.target.value)} type={show?"text":"password"} placeholder="Password" required style={{...inputStyle, paddingRight:42}} />
            <button type="button" onClick={()=>setShow(s=>!s)}
              style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text-3)" }}>
              {show ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
          <motion.button type="submit" disabled={busy} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            style={{
              padding:"13px", borderRadius:"var(--r-lg)", border:"none", cursor:busy?"not-allowed":"pointer",
              background:"linear-gradient(135deg,#f5a623,#ef4444)",
              fontSize:14, fontWeight:800, color:"#fff",
              boxShadow:"0 6px 24px rgba(245,166,35,.35)",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              opacity: busy ? 0.7 : 1,
            }}>
            {busy ? <motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:.8,ease:"linear"}}><RefreshCw size={14}/></motion.span>
              : <>{tab === "signin" ? "Sign In" : "Create Account"} <ArrowRight size={14}/></>}
          </motion.button>
        </form>
      )}

      {/* Google */}
      {mode === "google" && (
        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={handleGoogle} disabled={busy}
          style={{
            display:"flex", alignItems:"center", justifyContent:"center", gap:12,
            padding:"13px", borderRadius:"var(--r-lg)", border:"1px solid var(--border)",
            background:"rgba(255,255,255,.06)", cursor:"pointer",
            fontSize:14, fontWeight:700, color:"var(--text-1)",
          }}>
          <span style={{fontSize:18}}>G</span> Continue with Google
        </motion.button>
      )}

      {/* Phone */}
      {mode === "phone" && !conf && (
        <form onSubmit={handlePhone} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={iconWrap}>
            <span style={iconPos}><Smartphone size={15}/></span>
            <input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" placeholder="+91 98765 43210" required style={inputStyle}/>
          </div>
          <motion.button type="submit" disabled={busy} whileHover={{scale:1.02}} whileTap={{scale:.97}}
            style={{ padding:"13px", borderRadius:"var(--r-lg)", border:"none", cursor:busy?"not-allowed":"pointer",
              background:"linear-gradient(135deg,#f5a623,#ef4444)", fontSize:14, fontWeight:800, color:"#fff",
              boxShadow:"0 6px 24px rgba(245,166,35,.35)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {busy ? <motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:.8}}><RefreshCw size={14}/></motion.span>
              : <>Send OTP <ArrowRight size={14}/></>}
          </motion.button>
        </form>
      )}
      {mode === "phone" && conf && (
        <form onSubmit={verifyOtp} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={iconWrap}>
            <span style={iconPos}><KeyRound size={15}/></span>
            <input value={otp} onChange={e=>setOtp(e.target.value)} type="text" placeholder="6-digit OTP" required style={inputStyle}/>
          </div>
          <motion.button type="submit" disabled={busy} whileHover={{scale:1.02}} whileTap={{scale:.97}}
            style={{ padding:"13px", borderRadius:"var(--r-lg)", border:"none", cursor:"pointer",
              background:"linear-gradient(135deg,#f5a623,#ef4444)", fontSize:14, fontWeight:800, color:"#fff",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            Verify OTP <ArrowRight size={14}/>
          </motion.button>
        </form>
      )}

      <div id="recaptcha-container" />

      <div style={{ display:"flex", alignItems:"center", gap:6, color:"var(--text-3)", fontSize:11 }}>
        <Shield size={11}/> Protected by Firebase · Ministry of Railways
      </div>
    </div>
  );
}

/* ── Main Login Page ────────────────────────────────────────────────────────── */
export default function LoginPage({ onVehicleSelected }) {
  const [step, setStep] = useState(1); // 1=auth, 2=vehicle pick
  const [dir,  setDir]  = useState(1);
  const [user, setUser] = useState(null);

  const handleAuthSuccess = () => {
    // Get the current Firebase user
    setUser(auth.currentUser);
    setDir(1);
    setStep(2);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "clamp(380px, 46%, 520px) 1fr",
      background: "var(--bg-void)",
    }}
      className="login-grid"
    >
      {/* ── Left panel (form) ── */}
      <div style={{
        padding: "clamp(24px,5vw,52px)",
        display: "flex", flexDirection: "column", justifyContent: "center",
        background: "rgba(13,20,37,.7)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
        minHeight: "100vh",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:40 }}>
          <motion.div whileHover={{ rotate:12, scale:1.1 }} style={{
            width:44, height:44, borderRadius:12,
            background:"linear-gradient(135deg,#f5a623,#ef4444)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 0 28px rgba(245,166,35,.45)",
          }}>
            <Train size={22} color="#fff"/>
          </motion.div>
          <div>
            <p style={{ fontWeight:800, fontSize:17, color:"var(--text-1)" }}>RailGuard</p>
            <p style={{ fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--text-3)" }}>Inspection System · V2.0</p>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:28 }}>
          {[1,2].map(s => (
            <div key={s} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <motion.div animate={{
                background: step >= s ? "linear-gradient(135deg,#f5a623,#ef4444)" : "rgba(255,255,255,.08)",
                borderColor: step >= s ? "rgba(245,166,35,.4)" : "var(--border)",
              }}
                style={{ width:24, height:24, borderRadius:"50%", border:"1px solid",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:800, color: step >= s ? "#fff" : "var(--text-3)" }}>
                {step > s ? "✓" : s}
              </motion.div>
              <span style={{ fontSize:11, color: step >= s ? "var(--text-2)" : "var(--text-3)", fontWeight:600 }}>
                {s === 1 ? "Authenticate" : "Select Vehicle"}
              </span>
              {s < 2 && <ChevronRight size={13} color="var(--text-3)"/>}
            </div>
          ))}
        </div>

        {/* Animated step content */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit">
            {step === 1
              ? <AuthForm onSuccess={handleAuthSuccess} />
              : <VehiclePicker onSelect={onVehicleSelected} user={user} />
            }
          </motion.div>
        </AnimatePresence>

        {/* Features (only on step 1) */}
        {step === 1 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
            style={{ marginTop:32, display:"flex", flexDirection:"column", gap:8 }}>
            {FEATURES.map((f,i) => (
              <motion.div key={i} initial={{ x:-16, opacity:0 }} animate={{ x:0, opacity:1 }}
                transition={{ delay: 0.55 + i*0.07 }}
                style={{ display:"flex", alignItems:"center", gap:10,
                  padding:"8px 12px", borderRadius:"var(--r-md)",
                  background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.05)" }}>
                <span style={{ fontSize:14 }}>{f.icon}</span>
                <span style={{ fontSize:11, color:"var(--text-3)" }}>{f.text}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Right panel — 3D vehicle only, no duplicate pills ── */}
      <div className="login-globe" style={{
        position: "relative",
        background: "radial-gradient(ellipse at 50% 45%, rgba(245,166,35,.07) 0%, transparent 65%)",
        display: "flex", flexDirection: "column",
      }}>
        <Suspense fallback={<div style={{ flex:1, background:"var(--bg-void)" }} />}>
          <HeroGlobe />
        </Suspense>
        {/* Minimal bottom label — no feature duplication */}
        <motion.div
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:1, duration:0.6 }}
          style={{
            position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)",
            textAlign:"center", pointerEvents:"none",
          }}
        >
          <p style={{ fontSize:13, fontWeight:700, color:"rgba(245,166,35,.8)", letterSpacing:"0.05em" }}>RG-001 Inspection Bot</p>
          <p style={{ fontSize:11, color:"rgba(255,255,255,.3)", marginTop:3 }}>Drag to orbit · Auto-rotates</p>
        </motion.div>
      </div>
    </div>
  );
}
