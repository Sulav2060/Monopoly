import { GameState } from "../types/game";
import { BOARD } from "./board";
import { startAuction } from "./startAuction";
import { PropertyTile } from "../types/board";
import { endTurn } from "./endTurn";

export function skipProperty(state: GameState): GameState {
  const pending = state.pendingAction;

  if (!pending || pending.type !== "BUY_PROPERTY") {
    return state;
  }

  // Instead of just skipping and ending turn, we start an auction
  const tile = BOARD[pending.tileIndex];
  
  if (tile && tile.type === "PROPERTY") {
    return startAuction(state, tile as PropertyTile);
  }

  // Fallback if not an auctionable property (shouldn't happen for BUY_PROPERTY)
  return {
    ...endTurn({
      ...state,
      pendingAction: null,
      events: [
        ...state.events,
        {
          type: "PROPERTY_SKIPPED",
          playerId: pending.playerId,
          tileIndex: pending.tileIndex,
        },
      ],
    }),
  };
}
