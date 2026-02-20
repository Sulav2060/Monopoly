import { PropertyTile } from "../types/board";
import { GameState } from "../types/game";
import { getCurrentPlayerSafe } from "./assertions";
import { payRent } from "./payRent";

export function handleProperty(
  state: GameState,
  tile: PropertyTile
): GameState {
  const player = getCurrentPlayerSafe(state);

  const owned = state.properties.find((p) => p.tileIndex === player.position);

  // Not owned → auto-buy (for now)
  if (!owned && player.money >= tile.price) {
    return {
      ...state,
      players: state.players.map((p) =>
        p.id === player.id ? { ...p, money: p.money - tile.price } : p
      ),
      properties: [
        ...state.properties,
        {
          tileIndex: player.position,
          ownerId: player.id,
        },
      ],
      events: [...state.events, { type: "PROPERTY_BOUGHT", tile: player.position }],
    };
  }

  // Owned by someone else → pay rent
  if (owned && owned.ownerId !== player.id) {
    return payRent(state, tile);
  }

  return state;
}
