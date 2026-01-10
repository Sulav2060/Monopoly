import { PropertyTile } from "../types/board";
import { GameState } from "../types/game";
import { getCurrentPlayerSafe } from "./assertions";
import { bankruptPlayer } from "./bankruptPlayer";
import { getPropertyOwner } from "./propertyHelpers";

export function payRent(state: GameState, tile: PropertyTile): GameState {
  const player = getCurrentPlayerSafe(state);
  const ownership = getPropertyOwner(state, tile.tileIndex);
  if (!ownership) return state; //no owner
  if (ownership.ownerId === player.id) return state; //own property

  const rent = tile.baseRent;
  const newMoney = player.money - rent;

  if (newMoney < 0) {
    return bankruptPlayer(state, player.id, ownership.ownerId);
  }

  return {
    ...state,
    players: state.players.map((p) => {
      if (p.id === player.id) {
        return { ...p, money: p.money - rent };
      }
      if (p.id === ownership.ownerId) {
        return { ...p, money: p.money + rent };
      }
      return p;
    }),
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
