// engine/resolveAuctionTimeout.ts
import { GameState } from "../types/game";
import { finalizeAuction } from "./finalizeAuction";
import { endTurn } from "./endTurn";

export function resolveAuctionTimeout(state: GameState): GameState {
  //noone bids for the property within the time limit
  if (state.pendingAction?.type !== "AUCTION") return state;

  const auction = state.pendingAction.auction;

  // No bids → unsold, end turn
  if (!auction.highestBidderId) {
    return endTurn({
      ...state,
      pendingAction: null,
      events: [
        ...state.events,
        {
          type: "AUCTION_UNSOLD",
          tileIndex: auction.property.tileIndex,
        },
      ],
    });
  }

  //if Bid exists → finalize sale (which also ends turn)
  return finalizeAuction(state);
}
