// engine/resolveAuctionTimeout.ts
import { GameState } from "../types/game";
import { finalizeAuction } from "./finalizeAuction";

export function resolveAuctionTimeout(state: GameState): GameState {
  //noone bids for the property within the time limit
  if (state.pendingAction?.type !== "AUCTION") return state;

  const auction = state.pendingAction.auction;

  // No bids → unsold
  if (!auction.highestBidderId) {
    return {
      ...state,
      pendingAction: null,
      events: [
        ...state.events,
        {
          type: "AUCTION_UNSOLD",
          tileIndex: auction.property.tileIndex,
        },
      ],
    };
  }

  //if Bid exists → finalize sale
  return finalizeAuction(state);
}
