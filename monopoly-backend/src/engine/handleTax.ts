import { GameState } from "../types/game";
import { getCurrentPlayerSafe } from "./assertions";
import { bankruptPlayer } from "./bankruptPlayer";

export function handleTax(state: GameState, amount: number): GameState {
  const player = getCurrentPlayerSafe(state);

  const players = state.players.map((p) =>
    p.id === player.id ? { ...p, money: p.money - amount } : p,
  );
  //run bankrupt player as the player may have negative money after paying tax
  if (players.find((p) => p.id === player.id)?.money! < 0) {
    return bankruptPlayer(state, player.id);
  }
  //TODO: The money that player left will not be coming to free parking pot.To add that logic later.

  return {
    ...state,
    players,
    freeParkingPot: state.freeParkingPot ?? +amount, //TODO: If the freeParkingPot exists then this else what if it doesn't exists??Please revalidate this logic.
    events: [
      ...state.events,
      {
        type: "TAX_PAID",
        playerId: player.id,
        amount,
      },
    ],
  };
}
