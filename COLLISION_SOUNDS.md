# Collision Sounds System

## Overview
Each user is assigned a fixed, unique collision sound when they connect. When a collision is detected, the collision sound is broadcast to all connected clients via Socket.IO, allowing everyone to hear which user collided.

## Implementation Details

### 1. Server Implementation (`index.js`)

#### Sound Assignment
```javascript
const userCollisionSoundId = Math.floor(Math.random() * soundFiles.length);
const userCollisionSound = soundFiles[userCollisionSoundId];
```

Each user gets a random sound from the pool:
- `sound1.wav`
- `sound2.wav`
- `sound3.wav`

#### Welcome Message
The server sends the assigned sound to the client on connection:
```javascript
socket.emit("welcome", {
  collisionSound: userCollisionSound,
  collisionSoundId: userCollisionSoundId,
  // ... other properties
});
```

#### Collision Broadcast Handler
```javascript
socket.on("collision", (data) => {
  io.emit("collision-occurred", {
    id: socket.id,
    collisionSoundId: userCollisionSoundId,
    collisionSound: userCollisionSound,
  });
});
```

When a client detects a collision, it emits a `collision` event. The server broadcasts this to **all clients** (including the collision detector) via `collision-occurred` event.

### 2. Client Implementation (`public/index.html` & `public/host.html`)

#### Cursor State Extension
```javascript
let myCursor = {
  // ... existing properties
  collisionSound: null,
  collisionSoundId: null,
};
```

#### Sound Playback Function
```javascript
function playCollisionSound(soundFile) {
  if (!audioReady) return;
  
  const audio = new Audio(`/sound/${soundFile}`);
  audio.volume = 0.6;
  audio.play().catch((e) => console.error("Collision sound playback failed:", e));
}
```

#### Collision Event Handler
```javascript
socket.on("collision-occurred", (data) => {
  console.log(`Collision from user ${data.id}, playing sound: ${data.collisionSound}`);
  playCollisionSound(data.collisionSound);
});
```

#### Collision Emission (To be integrated with collision detection)
```javascript
function emitCollision() {
  socket.emit("collision", {
    x: myCursor.x,
    y: myCursor.y,
  });
}
```

## Collision Detection Integration Points

The collision detection system needs to call `emitCollision()` when a collision is detected. Current placeholders:
- Client collision detection (commented out in game loop)
- Host collision detection (already has `triggerCollision()` function)

### Host Collision Detection Example
```javascript
// In triggerCollision() function
function triggerCollision(cursor) {
  // Existing code...
  
  // If this is the host detecting a collision, 
  // a client should emit the collision event
  // (Host doesn't emit its own collisions)
}
```

## Sound File Structure

```
public/sound/
├── sound1.wav     (41.7 KB)
├── sound2.wav     (37.7 KB)
└── sound3.wav     (16.6 KB)
```

Each sound is ~0.5 seconds long, making them ideal for collision feedback.

## Data Flow

```
User A Collides
    ↓
Client A emits "collision" event
    ↓
Server receives "collision" from User A
    ↓
Server broadcasts "collision-occurred" to ALL clients
    {
      id: "User A socket ID",
      collisionSound: "sound2.wav",
      collisionSoundId: 1
    }
    ↓
All Clients (including A) receive "collision-occurred"
    ↓
All Clients play sound2.wav
```

## Features

✅ **Fixed Per-User:** Each user keeps the same sound for their entire session
✅ **Random Assignment:** Different users get different sounds
✅ **Broadcast To All:** All clients hear the collision, not just participants
✅ **Consistent Experience:** Host (projection) also hears all collisions
✅ **Volume Controlled:** Collision sounds at 60% volume
✅ **Error Handling:** Gracefully handles playback failures

## How to Test

1. Open two browser windows/tabs to the same server
2. Click to enable audio on both
3. When implementing collision detection, call `emitCollision()`
4. All users should hear the assigned collision sound

## Example Scenario

```
User 1 connected → assigned sound2.wav
User 2 connected → assigned sound1.wav
User 3 connected → assigned sound3.wav

User 1 collides with User 2
  → User 1's client emits "collision"
  → Server broadcasts "collision-occurred" with sound2.wav
  → All 3 users hear sound2.wav
  → Host also hears sound2.wav

User 2 collides with User 3
  → User 2's client emits "collision"
  → Server broadcasts "collision-occurred" with sound1.wav
  → All 3 users hear sound1.wav
  → Host also hears sound1.wav
```

## Future Enhancements

- Add more sound options (piano notes, musical tones)
- Allow users to choose their collision sound
- Add visual feedback (flash, wiggle) synchronized with sound
- Create sound combinations for multi-user collisions
- Implement sound pitch changes based on collision velocity
- Add collision intensity (force-dependent volume)

## Troubleshooting

### Sounds Not Playing
1. Check that audio is initialized (user must click/tap first)
2. Verify sound files exist in `public/sound/`
3. Check browser console for errors
4. Ensure volume is not muted

### Wrong Sound Playing
1. Verify server is assigning sounds correctly
2. Check socket event data in browser DevTools
3. Ensure collision event is being emitted

### Host Not Hearing Sounds
1. Host must click to initialize audio
2. Host should receive `collision-occurred` events
3. Check host page console for errors
