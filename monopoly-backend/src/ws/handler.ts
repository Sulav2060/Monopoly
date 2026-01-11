import { WebSocketServer, WebSocket } from "ws";
import { ClientMessage, ServerMessage } from "./message";
import { getGame, updateGame } from "./gameStore";
import { rollDice } from "./dice";
import { playTurn } from "../engine/playTurn";
import { getCurrentPlayerSafe } from "../engine/assertions";

export function setupWebSocket(wss: WebSocketServer) {
  wss.on("connection", (socket: WebSocket) => {
    socket.on("message", (raw) => {
      let msg: ClientMessage;

      try {
        msg = JSON.parse(raw.toString());
      } catch {
        send(socket, { type: "ERROR", message: "Invalid JSON" });
        return;
      }

      /* =======================
         JOIN GAME
      ======================= */
      if (msg.type === "JOIN_GAME") {
        const game = getGame(msg.gameId);
        if (!game) {
          send(socket, { type: "ERROR", message: "Game not found" });
          return;
        }

        if (game.state.hasStarted) {
          send(socket, { type: "ERROR", message: "Game already started" });
          return;
        }

        const maxPlayers = game.state.maxPlayers ?? 4;
        if (game.state.players.length >= maxPlayers) {
          send(socket, { type: "ERROR", message: "Game is full" });
          return;
        }

        const newPlayer = {
          id: crypto.randomUUID(),
          name: msg.playerName,
          position: 0,
          money: 1500,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
        };

        game.state.players.push(newPlayer);

        broadcast(wss, {
          type: "GAME_STATE_UPDATE",
          gameId: msg.gameId,
          state: game.state,
        });
        console.log(`Player ${newPlayer.name} joined game ${msg.gameId}`);

        return;
      }

      /* =======================
         START GAME
      ======================= */
      if (msg.type === "START_GAME") {
        const game = getGame(msg.gameId);
        if (!game) return;

        if (game.state.players.length < 2) {
          send(socket, {
            type: "ERROR",
            message: "Need at least 2 players",
          });
          return;
        }

        game.state.hasStarted = true;
        game.state.currentTurnIndex = 0;

        broadcast(wss, {
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
          send(socket, { type: "ERROR", message: "Game not found" });
          return;
        }

        const currentPlayer = getCurrentPlayerSafe(game.state);
        if (currentPlayer.id !== msg.playerId) {
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
        console.log(
          `Player ${currentPlayer.name} rolled in game ${
            msg.gameId
          }.New State is ${JSON.stringify(newState)}`
        );

        return;
      }

      /* =======================
         LEAVE GAME-->DON'T IMPLEMENT FOR NOW,IT NEEDS TO BE COLLABORATED WITH PROPERTIES LEAVING
      ======================= */
      // if (msg.type === "LEAVE_GAME") {
      //   const game = getGame(msg.gameId);
      //   if (!game) return;

      //   game.state.players = game.state.players.filter(
      //     (p) => p.id !== msg.playerId
      //   );

      //   // Fix turn index if needed
      //   if (game.state.currentTurnIndex >= game.state.players.length) {
      //     game.state.currentTurnIndex = 0;
      //   }

      //   broadcast(wss, {
      //     type: "GAME_STATE_UPDATE",
      //     gameId: msg.gameId,
      //     state: game.state,
      //   });
      // }
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
