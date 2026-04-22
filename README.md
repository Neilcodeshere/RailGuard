<div align="center">

# 🚂 RailGuard — Autonomous Railway Crack Detection System

**A full-stack IoT dashboard for real-time detection and monitoring of railway track defects using an ESP32-CAM.**

[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?logo=socket.io)](https://socket.io/)
[![Arduino](https://img.shields.io/badge/Hardware-ESP32--CAM-00979D?logo=arduino)](https://www.arduino.cc/)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Hardware Setup](#-hardware-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)

---

## 🔍 Overview

**RailGuard** is an autonomous railway crack detection system that combines an **ESP32-CAM** hardware module with a full-stack web application. The system:

- Captures images of railway tracks as the ESP32-CAM module travels along the rail.
- Detects cracks and defects on the track surface.
- Streams live status and detection events to a central dashboard via **WebSockets**.
- Logs all detection events with GPS coordinates, severity, and images to a **MongoDB** database.
- Visualises crack locations on an **interactive map** (Leaflet.js) for maintenance teams.

---

## 🏗 Architecture

```
┌─────────────────────┐         ┌───────────────────────────┐
│   ESP32-CAM Module  │──HTTP──▶│  Node.js / Express Server │
│  (Railway Scanner)  │◀─WS────│  (REST API + Socket.io)   │
└─────────────────────┘         └──────────┬────────────────┘
                                           │  Mongoose
                                           ▼
                                    ┌─────────────┐
                                    │   MongoDB   │
                                    └─────────────┘
                                           │  Socket.io
                                           ▼
                               ┌───────────────────────┐
                               │  React Dashboard      │
                               │  (Vite + Leaflet.js)  │
                               └───────────────────────┘
```

---

## 🛠 Tech Stack

| Layer      | Technology                                               |
|------------|----------------------------------------------------------|
| Hardware   | ESP32-CAM, Arduino (C++)                                |
| Backend    | Node.js, Express.js, Socket.io, Mongoose                |
| Database   | MongoDB (local or Atlas)                                |
| Frontend   | React 18, Vite, Tailwind CSS, Leaflet.js, Socket.io-client |
| Dev Tools  | Nodemon, ESLint                                         |

---

## 📁 Project Structure

```
Mini Project/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # UI components (MapView, LiveFeed, HistoricalLog…)
│   │   ├── App.jsx
│   │   ├── socket.js        # Socket.io client instance
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── server/                  # Express backend
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes (crackRoutes.js)
│   ├── uploads/             # Uploaded defect images (auto-created, git-ignored)
│   ├── server.js            # Main entry point
│   ├── mock-esp32.js        # Local ESP32 simulator for development
│   ├── seed.js              # Database seeder script
│   └── package.json
│
├── hardware/
│   └── esp32_cam_sketch/    # Arduino sketch for the ESP32-CAM
│       └── esp32_cam_sketch.ino
│
├── manage_system.bat        # Convenience script to start all services (Windows)
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** running locally on port `27017` (or a MongoDB Atlas URI)
- **Git**
- *(Optional)* Arduino IDE for hardware flashing

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/railguard.git
   cd railguard
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values (MongoDB URI, port, etc.)
   ```

4. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running Locally

Open **two terminals** from the project root:

**Terminal 1 — Backend**
```bash
cd server
npm run dev        # starts nodemon on http://localhost:5000
```

**Terminal 2 — Frontend**
```bash
cd client
npm run dev        # starts Vite on http://localhost:5173
```

> **Tip:** On Windows you can also run `manage_system.bat` to start both services at once.

**Simulate an ESP32-CAM (no hardware needed)**
```bash
cd server
node mock-esp32.js
```

**Seed the database with sample data**
```bash
cd server
node seed.js
```

---

## ⚙️ Hardware Setup

1. Open `hardware/esp32_cam_sketch/esp32_cam_sketch.ino` in the **Arduino IDE**.
2. Install the required libraries (ESP32 board support, camera libs).
3. Update the Wi-Fi SSID, password, and server IP inside the sketch.
4. Flash to your **ESP32-CAM** (AI-Thinker module recommended).
5. Power on and place on the railway track — the module will begin scanning and sending data to the server automatically.

---

## 🔐 Environment Variables

The server reads configuration from `server/.env`. Copy `server/.env.example` to `server/.env` and fill in your values:

| Variable    | Default                                        | Description                     |
|-------------|------------------------------------------------|---------------------------------|
| `PORT`      | `5000`                                         | Express server port             |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/railway_cracks`     | MongoDB connection string       |
| `CLIENT_URL`| `http://localhost:5173`                        | Frontend URL (used for CORS)    |

---

## 📡 API Reference

| Method | Endpoint           | Description                        |
|--------|--------------------|------------------------------------|
| GET    | `/`                | Health check                       |
| GET    | `/api/cracks`      | Fetch all crack detection records  |
| POST   | `/api/cracks`      | Create a new crack detection event |
| GET    | `/uploads/:file`   | Serve a defect image               |

**WebSocket Events**

| Event                  | Direction           | Payload                   |
|------------------------|---------------------|---------------------------|
| `esp32-status`         | Client → Server     | `{ status: "online" }`    |
| `esp32-status-update`  | Server → Client     | `{ status: "online" }`    |
| `new-crack`            | Server → Client     | Crack detection object    |

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

<div align="center">
Made with ❤️ for railway safety
</div>
