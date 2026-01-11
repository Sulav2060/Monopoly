import { WebSocketServer, WebSocket } from "ws";
import { ClientMessage, ServerMessage } from "./message";
import { getGame, updateGame } from "./gameStore";
import { rollDice } from "./dice";
import { playTurn } from "../engine/playTurn";
import { getCurrentPlayerSafe } from "../engine/assertions";

type SocketMeta = { gameId: string; playerId: string };

const socketMeta = new WeakMap<WebSocket, SocketMeta>();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on("connection", (socket: WebSocket) => {
    console.log("🔌 WebSocket client connected");

    socket.on("message", (raw) => {
      //listen for messages from client
      let msg: ClientMessage;

      try {
        msg = JSON.parse(raw.toString());
      } catch {
        send(socket, { type: "ERROR", message: "Invalid JSON" }); //why socket here though??
        return;
      }

      console.log("📨 Received message:", msg.type);

      // Handle JOIN_GAME - register player and send current state
      if (msg.type === "JOIN_GAME") {
        const game = getGame(msg.gameId);
        if (!game) {
          send(socket, { type: "ERROR", message: "Game not found" });
          return;
        }

        const existing = game.state.players.find((p) => p.id === msg.playerId);

        if (!existing) {
          if (!msg.player) {
            send(socket, { type: "ERROR", message: "Player payload missing" });
            return;
          }

          if (game.state.players.length >= 4) {
            send(socket, { type: "ERROR", message: "Game full (max 4 players)" });
            return;
          }

          game.state.players.push({ ...msg.player });
          console.log(`✅ Player ${msg.player.name} joined game ${msg.gameId}`);
        }

        // Track socket -> player for cleanup on disconnect
        socketMeta.set(socket, { gameId: msg.gameId, playerId: msg.playerId });

        // Send current game state to the joining player
        send(socket, {
          type: "GAME_STATE_UPDATE",
          gameId: msg.gameId,
          state: game.state,
        });

        // Broadcast to all clients that a player joined
        broadcast(wss, {
          type: "GAME_STATE_UPDATE",
          gameId: msg.gameId,
          state: game.state,
        });

        return;
      }

      if (msg.type === "ROLL_DICE") {
        const game = getGame(msg.gameId);
        if (!game) {
          send(socket, { type: "ERROR", message: "Game not found" });
          return;
        }

        const currentPlayer = getCurrentPlayerSafe(game.state);
        if (currentPlayer.id !== msg.playerId) {
          //checks if its that players turn or frontend is messing things up
          send(socket, { type: "ERROR", message: "Not your turn" });
          return;
        }

        const dice = rollDice();
        const newState = playTurn(game.state, dice);

        updateGame(msg.gameId, newState);

        broadcast(wss, {
          type: "GAME_STATE_UPDATE",
          gameId: msg.gameId,
          state: newState,
        });
      }
    });

      socket.on("close", () => {
        const meta = socketMeta.get(socket);
        if (!meta) return;

        const game = getGame(meta.gameId);
        if (!game) return;

        const before = game.state.players.length;
        game.state.players = game.state.players.filter((p) => p.id !== meta.playerId);
        if (game.state.currentTurnIndex >= game.state.players.length) {
          game.state.currentTurnIndex = 0;
        }
        if (game.state.players.length !== before) {
          updateGame(meta.gameId, game.state);
          broadcast(wss, {
            type: "GAME_STATE_UPDATE",
            gameId: meta.gameId,
            state: game.state,
          });
          console.log(`👋 Player ${meta.playerId} disconnected and was removed`);
        }
      });
  });
}

function send(ws: WebSocket, message: ServerMessage) {
  //Sends a message to one client
  ws.send(JSON.stringify(message));
}

function broadcast(wss: WebSocketServer, message: ServerMessage) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}
