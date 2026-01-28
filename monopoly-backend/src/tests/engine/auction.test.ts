import { finalizeAuction } from "../../engine/finalizeAuction";
import { GameState } from "../../types/game";

test("auction assigns property to highest bidder", () => {
  const testProperty = { id: "prop1", name: "Test Property", tileIndex: 5 };
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
    propertyId: testProperty.id,
    ownerId: "p2",
  });

  expect(result.players[1]!.money).toBe(200);
  expect(result.pendingAction).toBeNull();
});

test("auction ends unsold when no bids", () => {
  const state = createAuctionState({
    highestBid: 0,
    highestBidderId: undefined,
  });

  const result = resolveAuctionTimeout(state);

  expect(result.pendingAction).toBeNull();
  expect(result.properties).toHaveLength(0);
});
