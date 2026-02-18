// engine/passAuction.ts
import { GameState } from "../types/game";
import { finalizeAuction } from "./finalizeAuction";

export function passAuction(state: GameState, playerId: string): GameState {
  if (state.pendingAction?.type !== "AUCTION") return state;

  const auction = state.pendingAction.auction;
  const remaining = auction.activePlayerIds.filter((id) => id !== playerId); //remove this player from auction as he "passed"

  // Only one left → auction ends
  if (remaining.length === 1) {
    return finalizeAuction(state);
  }

  return {
    ...state,
    pendingAction: {
      type: "AUCTION",
      auction: {
        ...auction,
        activePlayerIds: remaining,
        currentBidderIndex: auction.currentBidderIndex % remaining.length, //what is this?->Keep the current bidder pointer within the bounds of the remaining active players.
      },
    },
    events: [
      ...state.events,
      {
        type: "AUCTION_PLAYER_PASSED",
        playerId,
      },
    ],
  };
}
