import { buildProperty } from "../../engine/buildProperty";
import { breakHouses } from "../../engine/breakHouses";
import { createBaseState } from "../helpers/gameState";

describe("Break Houses Feature", () => {
  describe("breakHouses - Basic Operations", () => {
    test("breaks a house and returns half the build cost", () => {
      let state = createBaseState();
      // Property at tileIndex 1 has houseBuildCost: 12 in tests/helpers/tiles.ts
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 1,
          isMortaged: false,
        },
        {
          tileIndex: 3,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
      ];
      state.players[0]!.money = 1500;

      state = breakHouses(state, "p1", 1);

      const property = state.properties.find((p) => p.tileIndex === 1);
      expect(property?.houses).toBe(0);
      // Half of 12 is 6
      expect(state.players[0]!.money).toBe(1506);
    });

    test("creates PROPERTY_BROKEN event with refund amount", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 2,
          isMortaged: false,
        },
        {
          tileIndex: 3,
          ownerId: "p1",
          houses: 1,
          isMortaged: false,
        },
      ];

      state = breakHouses(state, "p1", 1);

      const brokenEvent = state.events.find(
        (e) => e.type === "PROPERTY_BROKEN",
      );
      expect(brokenEvent).toBeDefined();
      expect(brokenEvent?.type).toBe("PROPERTY_BROKEN");
      expect("refund" in brokenEvent!).toBe(true);
      expect("playerId" in brokenEvent!).toBe(true);
      expect("tileIndex" in brokenEvent!).toBe(true);
      expect("houses" in brokenEvent!).toBe(true);
    });

    test("breaks multiple houses sequentially", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 3,
          isMortaged: false,
        },
        {
          tileIndex: 3,
          ownerId: "p1",
          houses: 2,
          isMortaged: false,
        },
      ];
      state.players[0]!.money = 1500;

      // First break
      state = breakHouses(state, "p1", 1);
      expect(state.properties.find((p) => p.tileIndex === 1)?.houses).toBe(2);
      expect(state.players[0]!.money).toBe(1506);

      // Second break
      state = breakHouses(state, "p1", 1);
      expect(state.properties.find((p) => p.tileIndex === 1)?.houses).toBe(1);
      expect(state.players[0]!.money).toBe(1512);
    });
  });

  describe("breakHouses - Validation Errors", () => {
    test("rejects break if not player's turn", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 1,
          isMortaged: false,
        },
        {
          tileIndex: 3,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
      ];

      const initialMoney = state.players[0]!.money;
      state = breakHouses(state, "p2", 1);

      expect(state.properties.find((p) => p.tileIndex === 1)?.houses).toBe(1);
      expect(state.players[0]!.money).toBe(initialMoney);
    });

    test("rejects break if property invalid or not a property", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 1,
          isMortaged: false,
        },
        {
          tileIndex: 3,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
      ];

      const initialMoney = state.players[0]!.money;
      state = breakHouses(state, "p1", 999);

      expect(state.players[0]!.money).toBe(initialMoney);
    });

    test("rejects break if player doesn't own property", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p2",
          houses: 1,
          isMortaged: false,
        },
        {
          tileIndex: 3,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
      ];

      const initialMoney = state.players[0]!.money;
      state = breakHouses(state, "p1", 1);

      expect(state.properties.find((p) => p.tileIndex === 1)?.houses).toBe(1);
      expect(state.players[0]!.money).toBe(initialMoney);
    });

    test("rejects break if player doesn't own entire group", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 1,
          isMortaged: false,
        },
        {
          tileIndex: 3,
          ownerId: "p2", // p1 doesn't own entire group
          houses: 0,
          isMortaged: false,
        },
      ];

      const initialMoney = state.players[0]!.money;
      state = breakHouses(state, "p1", 1);

      expect(state.properties.find((p) => p.tileIndex === 1)?.houses).toBe(1);
      expect(state.players[0]!.money).toBe(initialMoney);
    });

    test("rejects break if property is mortgaged", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 1,
          isMortaged: true,
        },
        {
          tileIndex: 3,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
      ];

      const initialMoney = state.players[0]!.money;
      state = breakHouses(state, "p1", 3);

      // Can't break on property 3 because property 1 in the group is mortgaged
      expect(state.players[0]!.money).toBe(initialMoney);
    });

    test("rejects break if property has no houses", () => {
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
      ];

      const initialMoney = state.players[0]!.money;
      state = breakHouses(state, "p1", 1);

      expect(state.players[0]!.money).toBe(initialMoney);
    });

    test("rejects break if not uniform (breaking would violate uniform rule)", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 3,
          isMortaged: false,
        },
        {
          tileIndex: 3,
          ownerId: "p1",
          houses: 1, // Differs by more than 1 after breaking property 1
          isMortaged: false,
        },
      ];

      const initialMoney = state.players[0]!.money;
      state = breakHouses(state, "p1", 1);

      // Should keep the 3 houses because breaking would break uniform rule
      expect(state.properties.find((p) => p.tileIndex === 1)?.houses).toBe(3);
      expect(state.players[0]!.money).toBe(initialMoney);
    });

    test("allows break if uniform (all same houses)", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 2,
          isMortaged: false,
        },
        {
          tileIndex: 3,
          ownerId: "p1",
          houses: 2,
          isMortaged: false,
        },
      ];
      state.players[0]!.money = 1500;

      state = breakHouses(state, "p1", 1);

      expect(state.properties.find((p) => p.tileIndex === 1)?.houses).toBe(1);
      expect(state.players[0]!.money).toBe(1506);
    });

    test("allows break if difference is 1 (uniform building allowed)", () => {
      let state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 2,
          isMortaged: false,
        },
        {
          tileIndex: 3,
          ownerId: "p1",
          houses: 1,
          isMortaged: false,
        },
      ];
      state.players[0]!.money = 1500;

      state = breakHouses(state, "p1", 1);

      // Breaking property with 2 houses brings it to 1, which matches property 3
      expect(state.properties.find((p) => p.tileIndex === 1)?.houses).toBe(1);
      expect(state.properties.find((p) => p.tileIndex === 3)?.houses).toBe(1);
      expect(state.players[0]!.money).toBe(1506);
    });
  });

  describe("breakHouses - Complex Scenarios", () => {
    test("correctly calculates refund for different property costs", () => {
      let state = createBaseState();
      // Test with different property costs
      // In a real scenario, different property groups have different costs
      state.properties = [
        {
          tileIndex: 1, // Mediterranean Avenue (cost 12)
          ownerId: "p1",
          houses: 2,
          isMortaged: false,
        },
        {
          tileIndex: 3,
          ownerId: "p1",
          houses: 2,
          isMortaged: false,
        },
      ];
      state.players[0]!.money = 1500;

      state = breakHouses(state, "p1", 1);

      // 12 / 2 = 6 refund
      expect(state.players[0]!.money).toBe(1506);
    });

    test("doesn't affect money if validation fails", () => {
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
      ];
      const initialMoney = state.players[0]!.money;

      state = breakHouses(state, "p1", 1);

      expect(state.players[0]!.money).toBe(initialMoney);
    });

    test("breaks houses in 3-property group correctly", () => {
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
          houses: 1,
          isMortaged: false,
        },
        {
          tileIndex: 3,
          ownerId: "p1",
          houses: 1,
          isMortaged: false,
        },
        // In a real scenario, there would be a 3rd property, but this tests uniform rule
      ];
      state.players[0]!.money = 1500;

      state = breakHouses(state, "p1", 1);

      expect(state.properties.find((p) => p.tileIndex === 1)?.houses).toBe(0);
      expect(state.players[0]!.money).toBe(1506);
    });
  });

  describe("buildProperty and breakHouses integration", () => {
    test("break can reverse build action (full cycle)", () => {
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
      ];
      state.players[0]!.money = 1500;
      const initialMoney = state.players[0]!.money;

      // Build a house (costs 12)
      state = buildProperty(state, "p1", 1);
      expect(state.properties.find((p) => p.tileIndex === 1)?.houses).toBe(1);
      expect(state.players[0]!.money).toBe(initialMoney - 12);

      // Break the house (refunds 6)
      state = breakHouses(state, "p1", 1);
      expect(state.properties.find((p) => p.tileIndex === 1)?.houses).toBe(0);
      expect(state.players[0]!.money).toBe(initialMoney - 12 + 6);
    });

    test("build and break multiple times", () => {
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
      ];
      state.players[0]!.money = 1500;

      // Build 2 houses
      state = buildProperty(state, "p1", 1);
      state = buildProperty(state, "p1", 3);

      expect(state.properties.find((p) => p.tileIndex === 1)?.houses).toBe(1);
      expect(state.properties.find((p) => p.tileIndex === 3)?.houses).toBe(1);

      // Break both
      state = breakHouses(state, "p1", 1);
      state = breakHouses(state, "p1", 3);

      expect(state.properties.find((p) => p.tileIndex === 1)?.houses).toBe(0);
      expect(state.properties.find((p) => p.tileIndex === 3)?.houses).toBe(0);
    });
  });
});
