/**
 * CONTROLLER — whatsappController
 * Sends WhatsApp messages via Twilio Sandbox API.
 *
 * ── SETUP ─────────────────────────────────────────────────────────────────
 * 1. Go to console.twilio.com → Messaging → Try it out → Send a WhatsApp message
 * 2. Copy your Account SID and Auth Token from the Twilio Console homepage
 * 3. Paste them below
 * 4. Your recipient must first send "join heat-taste" to +1 415 523 8886 on WhatsApp
 * ──────────────────────────────────────────────────────────────────────────
 */

const TWILIO_SID   = import.meta.env.VITE_TWILIO_SID;
const TWILIO_TOKEN = import.meta.env.VITE_TWILIO_TOKEN;
const TWILIO_FROM  = "whatsapp:+14155238886"; // Twilio Sandbox number

/** Format a phone number to whatsapp:+<country><number> */
function formatWA(num) {
  if (!num) return null;
  const clean = num.replace(/\s+/g, "").trim();
  if (clean.startsWith("whatsapp:")) return clean;
  return `whatsapp:${clean.startsWith("+") ? clean : "+" + clean}`;
}

/** Check if Twilio credentials are configured */
function checkCredentials() {
  if (!TWILIO_TOKEN || TWILIO_TOKEN === "YOUR_TWILIO_AUTH_TOKEN_HERE" || TWILIO_TOKEN.length < 20) {
    return {
      ok: false,
      error: "Twilio Auth Token not configured. Open src/controllers/whatsappController.js and paste your real Auth Token from console.twilio.com",
    };
  }
  return { ok: true };
}

/** Send via Twilio REST API */
async function twilioSend(to, body) {
  const cred = checkCredentials();
  if (!cred.ok) return { success: false, error: cred.error };

  const formattedTo = formatWA(to);
  if (!formattedTo) return { success: false, error: "Invalid WhatsApp number" };

  const params = new URLSearchParams();
  params.append("To",   formattedTo);
  params.append("From", TWILIO_FROM);
  params.append("Body", body);

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

    const data = await res.json();
    if (res.ok) {
      console.log("✅ WhatsApp sent:", data.sid);
      return { success: true, sid: data.sid };
    }

    // Twilio error codes
    const msg = data.message ?? "Unknown Twilio error";
    const code = data.code ?? 0;

    if (res.status === 401) {
      return { success: false, error: "Auth failed — double-check your Twilio Auth Token in whatsappController.js" };
    }
    if (code === 63007 || code === 63001) {
      return { success: false, error: "Recipient hasn't joined the sandbox. They must text \"join heat-taste\" to +1 415 523 8886 first." };
    }
    return { success: false, error: `Twilio error ${code}: ${msg}` };

  } catch (err) {
    return { success: false, error: "Network error — cannot reach Twilio. Check internet connection." };
  }
}

/**
 * Sends a live detection alert to a WhatsApp number
 */
export async function sendWhatsAppAlert(to, info = {}) {
  const { type, vehicleName, vehicleId, location, photoUrl, severity, corridor } = info;

  const body = `🚨 *RAILGUARD ALERT: ${severity}*\n\n` +
    `*Type:* ${(type || "DETECTION").replace(/_/g, " ")}\n` +
    `*Vehicle:* ${vehicleName} (${vehicleId})\n` +
    `*Corridor:* ${corridor}\n` +
    `*Location:* ${location || "Unknown"}\n` +
    `*Photo:* ${photoUrl || "N/A"}\n\n` +
    `_Please check the RailGuard dashboard immediately._`;

  return twilioSend(to, body);
}

/**
 * Sends a daily summary report to a WhatsApp number
 */
export async function sendWhatsAppSummary(to, stats = {}) {
  const { total, critical, today, vehicleName } = stats;

  const body = `📊 *RAILGUARD DAILY SUMMARY*\n\n` +
    `*Vehicle:* ${vehicleName || "Unknown"}\n` +
    `*Total Detections:* ${total ?? 0}\n` +
    `*Critical / High:* ${critical ?? 0}\n` +
    `*Events Today:* ${today ?? 0}\n\n` +
    `_Generated at ${new Date().toLocaleTimeString("en-IN")}_`;

  return twilioSend(to, body);
}
