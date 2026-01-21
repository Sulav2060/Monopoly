import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";
import { ClientMessage, ServerMessage } from "./message";
import { getGame, updateGame } from "./gameStore";
import { rollDice } from "./dice";
import { playTurn } from "../engine/playTurn";
import { getCurrentPlayerSafe } from "../engine/assertions";
import { endTurn } from "../engine/endTurn";
import { skipProperty } from "../engine/skipProperty";
import { buyPendingProperty } from "../engine/buyPendingProperty";

type SocketMeta = { gameId: string; playerId: string };
const socketMeta = new WeakMap<WebSocket, SocketMeta>();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on("connection", (socket: WebSocket) => {
    console.log("🔌 WebSocket client connected");

    socket.on("message", (raw) => {
      try {
        let msg: ClientMessage;

        /* =======================
           PARSE MESSAGE
        ======================= */
        try {
          msg = JSON.parse(raw.toString());
        } catch (err) {
          console.error("❌ Invalid JSON received:", raw.toString(), err);
          safeSend(socket, {
            type: "ERROR",
            message: "Invalid JSON format",
          });
          return;
        }

        /* =======================
           JOIN GAME
        ======================= */
        if (msg.type === "JOIN_GAME") {
          const game = getGame(msg.gameId);
          if (!game) {
            safeSend(socket, { type: "ERROR", message: "Game not found" });
            return;
          }

          // Reuse existing player entry if the client reconnects with the same id
          const existingPlayer = game.state.players.find(
            (p) => p.id === msg.playerId,
          );

          if (existingPlayer) {
            existingPlayer.name = msg.playerName ?? existingPlayer.name;
            socketMeta.set(socket, {
              gameId: msg.gameId,
              playerId: existingPlayer.id,
            });

            safeBroadcast(wss, {
              type: "GAME_STATE_UPDATE",
              gameId: msg.gameId,
              state: game.state,
            });

            console.log(
              `♻️ Player ${existingPlayer.name} reconnected to game ${msg.gameId}`,
            );
            return;
          }

          if (game.state.hasStarted) {
            safeSend(socket, {
              type: "ERROR",
              message: "Game already started",
            });
            return;
          }

          const maxPlayers = game.state.maxPlayers ?? 4;
          if (game.state.players.length >= maxPlayers) {
            safeSend(socket, { type: "ERROR", message: "Game is full" });
            return;
          }

          const newPlayer = {
            id: msg.playerId ?? randomUUID(),
            name: msg.playerName,
            position: 0,
            money: 500,
            inJail: false,
            jailTurns: 0,
            isBankrupt: false,
            communityChestDeck: [
              { type: "MONEY", amount: 200 },
              { type: "GO_TO_JAIL" },
              { type: "MOVE", position: 12 },
            ],
            communityChestIndex: 0,
            freeParkingPot: 0,
          };

          game.state.players.push(newPlayer);
          socketMeta.set(socket, {
            gameId: msg.gameId,
            playerId: newPlayer.id,
          });

          safeBroadcast(wss, {
            type: "GAME_STATE_UPDATE",
            gameId: msg.gameId,
            state: game.state,
          });

          console.log(`✅ Player ${newPlayer.name} joined game ${msg.gameId}`);
          return;
        }

        /* =======================
           START GAME
        ======================= */
        if (msg.type === "START_GAME") {
          const game = getGame(msg.gameId);
          if (!game) {
            safeSend(socket, { type: "ERROR", message: "Game not found" });
            return;
          }

          if (game.state.players.length < 2) {
            safeSend(socket, {
              type: "ERROR",
              message: "Need at least 2 players",
            });
            return;
          }

          game.state.hasStarted = true;
          game.state.currentTurnIndex = 0;

          safeBroadcast(wss, {
            type: "GAME_STATE_UPDATE",
            gameId: msg.gameId,
            state: game.state,
          });

          return;
        }

        /* =======================
           ROLL DICE
        ======================= */
        if (msg.type === "ROLL_DICE") {
          const game = getGame(msg.gameId);
          if (!game) {
            safeSend(socket, { type: "ERROR", message: "Game not found" });
            return;
          }

          const currentPlayer = getCurrentPlayerSafe(game.state);
          console.log(
            "Current player:",
            currentPlayer.id,
            "Message player:",
            msg.playerId,
          );

          if (currentPlayer.id !== msg.playerId) {
            safeSend(socket, {
              type: "ERROR",
              message: "Not your turn",
            });
            return;
          }

          const dice = rollDice();
          const newState = playTurn(game.state, dice);

          updateGame(msg.gameId, newState);

          safeBroadcast(wss, {
            type: "GAME_STATE_UPDATE",
            gameId: msg.gameId,
            state: newState,
          });

          console.log(
            `🎲 ${currentPlayer.name} rolled dice in game ${msg.gameId}`,
          );
          return;
        }

        /* =======================
           END TURN
        ======================= */
        if (msg.type === "END_TURN") {
          const game = getGame(msg.gameId);
          if (!game) {
            safeSend(socket, { type: "ERROR", message: "Game not found" });
            return;
          }

          const currentPlayer = getCurrentPlayerSafe(game.state);
          if (currentPlayer.id !== msg.playerId) {
            safeSend(socket, {
              type: "ERROR",
              message: "Not your turn",
            });
            return;
          }
          // 👇 NEW LOGIC
          let currentState;
          if (game.state.pendingAction?.type === "BUY_PROPERTY") {
            currentState = skipProperty(game.state);
          } else {
            currentState = endTurn(game.state);
          }
          // Persist the turn change to game store
          updateGame(msg.gameId, currentState);

          safeBroadcast(wss, {
            type: "GAME_STATE_UPDATE",
            gameId: msg.gameId,
            state: currentState,
          });

          const currentTurnIndex = currentState.currentTurnIndex;

          const nextPlayer = currentState.players[currentTurnIndex];
          if (nextPlayer) {
            console.log(
              `⏭️ Turn changed to ${nextPlayer.name} in game ${msg.gameId}`,
            );
          }
          return;
        }

        /* =======================
           BUY PROPERTY
        ======================= */
        if (msg.type === "BUY_PROPERTY") {
          console.log("recieved buy property request", msg);
          const game = getGame(msg.gameId);
          if (!game) {
            safeSend(socket, { type: "ERROR", message: "Game not found" });
            return;
          }

          const currentPlayer = getCurrentPlayerSafe(game.state);
          if (currentPlayer.id !== msg.playerId) {
            safeSend(socket, {
              type: "ERROR",
              message: "Not your turn",
            });
            return;
          }

          // Verify there's a pending buy action
          if (game.state.pendingAction?.type !== "BUY_PROPERTY") {
            safeSend(socket, {
              type: "ERROR",
              message: "No property purchase pending",
            });
            return;
          }

          // Buy the pending property
          const newState = buyPendingProperty(game.state);
          updateGame(msg.gameId, newState);
          console.log("updated game state after buying property", newState);
          safeBroadcast(wss, {
            type: "GAME_STATE_UPDATE",
            gameId: msg.gameId,
            state: newState,
          });

          console.log(
            `🏠 ${currentPlayer.name} bought property in game ${msg.gameId}`,
          );
          return;
        }

        /* =======================
           UNKNOWN MESSAGE
        ======================= */
        console.warn("⚠️ Unknown message type:", msg);
        safeSend(socket, {
          type: "ERROR",
          message: "Unknown message type",
        });
      } catch (err) {
        // 🔥 Catch ANY unexpected runtime error
        console.error("🔥 WebSocket message handler crashed:", err);

        safeSend(socket, {
          type: "ERROR",
          message: "Internal server error",
        });
      }
    });

    socket.on("error", (err) => {
      console.error("🚨 WebSocket error:", err);
    });
  });
}

/* =======================
   SAFE HELPERS
======================= */

function safeSend(ws: WebSocket, message: ServerMessage) {
  try {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  } catch (err) {
    console.error("❌ Failed to send message:", message, err);
  }
}

function safeBroadcast(wss: WebSocketServer, message: ServerMessage) {
  const data = JSON.stringify(message);

  // Extract target game ID if applicable
  let targetGameId: string | undefined;
  if (message.type === "GAME_STATE_UPDATE") {
    targetGameId = message.gameId;
  }

  wss.clients.forEach((client) => {
    // Optimization: Only send to clients in the specific game
    if (targetGameId) {
      const meta = socketMeta.get(client);
      if (meta?.gameId !== targetGameId) {
        return;
      }
    }

    try {
      if (client.readyState === client.OPEN) {
        client.send(data);
      }
    } catch (err) {
      console.error("❌ Broadcast failed for client:", err);
    }
  });
}
