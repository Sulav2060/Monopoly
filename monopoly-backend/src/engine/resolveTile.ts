import { GameState } from "../types/game";
import { getCurrentPlayerSafe } from "./assertions";
import { BOARD } from "./board";
import { buyProperty } from "./buyProperty";
import { drawCommunityChest } from "./drawCommunityChest";
import { goToJail } from "./goToJail";
import { handleFreeParking } from "./handleFreeParking";
import { handleTax } from "./handleTax";
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
        return {
          ...state,
          pendingAction: {
            type: "BUY_PROPERTY",
            property: {
              playerId: player.id,
              ...tile,
            },
          },
          events: [
            ...state.events,
            {
              type: "PROPERTY_OFFERED",
              playerId: player.id,
              tileIndex: tile.tileIndex,
              price: tile.price,
            },
          ],
        };
      }

      if (owner.ownerId !== player.id) {
        return payRent(state, tile);
      }

      return state;
    }

    case "TAX":
      return handleTax(state, tile.amount);

    case "FREE_PARKING":
      return handleFreeParking(state);

    case "COMMUNITY_CHEST":
      return drawCommunityChest(state);

    case "CHANCE":
      return drawCommunityChest(state);

    default:
      return state;
  }
}
