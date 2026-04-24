# Collision Sound System - Complete Flow

## Overview
The collision sound system is fully implemented and ready to use. When the host detects a collision between two cursors, it broadcasts the collision event to both clients, allowing them to play their assigned piano collision sounds locally.

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         COLLISION DETECTION FLOW                        │
└─────────────────────────────────────────────────────────────────────────┘

1. HOST DETECTS COLLISION (line 476 in host.html)
   ↓
   if (isCollidingWithCursor(cursorXAbs, cursorYAbs, other)) {
     triggerCollision(cursor);      // Visual + sound on host
     triggerCollision(other);       // Visual + sound on host
     
     socket.emit("collision-detected", {
       cursorId1: id,
       cursorId2: otherId,
     });
   }

2. SERVER RECEIVES "collision-detected" (index.js)
   ↓
   socket.on("collision-detected", (data) => {
     // Send to User A
     io.to(data.cursorId1).emit("collision-sound", {
       collidedWith: data.cursorId2,
     });
     
     // Send to User B
     io.to(data.cursorId2).emit("collision-sound", {
       collidedWith: data.cursorId1,
     });
   });

3. CLIENT RECEIVES "collision-sound" (index.html)
   ↓
   socket.on("collision-sound", (data) => {
     console.log(`Collision detected! Playing ${myCursor.collisionSound}`);
     playMyCollisionSound();
   });

4. CLIENT PLAYS SOUND
   ↓
   function playMyCollisionSound() {
     const audio = new Audio(`/sound/${myCursor.collisionSound}`);
     audio.volume = 0.6;
     audio.play();
   }
```

## Implementation Details

### Server (`index.js`)

```javascript
// Broadcast collision detected by host to the colliding users
socket.on("collision-detected", (data) => {
  // Send collision notification to the two cursors involved
  io.to(data.cursorId1).emit("collision-sound", {
    collidedWith: data.cursorId2,
  });
  io.to(data.cursorId2).emit("collision-sound", {
    collidedWith: data.cursorId1,
  });
  console.log(`Collision detected between ${data.cursorId1} and ${data.cursorId2}`);
});
```

**Key Points:**
- Uses `io.to(socketId).emit()` to send to specific clients
- Sends to both colliding users
- Includes which cursor they collided with (optional)

### Host (`public/host.html`)

Lines 476-481: Collision detection and broadcast
```javascript
if (isCollidingWithCursor(cursorXAbs, cursorYAbs, other)) {
  lastHitOfCursor[id] = now;
  lastHitOfCursor[otherId] = now;
  triggerCollision(cursor);      // Visual + sound locally
  triggerCollision(other);       // Visual + sound locally
  
  // Broadcast collision to the two clients involved
  socket.emit("collision-detected", {
    cursorId1: id,
    cursorId2: otherId,
  });
}
```

**Key Points:**
- Collision is detected between two cursors in `allCursors` object
- Local collision effect still plays on host via `triggerCollision()`
- Broadcasts to server for relay to clients
- Uses cursor socket IDs from the `allCursors` object

### Client (`public/index.html`)

Socket listener for collision notifications:
```javascript
socket.on("collision-sound", (data) => {
  console.log(`Collision detected! Playing ${myCursor.collisionSound}`);
  playMyCollisionSound();
});
```

Collision sound playback:
```javascript
function playMyCollisionSound() {
  if (!audioReady || !myCursor.collisionSound) return;

  const audio = new Audio(`/sound/${myCursor.collisionSound}`);
  audio.volume = 0.6;
  audio.play().catch((e) =>
    console.error("Collision sound playback failed:", e)
  );
}
```

**Key Points:**
- Only plays if audio has been initialized (user clicked/tapped)
- Uses the user's assigned piano sound stored in `myCursor.collisionSound`
- Volume set to 60% for consistency
- Creates new Audio element each time (lightweight and efficient)
- Silently fails if playback not available

## State and Data Storage

### User Collision Sound Assignment

**On Server Connection:**
```javascript
const userCollisionSound = getRandomPianoSound();  // e.g., "piano-5.mp3"

socket.emit("welcome", {
  collisionSound: userCollisionSound,
  // ... other properties
});
```

**On Client Receive:**
```javascript
socket.on("welcome", (data) => {
  myCursor.collisionSound = data.collisionSound;  // e.g., "piano-5.mp3"
  console.log(`Connected! Your collision sound: ${myCursor.collisionSound}`);
});
```

### Socket IDs and Tracking

The host tracks cursors in the `allCursors` object:
```javascript
const allCursors = {
  "socket.id_1": { el, x, y, baseFreq, ... },
  "socket.id_2": { el, x, y, baseFreq, ... },
  "socket.id_3": { el, x, y, baseFreq, ... },
};
```

When collision detected, it uses these socket IDs to identify users:
```javascript
socket.emit("collision-detected", {
  cursorId1: "socket.id_1",  // Socket ID from allCursors
  cursorId2: "socket.id_2",  // Socket ID from allCursors
});
```

The server then uses `io.to(socketId)` to send to specific clients.

## Event Flow Summary

| Step | Location | Event | Data |
|------|----------|-------|------|
| 1 | Host | Collision detected | Two cursor IDs |
| 2 | Host → Server | `collision-detected` | `{ cursorId1, cursorId2 }` |
| 3 | Server → Client | `collision-sound` | `{ collidedWith }` |
| 4 | Client | Play sound | `myCursor.collisionSound` |

## Sound Assignment

**Piano Sounds Available:**
```javascript
const pianoSounds = [
  "piano-1.mp3",
  "piano-2.mp3",
  "piano-3.mp3",
  "piano-4.mp3",
  "piano-5.mp3",
  "piano-6.mp3",
  "piano-7.mp3",
  "piano-8.mp3",
];
```

**Assignment on Connect:**
```javascript
function getRandomPianoSound() {
  return pianoSounds[Math.floor(Math.random() * pianoSounds.length)];
}
```

Each user gets exactly one random piano sound that persists for their entire session.

## Testing the System

### Manual Test Sequence

1. **Open Host Page**
   - Navigate to `http://localhost:8080/host`
   - Click to enable audio

2. **Open Two Client Pages**
   - Open first client: `http://localhost:8080`
   - Open second client: `http://localhost:8080` (different tab/window)
   - Click both to enable audio
   - Check console logs for assigned collision sounds

3. **Check Console Output**
   ```
   Connected! Your collision sound: piano-3.mp3
   Connected! Your collision sound: piano-7.mp3
   ```

4. **Trigger Collision**
   - Move cursors on client pages (they appear on host)
   - When host detects collision between two cursors:
     - Host plays random sound locally
     - Both clients receive `collision-sound` event
     - Both clients play their assigned piano sounds
   
5. **Verify Sounds**
   - Host should play sound pool sound (existing system)
   - Client 1 should play their piano sound
   - Client 2 should play their piano sound

## Debugging

### Console Logs

**Server:**
```
Collision detected between socket.id_1 and socket.id_2
```

**Host:**
```
[Already has existing logs from triggerCollision()]
```

**Client:**
```
Connected! Your collision sound: piano-5.mp3
Collision detected! Playing piano-5.mp3
```

### Common Issues

**Clients don't hear sound:**
1. Ensure audio is initialized (user clicked/tapped)
2. Check that `myCursor.collisionSound` is set
3. Verify socket event is received (check console)
4. Check volume settings

**Wrong sounds playing:**
1. Check server console for collision detection
2. Verify socket IDs are correct
3. Check that each client has different assigned sounds

**Host sound plays but clients don't:**
1. Verify server broadcast handler exists
2. Check network tab for `collision-sound` events
3. Ensure client listeners are registered

## Performance Notes

- **Sound Creation:** New Audio element created per collision (minimal overhead)
- **Network Traffic:** Only collision event broadcast (small payload)
- **No Preloading:** Sounds play on-demand (faster startup)
- **Thread Safety:** No blocking operations
- **Collision Cooldown:** 300ms debounce prevents repeated triggers

## Future Enhancements

- Add visual collision feedback with sound
- Implement force/distance-based volume adjustment
- Create sound themes/variations
- Add collision particle effects
- Multi-user collision sound layering
