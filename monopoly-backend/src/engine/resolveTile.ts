import { GameState } from "../types/game";
import { getCurrentPlayerSafe } from "./assertions";
import { BOARD } from "./board";
import { buyProperty } from "./buyProperty";
import { goToJail } from "./goToJail";
import { payRent } from "./payRent";
import { getPropertyOwner } from "./propertyHelpers";

export function resolveCurrentTile(state: GameState): GameState {
  const player = getCurrentPlayerSafe(state);
  const tile = BOARD[player.position];
  if (!tile) return state;

  switch (tile.type) {
    case "GO_TO_JAIL":
      return goToJail(state);

    case "GO": //TODO: what about adding 200 bonus
      return state;

    case "PROPERTY": {
      const owner = getPropertyOwner(state, tile.tileIndex);

      if (!owner) {
        return buyProperty(state, tile);
      }

      if (owner.ownerId !== player.id) {
        return payRent(state, tile);
      }

      return state;
    }

    case "TAX":
      // return handleTax(state, tile.amount);
      return state;

    default:
      return state;
  }
}
