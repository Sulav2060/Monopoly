import { PropertyTile } from "../types/board";
import { GameState } from "../types/game";
import { getCurrentPlayerSafe } from "./assertions";
import { bankruptPlayer } from "./bankruptPlayer";
import { getPropertyOwner } from "./propertyHelpers";

export function payRent(state: GameState, tile: PropertyTile): GameState {
  //change pay rent based on houses.
  const player = getCurrentPlayerSafe(state);
  const ownership = getPropertyOwner(state, tile.tileIndex);
  if (!ownership) return state; //no owner
  if (ownership.ownerId === player.id) return state; //own property

  // Retrieve number of houses from the state for the tile
  const houses = ownership.houses;

  // Calculate rent based on number of houses
  let rent: number;
  if (houses === 0) {
    // No houses: use base rent
    rent = tile.baseRent;
  } else if (houses >= 1 && houses <= 4) {
    // 1-4 houses: use houseRent array (index 0 for 1 house, etc.)
    rent = tile.houseRent[houses - 1] ?? tile.baseRent;
  } else {
    // 5 houses = hotel: use hotelRent
    rent = tile.hotelRent;
  }

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
