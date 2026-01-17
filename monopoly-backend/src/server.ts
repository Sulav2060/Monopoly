import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { setupWebSocket } from "./ws/handler";

const server = createServer(app);
const wss = new WebSocketServer({ server });

setupWebSocket(wss);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🎲 Monopoly server running on port ${PORT}`);
});
