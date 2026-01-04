// engine/payRent.ts
import { GameState } from "../types/game";
import { PropertyTile } from "../types/board";
import { getPropertyOwner } from "./propertyHelpers";
import { getCurrentPlayerSafe } from "./assertions";

export function payRent(state: GameState, tile: PropertyTile): GameState {
  const index = state.currentTurnIndex;
  const player = getCurrentPlayerSafe(state);
  const ownership = getPropertyOwner(state, tile.id);
  if (!ownership) return state;
  if (ownership.ownerId === player.id) return state;

  const rent = tile.baseRent;

  const ownerIndex = state.players.findIndex((p) => p.id === ownership.ownerId);

  const players = state.players.map((p, i) => {
    if (i === index) {
      return { ...p, money: p.money - rent };
    }
    if (p.id === ownership.ownerId) {
      return { ...p, money: p.money + rent };
    }
    return p;
  });

  return {
    ...state,
    players,
    events: [
      ...state.events,
      {
        type: "RENT_PAID",
        from: player.id,
        to: ownership.ownerId,
        amount: rent,
      },
    ],
  };
}
