import { GameState } from "../types/game";
import { PropertyTile } from "../types/board";

export function startAuction(state: GameState, tile: PropertyTile): GameState {
  //start auction as someone declined to buy property
  const activePlayerIds = state.players
    .filter((p) => !p.isBankrupt)
    .map((p) => p.id);

  return {
    ...state,
    pendingAction: {
      type: "AUCTION",
      auction: {
        property: tile,
        highestBid: 0,
        activePlayerIds,
        currentBidderIndex: 0,
      },
    },
    events: [
      ...state.events,
      {
        type: "AUCTION_STARTED",
        property: tile,
      },
    ],
  };
}
