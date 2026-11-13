# RailGuard

A monitoring dashboard for a small railway inspection bot. The bot drives along a track with an ultrasonic sensor and pushes its readings to Firebase. The dashboard shows them live, flags dangerous readings, puts them on a map and can send a WhatsApp alert.

This was a team mini-project. The repo holds the web dashboard; the bot's sensor firmware isn't in it yet (see [Current Limitations](#current-limitations)).

## Overview

The idea was a cheap way to catch obstacles and track damage early, without someone walking the line. The bot measures the distance to whatever is in front of it. A very short distance means something is on or close to the rail, and the dashboard turns that into a severity level and raises an alert.

We started with an Express + MongoDB + Socket.io backend and moved to Firebase partway through. The bot writes straight to the Realtime Database and the React app listens to it, so there's no server of our own to run.

## Features

- Sign in with email/password, Google or phone number (Firebase Auth)
- Live feed of readings from the Realtime Database for the selected bot
- Severity from the ultrasonic distance: ≤ 5 cm critical, ≤ 10 cm high, ≤ 25 cm medium, otherwise low
- Alert banner for high and critical readings, plus an optional WhatsApp message through the Twilio sandbox
- Start and stop the bot from the dashboard (writes `1` or `0` to its control node)
- Several bots, each with its own log and control path; a default set is written to Firebase on first run
- Leaflet map of readings, using GPS when the bot has a fix
- Telemetry page with gauges, a compass and the buzzer state
- History page with sorting, filtering and CSV export
- A page for viewing an ESP32-CAM stream (raw MJPEG or the camera's web panel) by entering its local IP
- Per-user profile in Firestore (last selected bot, WhatsApp number)

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Framer Motion
- **Maps and 3D:** Leaflet / react-leaflet, three.js with @react-three/fiber for the landing globe
- **Backend services:** Firebase Auth, Realtime Database, Firestore
- **Alerts:** Twilio WhatsApp sandbox
- **Hardware:** ESP8266 with an ultrasonic sensor, ESP32-CAM for the video stream

## Project Structure

The client is split loosely into models, views and controllers:

```
client/
  src/
    config/firebase.js       Firebase app, auth, RTDB and Firestore
    models/                  sensor and vehicle data shapes, parsing, seed data
    controllers/             hooks: auth, sensor feed, vehicles, user profile, WhatsApp
    contexts/                auth and toast providers
    views/pages/             dashboard, map, telemetry, history, camera, login
    views/components/        sidebar, top bar, vehicle switcher, globe, stat cards
hardware/
  esp32_cam_sketch/          ESP8266 Wi-Fi test sketch (not the sensor firmware)
```

## Getting Started

You need Node.js 18+ and a Firebase project with Authentication, Realtime Database and Firestore enabled.

```bash
git clone https://github.com/Neilcodeshere/RailGuard.git
cd RailGuard/client
npm install
cp .env.example .env     # only needed for WhatsApp alerts
npm run dev              # http://localhost:5173
```

The Firebase project settings are in `client/src/config/firebase.js`. Replace them with your own project's web config if you're running your own copy.

To build for production:

```bash
npm run build
npm run preview
```

### Data the dashboard expects

Each bot writes readings to `railway_logs/<botId>` with `push`, and reads its run state from `bot_control/<botId>`:

```json
// railway_logs/RG-001/<pushId>
{ "distance": 8.4, "latitude": 19.07, "longitude": 72.88, "satellites": 6 }

// bot_control/RG-001
1
```

Only `distance` is required. Without GPS fields the reading is placed near a default corridor on the map.

## Environment Variables

Only the WhatsApp alerts use environment variables, in `client/.env`:

| Variable | Purpose |
|---|---|
| `VITE_TWILIO_SID` | Twilio account SID |
| `VITE_TWILIO_TOKEN` | Twilio auth token |

The recipient has to join the Twilio sandbox from WhatsApp first. Anything prefixed `VITE_` is bundled into the browser code, so only use a sandbox or test account here (see the limitations below).

## How It Works

`useSensorFeed` subscribes to the selected bot's log path with `onValue`. Every snapshot is parsed into a common report shape (`parseFirebaseLog`), sorted newest first and capped at 100. If the newest reading is high or critical, the alert banner appears, and if the user has saved a WhatsApp number, one message is sent per new reading.

Until real data arrives the dashboard shows a few generated sample reports, so the UI isn't empty during a demo. Real readings are tagged `source: "firebase"` and samples `source: "mock"`.

Start and stop just write `1` or `0` to `bot_control/<botId>`. The firmware is expected to watch that value.

## Current Limitations

- **Firmware:** the sketch in `hardware/` is an ESP8266 Wi-Fi test that toggles an LED through a web page. The firmware that reads the ultrasonic sensor and pushes to Firebase isn't committed yet.
- **Detection is distance-based.** There's no image-based crack detection; the camera page only displays the stream.
- **Generated fields:** `speed` and `confidence` on each reading are random placeholders because the bot doesn't send them, so the average-confidence stat isn't meaningful yet.
- **Twilio from the browser:** the Twilio token is bundled into the client, so anyone using the deployed app could read it. This should move to a Firebase Cloud Function.
- The device shows as online as soon as the database connection works, not when the bot itself last reported.

## Future Improvements

- Commit the real sensor firmware and keep Wi-Fi details in a separate untracked header
- Move WhatsApp alerts into a Cloud Function
- Send speed from the bot and drop the generated values
- Use the bot's last-report time for online/offline status
- Try a small image model on ESP32-CAM frames for actual crack detection

## Team

Subhronil Chattoraj ([Neilcodeshere](https://github.com/Neilcodeshere)) and Trushal Pal ([Trushal-Talhah](https://github.com/Trushal-Talhah)).
