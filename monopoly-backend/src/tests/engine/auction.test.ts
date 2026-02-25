import { BOARD } from "../../engine/board";
import { finalizeAuction } from "../../engine/finalizeAuction";
import { GameState } from "../../types/game";
import { PropertyTile } from "../../types/board";

test("auction assigns property to highest bidder", () => {
  //take property tile from the board BOARD_TILES for testing
  const testProperty = BOARD[1]! as PropertyTile;

  const state: GameState = {
    players: [
      {
        id: "p1",
        name: "A",
        money: 500,
        position: 1,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      },
      {
        id: "p2",
        name: "B",
        money: 500,
        position: 1,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      },
    ],
    currentTurnIndex: 0,
    communityChestDeck: [],
    communityChestIndex: 0,
    events: [],
    properties: [],
    pendingAction: {
      type: "AUCTION",
      auction: {
        property: testProperty,
        highestBid: 300,
        highestBidderId: "p2",
        activePlayerIds: ["p2"],
        currentBidderIndex: 0,
      },
    },
  };

  const result = finalizeAuction(state);

  expect(result.properties[0]).toEqual({
    tileIndex: 1,
    ownerId: "p2",
    houses: 0,
    isMortaged: false,
  });

  expect(result.players[1]!.money).toBe(200);
  expect(result.pendingAction).toBeNull();

  // After auction finalization, turn should advance
  expect(result.currentTurnIndex).toBe(1);
  expect(result.events).toContainEqual({
    type: "TURN_ENDED",
    nextPlayerId: "p2",
  });
});

//TODO: Check how these things are implemented and rewrite the tests if needed
// test("auction ends unsold when no bids", () => {
//   const state = createAuctionState({
//     highestBid: 0,
//     highestBidderId: undefined,
//   });

//   const result = resolveAuctionTimeout(state);

//   expect(result.pendingAction).toBeNull();
//   expect(result.properties).toHaveLength(0);
// });
