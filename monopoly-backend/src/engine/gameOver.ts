import { GameState } from "../types/game";

export function checkGameOver(state: GameState): GameState {
  const activePlayers = state.players.filter((p) => !p.isBankrupt);

  if (activePlayers.length !== 1) {
    return state;
  }

  const winner = activePlayers[0]!;

  return {
    ...state,
    events: [
      ...state.events,
      {
        type: "GAME_OVER",
        winnerId: winner.id,
      },
    ],
  };
}
