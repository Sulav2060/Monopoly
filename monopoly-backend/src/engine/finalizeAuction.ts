// engine/finalizeAuction.ts
import { GameState } from "../types/game";

export function finalizeAuction(state: GameState): GameState {
  //finalize/finish auction when just one player remains or highest bid exists
  if (state.pendingAction?.type !== "AUCTION") return state;

  const auction = state.pendingAction.auction;
  if (!auction.highestBidderId)
    throw new Error("Cannot finalize auction without a highest bidder");

  return {
    ...state,
    players: state.players.map((p) =>
      p.id === auction.highestBidderId
        ? { ...p, money: p.money - auction.highestBid }
        : p,
    ),
    properties: [
      ...state.properties,
      {
        tileIndex: auction.property.tileIndex,
        ownerId: auction.highestBidderId,
        houses: 0,
        isMortaged: false,
      },
    ],
    pendingAction: null,
    events: [
      ...state.events,
      {
        type: "AUCTION_WON",
        playerId: auction.highestBidderId,
        tileIndex: auction.property.tileIndex,
        amount: auction.highestBid,
      },
    ],
  };
}
