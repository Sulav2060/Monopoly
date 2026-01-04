import { GameState } from "../types/game";
import { BOARD } from "./board";
import { getCurrentPlayerSafe } from "./assertions";
import { JAIL_INDEX } from "./board";
import { getPropertyOwner } from "./propertyHelpers";
import { buyProperty } from "./buyProperty";
import { payRent } from "./payRent";

export function resolveCurrentTile(state: GameState): GameState {
  const index = state.currentTurnIndex;
  const player = getCurrentPlayerSafe(state);
  const tile = BOARD[player.position];
  if (!tile) return state;

  switch (tile.type) {
    case "GO_TO_JAIL": {
      const updatedPlayer = {
        ...player,
        position: JAIL_INDEX,
        inJail: true,
        jailTurns: 0,
      };

      const players = [...state.players];
      players[index] = updatedPlayer;

      return {
        ...state,
        players,
        events: [...state.events, { type: "PLAYER_SENT_TO_JAIL" }],
      };
    }

    case "GO":
      return state;

    case "PROPERTY":
    case "PROPERTY": {
      const owner = getPropertyOwner(state, tile.id);

      if (!owner) return buyProperty(state, tile);

      return payRent(state, tile);
    }

    case "TAX":
    // return handleTax(state, tile.amount);

    default:
      return state;
  }
}
