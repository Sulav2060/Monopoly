import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";

const PORT = process.env.PORT || 4000;

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

// Make io available globally for routes to emit events
(global as any).io = io;

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log(`🔌 Player connected: ${socket.id}`);

  // Join a game room
  socket.on("join-game", (data: { gameId: string; playerId: string }) => {
    const roomKey = `game-${data.gameId}`;
    socket.join(roomKey);
    console.log(`✅ Player ${data.playerId} joined game ${data.gameId}`);
    
    // Notify other players
    io.to(roomKey).emit("player-joined", {
      playerId: data.playerId,
      timestamp: Date.now(),
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`❌ Player disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🎲 Monopoly server running on port ${PORT}`);
});
