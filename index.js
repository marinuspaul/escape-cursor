const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

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

// Level system
let currentLevel = 0;
const levels = [
  {
    id: 0,
    title: "Welcome to Escape Room",
    instructions:
      "All players: Move your cursor to the center of the screen and get ready!",
    completed: false,
  },
  {
    id: 1,
    title: "Level 1: Cursor Collision",
    instructions: "Make all players' cursors collide at least once!",
    completed: false,
  },
  {
    id: 2,
    title: "Level 2: Click to Expand Black",
    instructions:
      "Tap the white areas to expand the black circle and fill the screen!",
    completed: false,
  },
  {
    id: 3,
    title: "Congratulations!",
    instructions: "You've successfully escaped the room!",
    completed: true,
  },
];

app.get("/host", (req, res) => {
  res.sendFile(__dirname + "/public/host.html");
});

const adjectives = [
  "Sleepy",
  "Grumpy",
  "Sneaky",
  "Wobbly",
  "Fluffy",
  "Clumsy",
  "Spooky",
  "Hangry",
  "Goofy",
  "Jumpy",
  "Dizzy",
  "Whiny",
  "Bouncy",
  "Cranky",
  "Sassy",
  "Dopey",
  "Noisy",
  "Cheeky",
  "Lazy",
  "Hyper",
];

const nouns = [
  "Potato",
  "Noodle",
  "Pickle",
  "Waffle",
  "Burrito",
  "Muffin",
  "Nugget",
  "Pretzel",
  "Biscuit",
  "Pancake",
  "Dumpling",
  "Taco",
  "Donut",
  "Meatball",
  "Cupcake",
  "Banana",
  "Avocado",
  "Sausage",
  "Crouton",
  "Nacho",
];

// Harmonically pleasant frequencies (pentatonic scale across 3 octaves)
const frequencies = [
  165, 185, 220, 247, 277, 330, 370, 415, 440, 494, 554, 587, 659, 740, 880,
];
const backgroundTracks = ["bg1.mp3", "bg2.mp3", "bg3.mp3"];

function generateName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
  const userName = generateName();
  const userFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
  const userBackgroundTrack =
    backgroundTracks[Math.floor(Math.random() * backgroundTracks.length)];

  // Send this user their own identity
  socket.emit("welcome", {
    color: userColor,
    name: userName,
    freq: userFreq,
    backgroundTrack: userBackgroundTrack,
  });

  // Send current level to new user
  socket.emit("level-update", levels[currentLevel]);

  // Broadcast cursor movement to everyone else
  socket.on("cursor-move", (data) => {
    socket.broadcast.emit("cursor-update", {
      id: socket.id,
      x: data.x,
      y: data.y,
      color: userColor,
      name: userName,
      freq: userFreq,
    });
  });

  // Host controls
  socket.on("next-level", () => {
    if (currentLevel < levels.length - 1) {
      currentLevel++;
      io.emit("level-update", levels[currentLevel]);
      console.log(`Advanced to level ${currentLevel}`);
    }
  });

  socket.on("reset-game", () => {
    currentLevel = 0;
    io.emit("level-update", levels[currentLevel]);
    console.log("Game reset to level 0");
  });

  // Level completion
  socket.on("level-complete", () => {
    console.log(`Player ${socket.id} completed level ${currentLevel}`);
    // Could add logic to track completion progress here
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
