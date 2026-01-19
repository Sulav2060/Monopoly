import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { setupWebSocket } from "./ws/handler";
import { createGame } from "./ws/gameStore";
import { GameState } from "./types/game";

const server = createServer(app);
const wss = new WebSocketServer({ server });

setupWebSocket(wss);

// Initialize game-1 with empty players - they join via WebSocket
const initialState: GameState = {
  players: [],
  currentTurnIndex: 0,
  events: [],
  properties: [],
  communityChestDeck: [
    { type: "MONEY", amount: 200 },
    { type: "GO_TO_JAIL" },
    { type: "MOVE", position: 12 },
  ],
  communityChestIndex: 0,
};

createGame("game-1", initialState);
console.log("Created game with ID 'game-1'");

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🎲 Monopoly server running on port ${PORT}`);
});
