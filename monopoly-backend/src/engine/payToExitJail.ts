import { GameState, PlayerId } from "../types/game";

const JAIL_FEE = 50;

export function payToExitJail(
  state: GameState,
  playerId: PlayerId,
): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  // Validation
  if (!player.inJail) {
    return state; // Player is not in jail
  }

  if (player.money < JAIL_FEE) {
    return state; // Cannot afford jail fee
  }

  // Pay fee and exit jail
  const players = state.players.map((p) =>
    p.id === playerId
      ? {
          ...p,
          money: p.money - JAIL_FEE,
          inJail: false,
          jailTurns: 0,
        }
      : p,
  );

  return {
    ...state,
    players,
    events: [
      ...state.events,
      {
        type: "JAIL_EXITED",
        reason: "PAID_FEE",
      },
      {
        type: "JAIL_FEE_PAID",
        playerId,
        amount: JAIL_FEE,
      },
    ],
  };
}

export { JAIL_FEE };
