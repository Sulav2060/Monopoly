import { WebSocketServer, WebSocket } from "ws";
import { ClientMessage, ServerMessage } from "./message";
import { getGame, updateGame } from "./gameStore";
import { rollDice } from "./dice";
import { playTurn } from "../engine/playTurn";
import { getCurrentPlayerSafe } from "../engine/assertions";

export function setupWebSocket(wss: WebSocketServer) {
  wss.on("connection", (socket: WebSocket) => {
    socket.on("message", (raw) => {
      //listen for messages from client
      let msg: ClientMessage;

      try {
        msg = JSON.parse(raw.toString());
      } catch {
        send(socket, { type: "ERROR", message: "Invalid JSON" }); //why socket here though??
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
