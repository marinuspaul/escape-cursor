const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
app.use(express.static("public"));
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
io.engine.on("connection_error", (err) => {
  console.error("Socket.io connection error:", err);
});

app.use(express.static("public"));

app.get("/", (req, res) => {
  console.log("Health check request received");
  res.status(200).send("OK");
});

// Host version route
app.get("/host", (req, res) => {
  console.log("Host version requested");
  res.sendFile(path.join(__dirname, "public", "host.html"));
});

// Harmonically pleasant frequencies (pentatonic scale across 3 octaves)
const frequencies = [
  165, 185, 220, 247, 277, 330, 370, 415, 440, 494, 554, 587, 659, 740, 880,
];
const backgroundTracks = ["bg1.mp3", "bg2.mp3", "bg3.mp3"];

// Color array for cursors
const cursorColors = [
  "#FF0000",  // Red
  "#00FF00", // Lime Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Purple
  "#FFC0CB", // Pink
  "#A52A2A", // Brown
  "#32CD32", // Lime Green
  "#FF69B4", // Hot Pink
  "#00CED1", // Dark Turquoise
  "#FFD700", // Gold
  "#FF4500", // Orange Red
  "#00FA9A", // Medium Spring Green
];

// Shape IDs
const shapeIds = [
  "circle",
  "square",
  "triangle",
  "diamond",
  "star",
  "hexagon",
  "pentagon",
  "octagon",
  "heart",
  "cross",
  "crescent",
  "spiral"
];

function getRandomColor() {
  return cursorColors[Math.floor(Math.random() * cursorColors.length)];
}

function getRandomShape() {
  return shapeIds[Math.floor(Math.random() * shapeIds.length)];
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Determine if this is a host connection
  const isHost = socket.handshake.headers.referer?.includes("/host");
  console.log(`Client connected - Host: ${isHost}, ID: ${socket.id}`);

  const userColor = getRandomColor();
  const userShape = getRandomShape();
  const userFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
  const userBackgroundTrack =
    backgroundTracks[Math.floor(Math.random() * backgroundTracks.length)];

  // Send this user their own identity
  socket.emit("welcome", {
    color: userColor,
    shape: userShape,
    freq: userFreq,
    backgroundTrack: userBackgroundTrack,
    isHost: isHost // Let client know if it's a host
  });

  // Broadcast cursor movement to everyone else (except host)
  socket.on("cursor-move", (data) => {
    if (!isHost) { // Host clients don't broadcast their cursor
      socket.broadcast.emit("cursor-update", {
        id: socket.id,
        x: data.x,
        y: data.y,
        color: userColor,
        shape: userShape,
        freq: userFreq,
        isTouching: data.isTouching || false,
        isActive: data.isActive || false,
      });
    }
  });

  socket.on("disconnect", () => {
    io.emit("user-left", socket.id);
    console.log("User left:", socket.id);
  });
});

app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).send("Internal Server Error");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
});
