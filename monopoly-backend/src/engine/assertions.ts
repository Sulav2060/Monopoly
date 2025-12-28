//assertions

import { GameState, PlayerState } from "../types/game";

export function getCurrentPlayerSafe(state: GameState): PlayerState {
  const player = state.players[state.currentTurnIndex];

  if (!player) {
    throw new Error("Invalid currentTurnIndex or no players in game");
  }

  return player;
}
