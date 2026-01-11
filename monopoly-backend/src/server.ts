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

const initialState: GameState = {
  players: [],
  currentTurnIndex: 0,
  events: [],
  properties: [],
};

createGame("game-1", initialState);
console.log("Created game with ID 'game-1'");

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🎲 Monopoly server running on port ${PORT}`);
});
