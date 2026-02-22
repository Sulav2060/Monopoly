import { payRent } from "../../engine/payRent";
import { createBaseState } from "../helpers/gameState";
import { testProperty } from "../helpers/tiles";

describe("payRent", () => {
  describe("basic validations", () => {
    test("does nothing if property has no owner", () => {
      const state = createBaseState();
      state.properties = [];

      const result = payRent(state, testProperty);

      expect(result).toEqual(state);
    });

    test("does nothing if player owns the property", () => {
      const state = createBaseState();
      if (!state.properties[0]) {
        console.log("no state found");
        return;
      }
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
      ];

      const result = payRent(state, testProperty);

      expect(result).toEqual(state);
    });
  });

  describe("rent calculation based on houses", () => {
    test("charges base rent when property has 0 houses", () => {
      const state = createBaseState();
      // testProperty has baseRent: 50
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p2",
          houses: 0,
          isMortaged: false,
        },
      ];

      const result = payRent(state, testProperty);

      expect(result.players[0]!.money).toBe(1450); // 1500 - 50
      expect(result.players[1]!.money).toBe(1550); // 1500 + 50
      expect(result.events[0]).toEqual({
        type: "RENT_PAID",
        from: "p1",
        to: "p2",
        amount: 50,
      });
    });

    test("charges correct rent with 1 house", () => {
      const state = createBaseState();
      // testProperty houseRent: [10, 30, 90, 160], so 1 house = 10
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p2",
          houses: 1,
          isMortaged: false,
        },
      ];

      const result = payRent(state, testProperty);

      expect(result.players[0]!.money).toBe(1490); // 1500 - 10
      expect(result.players[1]!.money).toBe(1510); // 1500 + 10
      expect(result.events[0]).toEqual({
        type: "RENT_PAID",
        from: "p1",
        to: "p2",
        amount: 10,
      });
    });

    test("charges correct rent with 2 houses", () => {
      const state = createBaseState();
      // testProperty houseRent: [10, 30, 90, 160], so 2 houses = 30
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p2",
          houses: 2,
          isMortaged: false,
        },
      ];

      const result = payRent(state, testProperty);

      expect(result.players[0]!.money).toBe(1470); // 1500 - 30
      expect(result.players[1]!.money).toBe(1530); // 1500 + 30
      expect(result.events[0]).toEqual({
        type: "RENT_PAID",
        from: "p1",
        to: "p2",
        amount: 30,
      });
    });

    test("charges correct rent with 3 houses", () => {
      const state = createBaseState();
      // testProperty houseRent: [10, 30, 90, 160], so 3 houses = 90
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p2",
          houses: 3,
          isMortaged: false,
        },
      ];

      const result = payRent(state, testProperty);

      expect(result.players[0]!.money).toBe(1410); // 1500 - 90
      expect(result.players[1]!.money).toBe(1590); // 1500 + 90
      expect(result.events[0]).toEqual({
        type: "RENT_PAID",
        from: "p1",
        to: "p2",
        amount: 90,
      });
    });

    test("charges correct rent with 4 houses", () => {
      const state = createBaseState();
      // testProperty houseRent: [10, 30, 90, 160], so 4 houses = 160
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p2",
          houses: 4,
          isMortaged: false,
        },
      ];

      const result = payRent(state, testProperty);

      expect(result.players[0]!.money).toBe(1340); // 1500 - 160
      expect(result.players[1]!.money).toBe(1660); // 1500 + 160
      expect(result.events[0]).toEqual({
        type: "RENT_PAID",
        from: "p1",
        to: "p2",
        amount: 160,
      });
    });

    test("charges hotel rent when property has 5 houses (hotel)", () => {
      const state = createBaseState();
      // testProperty hotelRent: 250
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p2",
          houses: 5,
          isMortaged: false,
        },
      ];

      const result = payRent(state, testProperty);

      expect(result.players[0]!.money).toBe(1250); // 1500 - 250
      expect(result.players[1]!.money).toBe(1750); // 1500 + 250
      expect(result.events[0]).toEqual({
        type: "RENT_PAID",
        from: "p1",
        to: "p2",
        amount: 250,
      });
    });
  });

  describe("rent transfer mechanics", () => {
    test("transfers rent from player to owner", () => {
      const state = createBaseState();

      const result = payRent(state, testProperty);

      expect(result.players[0]!.money).toBe(1450);
      expect(result.players[1]!.money).toBe(1550);
    });

    test("adds RENT_PAID event", () => {
      const state = createBaseState();

      const result = payRent(state, testProperty);

      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toEqual({
        type: "RENT_PAID",
        from: "p1",
        to: "p2",
        amount: 50,
      });
    });

    test("adds RENT_PAID event with correct amount for houses", () => {
      const state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p2",
          houses: 3,
          isMortaged: false,
        },
      ];

      const result = payRent(state, testProperty);

      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toEqual({
        type: "RENT_PAID",
        from: "p1",
        to: "p2",
        amount: 90, // 3 houses
      });
    });
  });

  describe("state immutability", () => {
    test("does not mutate original state", () => {
      const state = createBaseState();

      payRent(state, testProperty);

      expect(state.players[0]!.money).toBe(1500);
      expect(state.players[1]!.money).toBe(1500);
      expect(state.events).toHaveLength(0);
    });

    test("does not mutate original state with houses", () => {
      const state = createBaseState();
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p2",
          houses: 4,
          isMortaged: false,
        },
      ];

      payRent(state, testProperty);

      expect(state.players[0]!.money).toBe(1500);
      expect(state.players[1]!.money).toBe(1500);
      expect(state.events).toHaveLength(0);
    });
  });

  describe("edge cases", () => {
    test("handles high rent values that require significant money transfer", () => {
      const state = createBaseState();
      state.players[0]!.money = 300; // Just enough for hotel rent
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p2",
          houses: 5, // hotel: 250 rent
          isMortaged: false,
        },
      ];

      const result = payRent(state, testProperty);

      expect(result.players[0]!.money).toBe(50); // 300 - 250
      expect(result.players[1]!.money).toBe(1750); // 1500 + 250
    });

    test("correctly identifies owner and payer in rent transaction", () => {
      const state = createBaseState();
      state.currentTurnIndex = 0; // p1's turn
      state.properties = [
        {
          tileIndex: 1,
          ownerId: "p2",
          houses: 2,
          isMortaged: false,
        },
      ];

      const result = payRent(state, testProperty);

      // Verify correct player pays and correct owner receives
      expect(result.events[0]).toEqual({
        type: "RENT_PAID",
        from: "p1",
        to: "p2",
        amount: 30,
      });
    });
  });
});
