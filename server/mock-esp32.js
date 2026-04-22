const { io } = require("socket.io-client");
const socket = io("http://127.0.0.1:5000");

socket.on("connect", () => {
  console.log("✅ Mock ESP32 connected to server");
  
  // Initial status
  socket.emit("esp32-status", { status: "online" });
  console.log("Sent status: online");

  // Keep alive with heartbeats every 5 seconds
  setInterval(() => {
    socket.emit("esp32-status", { status: "online" });
    console.log("Heartbeat sent: online");
  }, 5000);
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
  process.exit(1);
});
