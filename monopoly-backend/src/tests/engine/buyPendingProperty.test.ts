import { buyPendingProperty } from "../../engine/buyPendingProperty";
import { GameState } from "../../types/game";
import { PropertyTile } from "../../types/board";

describe("buyPendingProperty", () => {
  test("buys property when pendingAction is BUY_PROPERTY", () => {
    const state: GameState = {
      players: [
        {
          id: "p1",
          name: "A",
          position: 37,
          money: 500,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      events: [],
      properties: [],
      communityChestDeck: [],
      communityChestIndex: 0,
      pendingAction: {
        type: "BUY_PROPERTY",
        property: {
          type: "PROPERTY",
          id: "makalu",
          name: "Makalu",
          price: 350,
          tileIndex: 37,
          baseRent: 35,
          group: "peak",
          houseRent: [175, 500, 1100, 1300],
          hotelRent: 1500,
          playerId: "p1",
          houseBuildCost: 70,
        },
      },
      pendingTrades: [],
    };

    const result = buyPendingProperty(state);

    expect(result.properties).toHaveLength(1);
    expect(result.properties[0]).toEqual({
      tileIndex: 37,
      ownerId: "p1",
      houses: 0,
      isMortaged: false,
    });

    expect(result.players[0]!.money).toBe(150);

    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toEqual({
      type: "PROPERTY_BOUGHT",
      //   playerId: "p1",
      tile: 37,
      //   price: 350,
    });

    expect(result.pendingAction).toBeNull();
  });

  test("does nothing if there is no pendingAction", () => {
    const state: GameState = {
      players: [
        {
          id: "p1",
          name: "A",
          position: 37,
          money: 500,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      events: [],
      properties: [],
      communityChestDeck: [],
      communityChestIndex: 0,
      pendingAction: null,
      pendingTrades: [],
    };

    const result = buyPendingProperty(state);

    expect(result).toEqual(state);
  });

  test("does nothing if pendingAction is not BUY_PROPERTY", () => {
    const state: GameState = {
      players: [
        {
          id: "p1",
          name: "A",
          position: 37,
          money: 500,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      events: [],
      properties: [],
      pendingAction: {
        type: "PAY_RENT",
      } as any,
      communityChestDeck: [],
      communityChestIndex: 0,
      pendingTrades: [],
    };

    const result = buyPendingProperty(state);

    expect(result).toEqual(state);
  });

  test("does not buy if player has insufficient money", () => {
    const state: GameState = {
      players: [
        {
          id: "p1",
          name: "A",
          position: 37,
          money: 100,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      events: [],
      properties: [],
      pendingAction: {
        type: "BUY_PROPERTY",
        property: {
          type: "PROPERTY",
          id: "makalu",
          name: "Makalu",
          price: 350,
          tileIndex: 37,
          baseRent: 35,
          group: "peak",
          houseRent: [175, 500, 1100, 1300],
          hotelRent: 1500,
          playerId: "p1",
          houseBuildCost: 70,
        },
      },
      communityChestDeck: [],
      communityChestIndex: 0,
      pendingTrades: [],
    };

    const result = buyPendingProperty(state);

    expect(result.properties).toHaveLength(0);
    expect(result.events).toHaveLength(0);
    expect(result.players[0]!.money).toBe(100);
    expect(result.pendingAction).toEqual(state.pendingAction);
  });

  test("does not mutate original state", () => {
    const state: GameState = {
      players: [
        {
          id: "p1",
          name: "A",
          position: 37,
          money: 500,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      events: [],
      properties: [],
      pendingAction: {
        type: "BUY_PROPERTY",
        property: {
          type: "PROPERTY",
          id: "makalu",
          name: "Makalu",
          price: 350,
          tileIndex: 37,
          baseRent: 35,
          group: "peak",
          houseRent: [175, 500, 1100, 1300],
          hotelRent: 1500,
          playerId: "p1",
          houseBuildCost: 70,
        },
      },
      communityChestDeck: [],
      communityChestIndex: 0,
      pendingTrades: [],
    };

    buyPendingProperty(state);

    expect(state.players[0]!.money).toBe(500);
    expect(state.properties).toHaveLength(0);
    expect(state.events).toHaveLength(0);
    expect(state.pendingAction).not.toBeNull();
  });
});
