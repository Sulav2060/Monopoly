import { initiateTrade } from "../../engine/initiateTrade";
import { acceptTrade, rejectTrade } from "../../engine/finalizeTrade";
import { createBaseState } from "../helpers/gameState";

describe("Trade Feature", () => {
  describe("initiateTrade", () => {
    test("creates a trade offer with unique tradeId", () => {
      const state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      const result = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );

      expect(result.pendingTrades).toHaveLength(1);
      expect(result.pendingTrades[0]).toBeDefined();
      expect(result.pendingTrades[0]!.tradeId).toBeDefined();
      expect(result.pendingTrades[0]!.tradeId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    test("stores all trade details correctly", () => {
      const state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      const result = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );

      const trade = result.pendingTrades[0]!;
      expect(trade.initiatingPlayerId).toBe("p1");
      expect(trade.targetPlayerId).toBe("p2");
      expect(trade.offerMoney).toBe(100);
      expect(trade.offerProperties).toEqual([1]);
      expect(trade.requestMoney).toBe(50);
      expect(trade.requestProperties).toEqual([5]);
    });

    test("creates TRADE_OFFERED event with tradeId", () => {
      const state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      const result = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );

      const tradeEvent = result.events.find((e) => e.type === "TRADE_OFFERED");
      expect(tradeEvent).toBeDefined();
      expect(tradeEvent?.type).toBe("TRADE_OFFERED");
      expect("tradeId" in tradeEvent!).toBe(true);
    });

    test("allows multiple trades to accumulate", () => {
      const state = createBaseState();
      state.players.push({
        id: "p3",
        name: "Charlie",
        position: 10,
        money: 1500,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      });
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 10,
          ownerId: "p3",
          houses: 0,
          isMortaged: false,
        },
      ];

      let result = initiateTrade(state, "p1", "p2", 100, [1], 50, [5]);
      const firstTradeId = result.pendingTrades[0]!.tradeId;

      result = initiateTrade(result, "p1", "p3", 200, [], 0, [10]);
      const secondTradeId = result.pendingTrades[1]!.tradeId;

      expect(result.pendingTrades).toHaveLength(2);
      expect(firstTradeId).not.toBe(secondTradeId);
    });

    test("rejects trade if initiating player not found", () => {
      const state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      const result = initiateTrade(
        state,
        "invalid-player",
        "p2",
        100,
        [1],
        50,
        [5]
      );

      expect(result.pendingTrades).toHaveLength(0);
      expect(result).toEqual(state);
    });

    test("rejects trade if target player not found", () => {
      const state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      const result = initiateTrade(
        state,
        "p1",
        "invalid-player",
        100,
        [1],
        50,
        [5]
      );

      expect(result.pendingTrades).toHaveLength(0);
      expect(result).toEqual(state);
    });

    test("rejects trade if initiating player has insufficient money", () => {
      const state = createBaseState();
      state.players[0]!.money = 50; // Not enough for 100
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      const result = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );

      expect(result.pendingTrades).toHaveLength(0);
      expect(result).toEqual(state);
    });

    test("rejects trade if target player has insufficient money", () => {
      const state = createBaseState();
      state.players[1]!.money = 30; // Not enough for 50
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      const result = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );

      expect(result.pendingTrades).toHaveLength(0);
      expect(result).toEqual(state);
    });

    test("rejects trade if initiating player doesn't own offered property", () => {
      const state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p2", // p1 doesn't own this
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      const result = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );

      expect(result.pendingTrades).toHaveLength(0);
      expect(result).toEqual(state);
    });

    test("rejects trade if target player doesn't own requested property", () => {
      const state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p1", // p2 doesn't own this
          houses: 0,
          isMortaged: false,
        },
      ];

      const result = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );

      expect(result.pendingTrades).toHaveLength(0);
      expect(result).toEqual(state);
    });

    test("allows trade with zero money", () => {
      const state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      const result = initiateTrade(
        state,
        "p1",
        "p2",
        0,
        [1],
        0,
        [5]
      );

      expect(result.pendingTrades).toHaveLength(1);
    });

    test("allows trade with empty property arrays", () => {
      const state = createBaseState();

      const result = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [],
        50,
        []
      );

      expect(result.pendingTrades).toHaveLength(1);
      expect(result.pendingTrades[0]!.offerProperties).toEqual([]);
      expect(result.pendingTrades[0]!.requestProperties).toEqual([]);
    });
  });

  describe("acceptTrade", () => {
    test("accepts trade and transfers money correctly", () => {
      const state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      let result = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );
      const tradeId = result.pendingTrades[0]!.tradeId;

      result = acceptTrade(result, tradeId);

      // p1 loses 100, gains 50 = -50
      expect(result.players[0]!.money).toBe(1450);
      // p2 gains 100, loses 50 = +50
      expect(result.players[1]!.money).toBe(1550);
    });

    test("accepts trade and transfers properties correctly", () => {
      const state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      let result = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );
      const tradeId = result.pendingTrades[0]!.tradeId;

      result = acceptTrade(result, tradeId);

      const prop1 = result.properties.find((p) => p.tileIndex === 1);
      const prop5 = result.properties.find((p) => p.tileIndex === 5);

      expect(prop1!.ownerId).toBe("p2");
      expect(prop5!.ownerId).toBe("p1");
    });

    test("removes trade from pending trades after acceptance", () => {
      const state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      let result = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );
      const tradeId = result.pendingTrades[0]!.tradeId;

      result = acceptTrade(result, tradeId);

      expect(result.pendingTrades).toHaveLength(0);
    });

    test("creates TRADE_ACCEPTED event with tradeId", () => {
      const state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      let result = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );
      const tradeId = result.pendingTrades[0]!.tradeId;

      result = acceptTrade(result, tradeId);

      const acceptEvent = result.events.find((e) => e.type === "TRADE_ACCEPTED");
      expect(acceptEvent).toBeDefined();
      expect(acceptEvent?.type).toBe("TRADE_ACCEPTED");
      expect("tradeId" in acceptEvent!).toBe(true);
    });

    test("rejects acceptance if trade ID not found", () => {
      const state = createBaseState();

      const result = acceptTrade(state, "invalid-trade-id");

      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });

    test("rejects acceptance if initiating player not found", () => {
      const state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      let result = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );
      const tradeId = result.pendingTrades[0]!.tradeId;

      // Remove initiating player
      result.players = result.players.filter((p) => p.id !== "p1");

      result = acceptTrade(result, tradeId);

      expect(result.players).toHaveLength(1);
    });

    test("rejects acceptance if initiating player has insufficient funds at execution time", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      state = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );
      const tradeId = state.pendingTrades[0]!.tradeId;

      // Decrease p1's money after trade was initiated
      state.players[0]!.money = 50;

      const result = acceptTrade(state, tradeId);

      // Trade should not be accepted
      expect(result.pendingTrades).toHaveLength(1);
    });

    test("rejects acceptance if property still owned by correct player", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      state = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );
      const tradeId = state.pendingTrades[0]!.tradeId;

      // Change property ownership
      state.properties[0]!.ownerId = "p2";

      const result = acceptTrade(state, tradeId);

      // Trade should not be accepted
      expect(result.pendingTrades).toHaveLength(1);
    });

    test("rejects acceptance if property has houses", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 1, // Has a house
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      state = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );
      const tradeId = state.pendingTrades[0]!.tradeId;

      const result = acceptTrade(state, tradeId);

      // Trade should not be accepted due to houses
      expect(result.pendingTrades).toHaveLength(1);
    });

    test("accepts property trades with multiple properties", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 3,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 6,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      state = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1, 3],
        50,
        [5, 6]
      );
      const tradeId = state.pendingTrades[0]!.tradeId;

      const result = acceptTrade(state, tradeId);

      expect(result.properties.find((p) => p.tileIndex === 1)!.ownerId).toBe("p2");
      expect(result.properties.find((p) => p.tileIndex === 3)!.ownerId).toBe("p2");
      expect(result.properties.find((p) => p.tileIndex === 5)!.ownerId).toBe("p1");
      expect(result.properties.find((p) => p.tileIndex === 6)!.ownerId).toBe("p1");
    });
  });

  describe("rejectTrade", () => {
    test("rejects trade and removes it from pending", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      state = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );
      const tradeId = state.pendingTrades[0]!.tradeId;
      const initialMoney1 = state.players[0]!.money;
      const initialMoney2 = state.players[1]!.money;

      state = rejectTrade(state, tradeId);

      expect(state.pendingTrades).toHaveLength(0);
      expect(state.players[0]!.money).toBe(initialMoney1);
      expect(state.players[1]!.money).toBe(initialMoney2);
    });

    test("creates TRADE_REJECTED event with tradeId", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      state = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );
      const tradeId = state.pendingTrades[0]!.tradeId;

      state = rejectTrade(state, tradeId);

      const rejectEvent = state.events.find((e) => e.type === "TRADE_REJECTED");
      expect(rejectEvent).toBeDefined();
      expect(rejectEvent?.type).toBe("TRADE_REJECTED");
      expect("tradeId" in rejectEvent!).toBe(true);
    });

    test("rejects rejection if trade ID not found", () => {
      const state = createBaseState();

      const result = rejectTrade(state, "invalid-trade-id");

      expect(result).toEqual(state);
    });

    test("doesn't affect money or properties when rejecting", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      state = initiateTrade(
        state,
        "p1",
        "p2",
        100,
        [1],
        50,
        [5]
      );
      const tradeId = state.pendingTrades[0]!.tradeId;
      const initialState = JSON.parse(JSON.stringify(state));

      state = rejectTrade(state, tradeId);

      // Check that only pendingTrades and events changed
      expect(state.players).toEqual(initialState.players);
      expect(state.properties).toEqual(initialState.properties);
    });
  });

  describe("multiple concurrent trades", () => {
    test("handles multiple pending trades with different trade IDs", () => {
      let state = createBaseState();
      state.players.push({
        id: "p3",
        name: "Charlie",
        position: 10,
        money: 1500,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      });
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 10,
          ownerId: "p3",
          houses: 0,
          isMortaged: false,
        },
      ];

      state = initiateTrade(state, "p1", "p2", 100, [1], 50, [5]);
      const firstTradeId = state.pendingTrades[0]!.tradeId;

      state = initiateTrade(state, "p1", "p3", 200, [], 0, [10]);
      const secondTradeId = state.pendingTrades[1]!.tradeId;

      expect(state.pendingTrades).toHaveLength(2);
      expect(firstTradeId).not.toBe(secondTradeId);

      // Accept only first trade
      state = acceptTrade(state, firstTradeId);

      expect(state.pendingTrades).toHaveLength(1);
      expect(state.pendingTrades[0]!.tradeId).toBe(secondTradeId);
    });

    test("allows multiple separate trades between same two players", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 3,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 6,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      state = initiateTrade(state, "p1", "p2", 100, [1], 50, [5]);
      const firstTradeId = state.pendingTrades[0]!.tradeId;

      state = initiateTrade(state, "p1", "p2", 200, [3], 100, [6]);
      const secondTradeId = state.pendingTrades[1]!.tradeId;

      expect(state.pendingTrades).toHaveLength(2);
      expect(firstTradeId).not.toBe(secondTradeId);
      expect(state.pendingTrades[0]!.initiatingPlayerId).toBe("p1");
      expect(state.pendingTrades[1]!.initiatingPlayerId).toBe("p1");
    });

    test("rejects second trade independently if first is invalid", () => {
      let state = createBaseState();
      state.players.push({
        id: "p3",
        name: "Charlie",
        position: 10,
        money: 1500,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      });
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 5,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
        {
          tileIndex: 10,
          ownerId: "p3",
          houses: 0,
          isMortaged: false,
        },
      ];

      // Try invalid trade (p1 doesn't have property 99)
      state = initiateTrade(state, "p1", "p2", 100, [99], 50, [5]);

      // Valid trade should still work
      state = initiateTrade(state, "p1", "p3", 200, [1], 0, [10]);

      expect(state.pendingTrades).toHaveLength(1);
      expect(state.pendingTrades[0]!.offerProperties).toEqual([1]);
    });
  });
});
