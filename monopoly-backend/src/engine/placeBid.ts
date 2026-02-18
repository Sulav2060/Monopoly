// engine/placeBid.ts
import { GameState } from "../types/game";

export function placeBid(
  state: GameState,
  playerId: string,
  amount: number,
): GameState {
  if (state.pendingAction?.type !== "AUCTION") return state;

  const auction = state.pendingAction.auction;
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.money < amount) return state;

  if (amount <= auction.highestBid) return state;

  return {
    ...state,
    pendingAction: {
      type: "AUCTION",
      auction: {
        ...auction,
        highestBid: amount,
        highestBidderId: playerId,
      },
    },
    events: [
      ...state.events,
      {
        type: "AUCTION_BID_PLACED",
        playerId,
        amount,
      },
    ],
  };
}
