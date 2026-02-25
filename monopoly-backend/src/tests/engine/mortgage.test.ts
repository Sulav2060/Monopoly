import { mortgageProperty } from "../../engine/mortgage";
import { unmortgageProperty } from "../../engine/unmortgage";
import { payRent } from "../../engine/payRent";
import { GameState } from "../../types/game";
import { PropertyTile } from "../../types/board";

describe("mortgageProperty", () => {
  // Helper function to create a base game state
  function createGameState(): GameState {
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
          debtResolution: undefined,
        },
        {
          id: "p2",
          name: "Bob",
          position: 5,
          money: 1500,
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
  }

  describe("successful mortgage", () => {
    test("mortgages property with no houses", () => {
      const state = createGameState();
      // Property at tileIndex 1 has price 60 (from board.ts)
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: false },
      ];

      const result = mortgageProperty(state, 1);

      // Check property is mortgaged
      const property = result.properties.find((p) => p.tileIndex === 1);
      expect(property?.isMortaged).toBe(true);

      // Check mortgage value = price / 2 = 60 / 2 = 30
      expect(result.players[0]!.money).toBe(1530); // 1500 + 30

      // Check event was added
      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toEqual({
        type: "PROPERTY_MORTGAGED",
        playerId: "p1",
        tileIndex: 1,
        amount: 30,
      });
    });

    test("calculates correct mortgage value for different property prices", () => {
      const state = createGameState();
      // Property at tileIndex 6 has price 100
      state.properties = [
        { tileIndex: 6, ownerId: "p1", houses: 0, isMortaged: false },
      ];

      const result = mortgageProperty(state, 6);

      // mortgage value = 100 / 2 = 50
      expect(result.players[0]!.money).toBe(1550); // 1500 + 50
      expect(result.events[0]).toMatchObject({
        amount: 50,
      });
    });

    test("calculates correct mortgage value for expensive property", () => {
      const state = createGameState();
      // Property at tileIndex 37 has price 350
      state.properties = [
        { tileIndex: 37, ownerId: "p1", houses: 0, isMortaged: false },
      ];

      const result = mortgageProperty(state, 37);

      // mortgage value = 350 / 2 = 175
      expect(result.players[0]!.money).toBe(1675); // 1500 + 175
      expect(result.events[0]).toMatchObject({
        amount: 175,
      });
    });
  });

  describe("validation failures", () => {
    test("returns state unchanged if property is not owned", () => {
      const state = createGameState();
      state.properties = []; // No ownership

      const result = mortgageProperty(state, 1);

      // State should remain unchanged
      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });

    test("returns state unchanged if player does not own the property", () => {
      const state = createGameState();
      state.properties = [
        { tileIndex: 1, ownerId: "p2", houses: 0, isMortaged: false }, // Owned by p2
      ];

      const result = mortgageProperty(state, 1);

      // State should remain unchanged
      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });

    test("returns state unchanged if property is already mortgaged", () => {
      const state = createGameState();
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: true }, // Already mortgaged
      ];

      const result = mortgageProperty(state, 1);

      // State should remain unchanged
      expect(result).toEqual(state);
      expect(result.players[0]!.money).toBe(1500); // No money added
      expect(result.events).toHaveLength(0);
    });

    test("returns state unchanged if property has 1 house", () => {
      const state = createGameState();
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 1, isMortaged: false },
      ];

      const result = mortgageProperty(state, 1);

      // State should remain unchanged
      expect(result).toEqual(state);
      expect(result.properties[0]!.isMortaged).toBe(false);
      expect(result.events).toHaveLength(0);
    });

    test("returns state unchanged if property has multiple houses", () => {
      const state = createGameState();
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 3, isMortaged: false },
      ];

      const result = mortgageProperty(state, 1);

      expect(result).toEqual(state);
      expect(result.properties[0]!.isMortaged).toBe(false);
    });

    test("returns state unchanged if property has a hotel", () => {
      const state = createGameState();
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 5, isMortaged: false }, // 5 = hotel
      ];

      const result = mortgageProperty(state, 1);

      expect(result).toEqual(state);
      expect(result.properties[0]!.isMortaged).toBe(false);
    });
  });
});

describe("unmortgageProperty", () => {
  // Helper function to create a base game state
  function createGameState(): GameState {
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
          debtResolution: undefined,
        },
        {
          id: "p2",
          name: "Bob",
          position: 5,
          money: 1500,
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
  }

  describe("successful unmortgage", () => {
    test("unmortgages a mortgaged property", () => {
      const state = createGameState();
      // Property at tileIndex 1 has price 60
      // Mortgage value = 30, unmortgage cost = 30 * 1.1 = 33
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: true },
      ];

      const result = unmortgageProperty(state, 1);

      // Check property is unmortgaged
      const property = result.properties.find((p) => p.tileIndex === 1);
      expect(property?.isMortaged).toBe(false);

      // Check unmortgage cost = (price / 2) * 1.1 = 30 * 1.1 = 33
      expect(result.players[0]!.money).toBe(1467); // 1500 - 33

      // Check event was added
      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toEqual({
        type: "PROPERTY_UNMORTGAGED",
        playerId: "p1",
        tileIndex: 1,
        amount: 33,
      });
    });

    test("calculates correct unmortgage cost for different property prices", () => {
      const state = createGameState();
      // Property at tileIndex 6 has price 100
      // Mortgage value = 50, unmortgage cost = 50 * 1.1 = 55
      state.properties = [
        { tileIndex: 6, ownerId: "p1", houses: 0, isMortaged: true },
      ];

      const result = unmortgageProperty(state, 6);

      expect(result.players[0]!.money).toBe(1445); // 1500 - 55
      expect(result.events[0]).toMatchObject({
        amount: 55,
      });
    });

    test("calculates correct unmortgage cost for expensive property", () => {
      const state = createGameState();
      // Property at tileIndex 37 has price 350
      // Mortgage value = 175, unmortgage cost = 175 * 1.1 = 192 (rounded down)
      state.properties = [
        { tileIndex: 37, ownerId: "p1", houses: 0, isMortaged: true },
      ];

      const result = unmortgageProperty(state, 37);

      expect(result.players[0]!.money).toBe(1308); // 1500 - 192
      expect(result.events[0]).toMatchObject({
        amount: 192,
      });
    });

    test("unmortgages when player has exact amount needed", () => {
      const state = createGameState();
      state.players[0]!.money = 33; // Exact amount for tileIndex 1
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: true },
      ];

      const result = unmortgageProperty(state, 1);

      expect(result.players[0]!.money).toBe(0); // 33 - 33
      expect(result.properties[0]!.isMortaged).toBe(false);
    });
  });

  describe("validation failures", () => {
    test("returns state unchanged if property is not owned", () => {
      const state = createGameState();
      state.properties = []; // No ownership

      const result = unmortgageProperty(state, 1);

      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });

    test("returns state unchanged if player does not own the property", () => {
      const state = createGameState();
      state.properties = [
        { tileIndex: 1, ownerId: "p2", houses: 0, isMortaged: true }, // Owned by p2
      ];

      const result = unmortgageProperty(state, 1);

      expect(result).toEqual(state);
      expect(result.events).toHaveLength(0);
    });

    test("returns state unchanged if property is not mortgaged", () => {
      const state = createGameState();
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: false }, // Not mortgaged
      ];

      const result = unmortgageProperty(state, 1);

      expect(result).toEqual(state);
      expect(result.players[0]!.money).toBe(1500); // No money deducted
      expect(result.events).toHaveLength(0);
    });

    test("returns state unchanged if player has insufficient money", () => {
      const state = createGameState();
      state.players[0]!.money = 20; // Less than the 33 needed
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: true },
      ];

      const result = unmortgageProperty(state, 1);

      expect(result).toEqual(state);
      expect(result.players[0]!.money).toBe(20); // Money unchanged
      expect(result.properties[0]!.isMortaged).toBe(true); // Still mortgaged
      expect(result.events).toHaveLength(0);
    });

    test("returns state unchanged if player has one dollar less than needed", () => {
      const state = createGameState();
      state.players[0]!.money = 32; // One less than the 33 needed
      state.properties = [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: true },
      ];

      const result = unmortgageProperty(state, 1);

      expect(result.properties[0]!.isMortaged).toBe(true);
      expect(result.players[0]!.money).toBe(32);
    });
  });
});

describe("mortgage integration with rent", () => {
  function createGameState(): GameState {
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
          debtResolution: undefined,
        },
        {
          id: "p2",
          name: "Bob",
          position: 5,
          money: 1500,
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
  }

  const testProperty: PropertyTile = {
    type: "PROPERTY",
    id: "mediterranean_ave",
    name: "Mediterranean Avenue",
    price: 60,
    tileIndex: 1,
    baseRent: 2,
    group: "terai",
    houseRent: [10, 30, 90, 160],
    hotelRent: 250,
    houseBuildCost: 12,
  };

  test("mortgaged property does not collect rent", () => {
    const state = createGameState();
    state.properties = [
      { tileIndex: 1, ownerId: "p2", houses: 0, isMortaged: true }, // Mortgaged
    ];

    const result = payRent(state, testProperty);

    // No rent should be paid
    expect(result.players[0]!.money).toBe(1500); // p1 money unchanged
    expect(result.players[1]!.money).toBe(1500); // p2 money unchanged
    expect(result.events).toHaveLength(0); // No rent event
  });

  test("unmortgaged property collects rent normally", () => {
    const state = createGameState();
    state.properties = [
      { tileIndex: 1, ownerId: "p2", houses: 0, isMortaged: false }, // Not mortgaged
    ];

    const result = payRent(state, testProperty);

    // Rent should be paid (baseRent = 2)
    expect(result.players[0]!.money).toBe(1498); // p1 pays 2
    expect(result.players[1]!.money).toBe(1502); // p2 receives 2
    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toEqual({
      type: "RENT_PAID",
      from: "p1",
      to: "p2",
      amount: 2,
    });
  });

  test("mortgaged property with houses does not collect rent", () => {
    const state = createGameState();
    state.properties = [
      { tileIndex: 1, ownerId: "p2", houses: 2, isMortaged: true }, // Mortgaged with houses
    ];

    const result = payRent(state, testProperty);

    // No rent should be paid even though it has houses
    expect(result.players[0]!.money).toBe(1500);
    expect(result.players[1]!.money).toBe(1500);
    expect(result.events).toHaveLength(0);
  });
});

describe("mortgage and unmortgage workflow", () => {
  function createGameState(): GameState {
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
          debtResolution: undefined,
        },
        {
          id: "p2",
          name: "Bob",
          position: 5,
          money: 1500,
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
  }

  test("complete mortgage and unmortgage cycle", () => {
    const state = createGameState();
    state.properties = [
      { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: false },
    ];

    // Mortgage the property
    const mortgagedState = mortgageProperty(state, 1);
    expect(mortgagedState.players[0]!.money).toBe(1530); // +30
    expect(mortgagedState.properties[0]!.isMortaged).toBe(true);

    // Unmortgage the property
    const unmortgagedState = unmortgageProperty(mortgagedState, 1);
    expect(unmortgagedState.players[0]!.money).toBe(1497); // 1530 - 33
    expect(unmortgagedState.properties[0]!.isMortaged).toBe(false);

    // Net loss = 3 (interest on the mortgage)
    expect(unmortgagedState.players[0]!.money).toBe(1497);
  });

  test("player loses money in mortgage cycle due to 10% interest", () => {
    const state = createGameState();
    // Property at tileIndex 6 has price 100
    state.properties = [
      { tileIndex: 6, ownerId: "p1", houses: 0, isMortaged: false },
    ];

    const initialMoney = state.players[0]!.money;

    // Mortgage: get 50
    const mortgagedState = mortgageProperty(state, 6);
    expect(mortgagedState.players[0]!.money).toBe(initialMoney + 50);

    // Unmortgage: pay 55
    const unmortgagedState = unmortgageProperty(mortgagedState, 6);
    expect(unmortgagedState.players[0]!.money).toBe(initialMoney - 5); // Net loss of 5

    // Interest paid = 5 (10% of 50)
  });
});
