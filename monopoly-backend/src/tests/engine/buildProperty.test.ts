import { buildProperty } from "../../engine/buildProperty";
import { GameState } from "../../types/game";

describe("buildProperty", () => {
  // Helper function to create a base game state
  function createGameStateWithProperties(): GameState {
    return {
      players: [
        {
          id: "p1",
          name: "Alice",
          position: 1,
          money: 1500,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
        },
        {
          id: "p2",
          name: "Bob",
          position: 5,
          money: 1500,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
        },
      ],
      currentTurnIndex: 0,
      events: [],
      properties: [],
      communityChestDeck: [],
      communityChestIndex: 0,
      pendingAction: null,
    };
  }

  describe("successful building", () => {
    test("builds first house on property when player owns entire group", () => {
      const state = createGameStateWithProperties();
      // Player owns all "terai" group properties (tileIndex 1 and 3)
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 0, isMortaged: false },
      ];

      const result = buildProperty(state, "p1", 1);

      // Verify house was built
      const property = result.properties.find((p) => p.tileIndex === 1);
      expect(property?.houses).toBe(1);

      // Verify money deducted (house cost is 12 for terai group)
      expect(result.players[0]!.money).toBe(1500 - 12);

      // Verify event was added
      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toEqual({
        type: "PROPERTY_BUILT",
        playerId: "p1",
        tileIndex: 1,
        houses: 1,
        cost: 12,
      });
    });

    test("builds second house on property maintaining uniform building", () => {
      const state = createGameStateWithProperties();
      // Both properties have 1 house, so we can build second on first property
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 1, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 1, isMortaged: false },
      ];

      const result = buildProperty(state, "p1", 1);

      const property = result.properties.find((p) => p.tileIndex === 1);
      expect(property?.houses).toBe(2);
      expect(result.players[0]!.money).toBe(1500 - 12);
    });

    test("builds hotel (5th house) on property", () => {
      const state = createGameStateWithProperties();
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 4, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 4, isMortaged: false },
      ];

      const result = buildProperty(state, "p1", 1);

      const property = result.properties.find((p) => p.tileIndex === 1);
      expect(property?.houses).toBe(5); // 5 means hotel
      expect(result.players[0]!.money).toBe(1500 - 12);
    });

    test("builds on 3-property group (lake group)", () => {
      const state = createGameStateWithProperties();
      // Lake group has 3 properties: 6, 8, 9
      state.properties = [
        { tileIndex: 6, ownerId: "p1", houses: 0, isMortaged: false },
        { tileIndex: 8, ownerId: "p1", houses: 0, isMortaged: false },
        { tileIndex: 9, ownerId: "p1", houses: 0, isMortaged: false },
      ];

      const result = buildProperty(state, "p1", 6);

      const property = result.properties.find((p) => p.tileIndex === 6);
      expect(property?.houses).toBe(1);
      // House cost for lake group is 20 (tileIndex 6)
      expect(result.players[0]!.money).toBe(1500 - 20);
    });

    test("maintains uniform building within 1 house difference", () => {
      const state = createGameStateWithProperties();
      // One property has 1 house, one has 0 - we can build on the one with 0
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 1, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 0, isMortaged: false },
      ];

      const result = buildProperty(state, "p1", 3);

      const property = result.properties.find((p) => p.tileIndex === 3);
      expect(property?.houses).toBe(1);
    });
  });

  describe("validation failures", () => {
    test("fails when not player's turn", () => {
      const state = createGameStateWithProperties();
      state.properties = [
        { tileIndex: 1, ownerId: "p2", houses: 0, isMortaged: false },
        { tileIndex: 3, ownerId: "p2", houses: 0, isMortaged: false },
      ];
      state.currentTurnIndex = 1; // p2's turn

      const result = buildProperty(state, "p1", 1);

      // State should not change
      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });

    test("fails when tile is invalid or not a property", () => {
      const state = createGameStateWithProperties();
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: false },
      ];

      // TileIndex 0 is GO, not a property
      const result = buildProperty(state, "p1", 0);

      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });

    test("fails when player does not own the property", () => {
      const state = createGameStateWithProperties();
      state.properties = [
        { tileIndex: 1, ownerId: "p2", houses: 0, isMortaged: false },
        { tileIndex: 3, ownerId: "p2", houses: 0, isMortaged: false },
      ];

      const result = buildProperty(state, "p1", 1);

      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });

    test("fails when property is not owned at all", () => {
      const state = createGameStateWithProperties();
      state.properties = [];

      const result = buildProperty(state, "p1", 1);

      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });

    test("fails when player does not own entire group", () => {
      const state = createGameStateWithProperties();
      // Player owns only one property in terai group (needs both 1 and 3)
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: false },
        { tileIndex: 3, ownerId: "p2", houses: 0, isMortaged: false },
      ];

      const result = buildProperty(state, "p1", 1);

      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });

    test("fails when any property in group is mortgaged", () => {
      const state = createGameStateWithProperties();
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 0, isMortaged: true }, // mortgaged
      ];

      const result = buildProperty(state, "p1", 1);

      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });

    test("fails when building violates uniform building rule", () => {
      const state = createGameStateWithProperties();
      // First property has 2 houses, second has 0 - can't build on first (would be 3 vs 0)
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 2, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 1, isMortaged: false },
      ];

      const result = buildProperty(state, "p1", 1);

      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });

    test("fails when uniform building violated in 3-property group", () => {
      const state = createGameStateWithProperties();
      // Lake group: 6, 8, 9 - trying to build on property with 2 when others have 0
      state.properties = [
        { tileIndex: 6, ownerId: "p1", houses: 2, isMortaged: false },
        { tileIndex: 8, ownerId: "p1", houses: 0, isMortaged: false },
        { tileIndex: 9, ownerId: "p1", houses: 0, isMortaged: false },
      ];

      const result = buildProperty(state, "p1", 6);

      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });

    test("fails when property already has hotel (5 houses)", () => {
      const state = createGameStateWithProperties();
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 5, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 5, isMortaged: false },
      ];

      const result = buildProperty(state, "p1", 1);

      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });

    test("fails when player has insufficient funds", () => {
      const state = createGameStateWithProperties();
      state.players[0]!.money = 5; // Less than house cost of 12
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 0, isMortaged: false },
      ];

      const result = buildProperty(state, "p1", 1);

      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });
  });

  describe("state immutability", () => {
    test("does not mutate original state on successful build", () => {
      const state = createGameStateWithProperties();
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 0, isMortaged: false },
      ];

      const originalMoney = state.players[0]!.money;
      const originalHouses = state.properties[0]!.houses;
      const originalEventsLength = state.events.length;

      buildProperty(state, "p1", 1);

      // Original state unchanged
      expect(state.players[0]!.money).toBe(originalMoney);
      expect(state.properties[0]!.houses).toBe(originalHouses);
      expect(state.events).toHaveLength(originalEventsLength);
    });

    test("does not mutate original state on validation failure", () => {
      const state = createGameStateWithProperties();
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: false },
      ];

      const originalState = JSON.parse(JSON.stringify(state));

      buildProperty(state, "p1", 1); // Will fail - doesn't own entire group

      expect(state).toEqual(originalState);
    });
  });

  describe("edge cases", () => {
    test("handles building on expensive property group (peak)", () => {
      const state = createGameStateWithProperties();
      state.players[0]!.money = 2000;
      // Peak group: 37 and 39
      state.properties = [
        { tileIndex: 37, ownerId: "p1", houses: 0, isMortaged: false },
        { tileIndex: 39, ownerId: "p1", houses: 0, isMortaged: false },
      ];

      const result = buildProperty(state, "p1", 37);

      const property = result.properties.find((p) => p.tileIndex === 37);
      expect(property?.houses).toBe(1);
      // House cost for Makalu is 70
      expect(result.players[0]!.money).toBe(2000 - 70);
    });

    test("allows building when all properties have equal houses", () => {
      const state = createGameStateWithProperties();
      state.properties = [
        { tileIndex: 6, ownerId: "p1", houses: 2, isMortaged: false },
        { tileIndex: 8, ownerId: "p1", houses: 2, isMortaged: false },
        { tileIndex: 9, ownerId: "p1", houses: 2, isMortaged: false },
      ];

      const result = buildProperty(state, "p1", 6);

      const property = result.properties.find((p) => p.tileIndex === 6);
      expect(property?.houses).toBe(3);
    });

    test("handles multiple players with different property groups", () => {
      const state = createGameStateWithProperties();
      state.properties = [
        // p1 owns terai group
        { tileIndex: 1, ownerId: "p1", houses: 1, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 1, isMortaged: false },
        // p2 owns lake group
        { tileIndex: 6, ownerId: "p2", houses: 0, isMortaged: false },
        { tileIndex: 8, ownerId: "p2", houses: 0, isMortaged: false },
        { tileIndex: 9, ownerId: "p2", houses: 0, isMortaged: false },
      ];

      const result = buildProperty(state, "p1", 1);

      // p1 can build on their group
      const property = result.properties.find((p) => p.tileIndex === 1);
      expect(property?.houses).toBe(2);

      // p2's properties unchanged
      const p2Property = result.properties.find((p) => p.tileIndex === 6);
      expect(p2Property?.houses).toBe(0);
    });

    test("verifies exact money deduction for different property groups", () => {
      const state = createGameStateWithProperties();
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 0, isMortaged: false },
      ];
      state.players[0]!.money = 100;

      const result = buildProperty(state, "p1", 1);

      // Terai group house cost is 12
      expect(result.players[0]!.money).toBe(88);
    });

    test("handles building third house in 3-property group with uniform constraint", () => {
      const state = createGameStateWithProperties();
      // Lake group properties all at 1 house, building on one makes it 2
      state.properties = [
        { tileIndex: 6, ownerId: "p1", houses: 1, isMortaged: false },
        { tileIndex: 8, ownerId: "p1", houses: 1, isMortaged: false },
        { tileIndex: 9, ownerId: "p1", houses: 0, isMortaged: false },
      ];

      // Should allow building on property 9 (0 -> 1)
      const result1 = buildProperty(state, "p1", 9);
      const prop9 = result1.properties.find((p) => p.tileIndex === 9);
      expect(prop9?.houses).toBe(1);

      // Should NOT allow building on property 6 (would be 3 vs 1)
      const result2 = buildProperty(state, "p1", 6);
      expect(result2).toEqual(state);
    });
  });

  describe("concurrent building scenarios", () => {
    test("allows second house after first is built maintaining uniform rule", () => {
      const state = createGameStateWithProperties();
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 0, isMortaged: false },
      ];
      state.players[0]!.money = 100;

      // Build first house on property 1
      const result1 = buildProperty(state, "p1", 1);
      expect(result1.properties.find((p) => p.tileIndex === 1)?.houses).toBe(1);
      expect(result1.players[0]!.money).toBe(88);

      // Build first house on property 3
      const result2 = buildProperty(result1, "p1", 3);
      expect(result2.properties.find((p) => p.tileIndex === 3)?.houses).toBe(1);
      expect(result2.players[0]!.money).toBe(76);

      // Build second house on property 1
      const result3 = buildProperty(result2, "p1", 1);
      expect(result3.properties.find((p) => p.tileIndex === 1)?.houses).toBe(2);
      expect(result3.players[0]!.money).toBe(64);
    });
  });

  describe("error handling", () => {
    test("handles invalid player ID gracefully", () => {
      const state = createGameStateWithProperties();
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 0, isMortaged: false },
      ];

      const result = buildProperty(state, "invalid-player", 1);

      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });

    test("handles invalid tile index gracefully", () => {
      const state = createGameStateWithProperties();
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 0, isMortaged: false },
      ];

      const result = buildProperty(state, "p1", 999);

      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });
  });
});
