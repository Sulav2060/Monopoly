import { GameState, PlayerState } from "../types/game";
import { getCurrentPlayerSafe } from "./assertions";

export function getCurrentPlayer(state: GameState): PlayerState {
  //Reads the index and Returns the player whose turn it is
  const player = getCurrentPlayerSafe(state);
  return player;
}

export function getNextTurnIndex(state: GameState): number {
  return (state.currentTurnIndex + 1) % state.players.length;
}

export function endTurn(state: GameState): GameState {
  const nextIndex = getNextTurnIndex(state);
  const nextPlayer = state.players[nextIndex];

  if (!nextPlayer) {
    throw new Error("Invalid next turn index");
  }

  return {
    ...state,
    currentTurnIndex: nextIndex,
    events: [
      ...state.events,
      { type: "TURN_ENDED", nextPlayerId: nextPlayer.id },
    ],
  };
}
