import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";
import { ClientMessage, ServerMessage } from "./message";
import { getGame, updateGame } from "./gameStore";
import { rollDice } from "../engine/dice";
import { playTurn } from "../engine/playTurn";
import { getCurrentPlayerSafe } from "../engine/assertions";
import { endTurn } from "../engine/endTurn";
import { skipProperty } from "../engine/skipProperty";
import { buyPendingProperty } from "../engine/buyPendingProperty";
import { resolveAuctionTimeout } from "../engine/resolveAuctionTimeout";
import { placeBid } from "../engine/placeBid";
import { buildProperty } from "../engine/buildProperty";
import { breakHouses } from "../engine/breakHouses";
import { initiateTrade } from "../engine/initiateTrade";
import { acceptTrade, rejectTrade, deleteTrade } from "../engine/finalizeTrade";
import { mortgageProperty } from "../engine/mortgage";
import { unmortgageProperty } from "../engine/unmortgage";

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

          if (game.state.pendingAction) {
            safeSend(socket, {
              type: "ERROR",
              message: "Please complete pending action first",
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
        //TODO: Do we even need auction_timeout event at the buy property step?
        /* =======================
           AUCTION_TIMEOUT
        ======================= */
        if (msg.type === "AUCTION_TIMEOUT") {
          const game = getGame(msg.gameId);
          if (!game) return;

          const newState = resolveAuctionTimeout(game.state);
          updateGame(msg.gameId, newState);

          safeBroadcast(wss, {
            type: "GAME_STATE_UPDATE",
            gameId: msg.gameId,
            state: newState,
          });
          return;
        }

        /* =======================
           PLACE_BID
        ======================= */
        if (msg.type === "PLACE_BID") {
          const game = getGame(msg.gameId);
          if (!game) return;

          //check if the player is part of the game
          const player = game.state.players.find((p) => p.id === msg.playerId);
          if (!player) return;

          const newState = placeBid(game.state, msg.playerId, msg.amount);
          updateGame(msg.gameId, newState);

          safeBroadcast(wss, {
            type: "GAME_STATE_UPDATE",
            gameId: msg.gameId,
            state: newState,
          });
          return;
        }

        /* =======================
           BUILD_PROPERTY
        ======================= */
        if (msg.type === "BUILD_PROPERTY") {
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

          const newState = buildProperty(
            game.state,
            msg.playerId,
            msg.tileIndex,
          );
          updateGame(msg.gameId, newState);

          safeBroadcast(wss, {
            type: "GAME_STATE_UPDATE",
            gameId: msg.gameId,
            state: newState,
          });

          console.log(
            `🏠 ${currentPlayer.name} built on property ${msg.tileIndex} in game ${msg.gameId}`,
          );
          return;
        }

        /* =======================
           BREAK_PROPERTY
        ======================= */
        if (msg.type === "BREAK_PROPERTY") {
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

          const newState = breakHouses(game.state, msg.playerId, msg.tileIndex);
          updateGame(msg.gameId, newState);

          safeBroadcast(wss, {
            type: "GAME_STATE_UPDATE",
            gameId: msg.gameId,
            state: newState,
          });

          console.log(
            `🗑️ ${currentPlayer.name} broke houses on property ${msg.tileIndex} in game ${msg.gameId}`,
          );
          return;
        }

        /* =======================
           INITIATE_TRADE
        ======================= */
        if (msg.type === "INITIATE_TRADE") {
          const game = getGame(msg.gameId);
          if (!game) {
            safeSend(socket, { type: "ERROR", message: "Game not found" });
            return;
          }

          const initiatingPlayer = game.state.players.find(
            (p) => p.id === msg.playerId,
          );
          const targetPlayer = game.state.players.find(
            (p) => p.id === msg.targetPlayerId,
          );

          if (!initiatingPlayer || !targetPlayer) {
            safeSend(socket, {
              type: "ERROR",
              message: "Player not found",
            });
            return;
          }

          const newState = initiateTrade(
            game.state,
            msg.playerId,
            msg.targetPlayerId,
            msg.offerMoney,
            msg.offerProperties,
            msg.requestMoney,
            msg.requestProperties,
          );

          updateGame(msg.gameId, newState);

          safeBroadcast(wss, {
            type: "GAME_STATE_UPDATE",
            gameId: msg.gameId,
            state: newState,
          });

          console.log(
            `💰 ${initiatingPlayer.name} offered a trade to ${targetPlayer.name} in game ${msg.gameId}`,
          );
          return;
        }

        /* =======================
           FINALIZE_TRADE
        ======================= */
        if (msg.type === "FINALIZE_TRADE") {
          const game = getGame(msg.gameId);
          if (!game) {
            safeSend(socket, { type: "ERROR", message: "Game not found" });
            return;
          }

          // Find the trade by tradeId
          const tradeOffer = (game.state.pendingTrades || []).find(
            (trade) => trade.tradeId === msg.tradeId,
          );

          if (!tradeOffer) {
            safeSend(socket, {
              type: "ERROR",
              message: `No pending trade offer with ID: ${msg.tradeId}`,
            });
            return;
          }

          // Retrieve both players for logs
          const respondingPlayer = game.state.players.find(
            (p) => p.id === tradeOffer.targetPlayerId,
          );
          const initiatingPlayer = game.state.players.find(
            (p) => p.id === tradeOffer.initiatingPlayerId,
          );

          let newState;

          if (msg.action === "ACCEPT") {
            newState = acceptTrade(game.state, msg.tradeId);

            console.log(
              `✅ ${respondingPlayer?.name} accepted trade ${msg.tradeId} from ${initiatingPlayer?.name} in game ${msg.gameId}`,
            );
          } else {
            newState = rejectTrade(game.state, msg.tradeId);

            console.log(
              `❌ ${respondingPlayer?.name} rejected trade ${msg.tradeId} from ${initiatingPlayer?.name} in game ${msg.gameId}`,
            );
          }

          updateGame(msg.gameId, newState);

          safeBroadcast(wss, {
            type: "GAME_STATE_UPDATE",
            gameId: msg.gameId,
            state: newState,
          });

          return;
        }

        /* =======================
           DELETE_TRADE
        ======================= */
        if (msg.type === "DELETE_TRADE") {
          const game = getGame(msg.gameId);
          if (!game) {
            safeSend(socket, { type: "ERROR", message: "Game not found" });
            return;
          }

          // Find the trade by tradeId
          const tradeOffer = (game.state.pendingTrades || []).find(
            (trade) => trade.tradeId === msg.tradeId,
          );

          if (!tradeOffer) {
            safeSend(socket, {
              type: "ERROR",
              message: `No pending trade offer with ID: ${msg.tradeId}`,
            });
            return;
          }

          // Verify the player is the initiator
          if (tradeOffer.initiatingPlayerId !== msg.playerId) {
            safeSend(socket, {
              type: "ERROR",
              message: "Only the initiating player can delete their trade",
            });
            return;
          }

          // Delete the trade
          const newState = deleteTrade(game.state, msg.tradeId, msg.playerId);

          // Retrieve players for logs
          const initiatingPlayer = game.state.players.find(
            (p) => p.id === tradeOffer.initiatingPlayerId,
          );
          const targetPlayer = game.state.players.find(
            (p) => p.id === tradeOffer.targetPlayerId,
          );

          updateGame(msg.gameId, newState);

          safeBroadcast(wss, {
            type: "GAME_STATE_UPDATE",
            gameId: msg.gameId,
            state: newState,
          });

          console.log(
            `🗑️ ${initiatingPlayer?.name} deleted trade ${msg.tradeId} with ${targetPlayer?.name} in game ${msg.gameId}`,
          );

          return;
        }

        /* =======================
           MORTGAGE_PROPERTY
        ======================= */
        if (msg.type === "MORTGAGE_PROPERTY") {
          const game = getGame(msg.gameId);
          if (!game) {
            safeSend(socket, { type: "ERROR", message: "Game not found" });
            return;
          }

          const player = game.state.players.find((p) => p.id === msg.playerId);
          if (!player) {
            safeSend(socket, { type: "ERROR", message: "Player not found" });
            return;
          }

          const newState = mortgageProperty(game.state, msg.tileIndex);
          updateGame(msg.gameId, newState);

          safeBroadcast(wss, {
            type: "GAME_STATE_UPDATE",
            gameId: msg.gameId,
            state: newState,
          });

          console.log(
            `🏦 ${player.name} mortgaged property at ${msg.tileIndex} in game ${msg.gameId}`,
          );
          return;
        }

        /* =======================
           UNMORTGAGE_PROPERTY
        ======================= */
        if (msg.type === "UNMORTGAGE_PROPERTY") {
          const game = getGame(msg.gameId);
          if (!game) {
            safeSend(socket, { type: "ERROR", message: "Game not found" });
            return;
          }

          const player = game.state.players.find((p) => p.id === msg.playerId);
          if (!player) {
            safeSend(socket, { type: "ERROR", message: "Player not found" });
            return;
          }

          const newState = unmortgageProperty(game.state, msg.tileIndex);
          updateGame(msg.gameId, newState);

          safeBroadcast(wss, {
            type: "GAME_STATE_UPDATE",
            gameId: msg.gameId,
            state: newState,
          });

          console.log(
            `🏦 ${player.name} unmortgaged property at ${msg.tileIndex} in game ${msg.gameId}`,
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
