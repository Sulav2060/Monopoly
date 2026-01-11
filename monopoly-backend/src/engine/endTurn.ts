import { GameState } from "../types/game";

export function endTurn(state: GameState): GameState {
  const players = state.players;
  const total = players.length;

  if (total === 0) {
    throw new Error("No players in game");
  }

  let nextIndex = state.currentTurnIndex; //starting by games current state
  let checked = 0;

  do {
    // Understand this :The current turn player should move turn to next player so do loop is used
    nextIndex = (nextIndex + 1) % total; //the current player turn moves  to next player
    checked++; //checked counts how many potential next players we have tested(prevents infinite loop) TODO: I don't understand this
  } while (players[nextIndex]!.isBankrupt && checked < total);

  // All players bankrupt or only current remains
  if (checked >= total) {
    return state; // game over handled elsewhere
  }

  // console.log(`Turn ended. Next player index: ${nextIndex}`);
  // console.log(`Turn ended. Next player id: ${nextIndex}`);


  return {
    ...state,
    currentTurnIndex: nextIndex,
    events: [
      ...state.events,
      {
        type: "TURN_ENDED",
        nextPlayerId: players[nextIndex]!.id,
      },
    ],
  };
}
