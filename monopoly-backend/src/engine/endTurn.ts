import { GameState } from "../types/game";

export function endTurn(state: GameState): GameState {
  if (state.players.length === 0) {
    throw new Error("No players in the game");
  }

  const nextPlayerIndex = (state.currentTurnIndex + 1) % state.players.length;

  return {
    ...state,
    currentTurnIndex: nextPlayerIndex,
    events: [
      ...state.events,
      {
        type: "TURN_ENDED",
        nextPlayerId: state.players[nextPlayerIndex]!.id, // TODO:instead of assertion maybe another fix??
      },
    ],
  };
}
