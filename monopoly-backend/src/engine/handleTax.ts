import { GameState } from "../types/game";
import { getCurrentPlayerSafe } from "./assertions";

export function handleTax(state: GameState, amount: number): GameState {
  const player = getCurrentPlayerSafe(state);

  const players = state.players.map((p) =>
    p.id === player.id ? { ...p, money: p.money - amount } : p
  );

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
