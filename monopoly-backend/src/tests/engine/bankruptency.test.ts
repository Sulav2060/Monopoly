import { payRent } from "../../engine/payRent";
import { GameState } from "../../types/game";
import { PropertyTile } from "../../types/board";
import { BOARD } from "../../engine/board";
import { endTurn } from "../../engine/endTurn";
import { bankruptPlayer } from "../../engine/bankruptPlayer";
import {
  enterDebtResolution,
  afterAssetChange,
  canRecover,
  settleDebt,
} from "../../engine/debtResolution";

test("skips bankrupt players when ending turn", () => {
  const state: GameState = {
    communityChestDeck: [],
    communityChestIndex: 0,
    pendingTrades: [],
    players: [
      {
        id: "p1",
        name: "A",
        position: 0,
        money: 500,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
        debtResolution: undefined,
      },
      {
        id: "p2",
        name: "B",
        position: 0,
        money: 0,
        inJail: false,
        jailTurns: 0,
        isBankrupt: true, // 👈 should be skipped
        debtResolution: undefined,
      },
      {
        id: "p3",
        name: "C",
        position: 0,
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
    pendingAction: null,
  };

  const result = endTurn(state);

  expect(result.currentTurnIndex).toBe(2);
  expect(result.events[0]).toEqual({
    type: "TURN_ENDED",
    nextPlayerId: "p3",
  });
});

describe("voluntary bankruptcy", () => {
  test("player can declare bankruptcy voluntarily", () => {
    const state: GameState = {
      communityChestDeck: [],
      communityChestIndex: 0,
      players: [
        {
          id: "p1",
          name: "Alice",
          position: 1,
          money: 100,
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
      properties: [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false,
        },
      ],
      events: [],
      pendingAction: null,
      pendingTrades: [],
      voteout: null,
    };

    const result = bankruptPlayer(state, "p1");

    const p1 = result.players.find((p) => p.id === "p1")!;
    expect(p1.isBankrupt).toBe(true);
    expect(p1.money).toBe(0);

    // Properties should be removed
    expect(result.properties.length).toBe(0);

    //STODO: recheck this
    // Event should be added
    console.log("result.events", result.events);
    expect(result.events).toContainEqual({
      playerId: "p1",
      type: "PLAYER_BANKRUPT",
    });
    expect(result.events).toContainEqual({ type: "GAME_OVER", winnerId: "p2" });
  });

  test("voluntary bankruptcy triggers game over when only one player remains", () => {
    const state: GameState = {
      communityChestDeck: [],
      communityChestIndex: 0,
      players: [
        {
          id: "p1",
          name: "Alice",
          position: 1,
          money: 50,
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
      properties: [],
      events: [],
      pendingAction: null,
      pendingTrades: [],
      voteout: null,
    };

    const result = bankruptPlayer(state, "p1");

    // Check bankruptcy event
    expect(result.events).toContainEqual({
      type: "PLAYER_BANKRUPT",
      playerId: "p1",
      // causedBy: "",
    });

    // Check game over event
    expect(result.events).toContainEqual({
      type: "GAME_OVER",
      winnerId: "p2",
    });
  });

  test("voluntary bankruptcy with properties - all properties are released", () => {
    const state: GameState = {
      communityChestDeck: [],
      communityChestIndex: 0,
      players: [
        {
          id: "p1",
          name: "Alice",
          position: 1,
          money: 200,
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
        {
          id: "p3",
          name: "Charlie",
          position: 10,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      properties: [
        { tileIndex: 1, ownerId: "p1", houses: 2, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 1, isMortaged: false },
        { tileIndex: 6, ownerId: "p2", houses: 0, isMortaged: false },
        { tileIndex: 8, ownerId: "p1", houses: 0, isMortaged: true },
      ],
      events: [],
      pendingAction: null,
      pendingTrades: [],
    };

    const result = bankruptPlayer(state, "p1");

    // All p1's properties should be removed
    expect(result.properties).toEqual([
      { tileIndex: 6, ownerId: "p2", houses: 0, isMortaged: false },
    ]);

    // p1 should be bankrupt
    const p1 = result.players.find((p) => p.id === "p1")!;
    expect(p1.isBankrupt).toBe(true);
    expect(p1.money).toBe(0);

    // Other players unchanged (no causedBy, so no money transfer)
    const p2 = result.players.find((p) => p.id === "p2")!;
    expect(p2.money).toBe(1500);
  });

  test("voluntary bankruptcy does not transfer money to anyone", () => {
    const state: GameState = {
      communityChestDeck: [],
      communityChestIndex: 0,
      players: [
        {
          id: "p1",
          name: "Alice",
          position: 1,
          money: 250,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
        {
          id: "p2",
          name: "Bob",
          position: 5,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      properties: [],
      events: [],
      pendingAction: null,
      pendingTrades: [],
      voteout: null,
    };

    const result = bankruptPlayer(state, "p1");

    // p1's money should be lost (set to 0)
    const p1 = result.players.find((p) => p.id === "p1")!;
    expect(p1.money).toBe(0);

    // p2's money should remain unchanged
    const p2 = result.players.find((p) => p.id === "p2")!;
    expect(p2.money).toBe(1000);
  });
});

describe("debt resolution and bankruptcy", () => {
  test("player enters debt resolution state when owing money", () => {
    const state: GameState = {
      communityChestDeck: [],
      communityChestIndex: 0,
      players: [
        {
          id: "p1",
          name: "Alice",
          position: 1,
          money: 100,
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
      properties: [],
      events: [],
      pendingAction: null,
      pendingTrades: [],
      voteout: null,
    };

    const result = enterDebtResolution(state, "p1", 500, "p2");

    const p1 = result.players.find((p) => p.id === "p1")!;
    expect(p1.debtResolution).toBeDefined();
    expect(p1.debtResolution?.amount).toBe(500);
    expect(p1.debtResolution?.creditorId).toBe("p2");

    expect(result.events).toContainEqual({
      type: "DEBT_RESOLUTION_ENTERED",
      playerId: "p1",
      amount: 500,
      creditorId: "p2",
    });
  });

  test("player settles debt when they have enough money", () => {
    const state: GameState = {
      communityChestDeck: [],
      communityChestIndex: 0,
      players: [
        {
          id: "p1",
          name: "Alice",
          position: 1,
          money: 500,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: {
            type: "DEBT_RESOLUTION",
            amount: 300,
            creditorId: "p2",
          },
        },
        {
          id: "p2",
          name: "Bob",
          position: 5,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      properties: [],
      events: [],
      pendingAction: null,
      pendingTrades: [],
      voteout: null,
    };

    const result = settleDebt(state, "p1");

    const p1 = result.players.find((p) => p.id === "p1")!;
    const p2 = result.players.find((p) => p.id === "p2")!;

    // p1 money should be reduced by debt amount
    expect(p1.money).toBe(200);
    // debt resolution state should be removed
    expect(p1.debtResolution).toBeUndefined();

    // p2 should receive the payment
    expect(p2.money).toBe(1300);

    // Events should include RENT_PAID and DEBT_RESOLVED
    expect(result.events).toContainEqual({
      type: "RENT_PAID",
      from: "p1",
      to: "p2",
      amount: 300,
    });

    expect(result.events).toContainEqual({
      type: "DEBT_RESOLVED",
      playerId: "p1",
      amount: 300,
      creditorId: "p2",
    });
  });

  test("player goes bankrupt when debt is unrecoverable (no unmortgaged properties)", () => {
    const state: GameState = {
      communityChestDeck: [],
      communityChestIndex: 0,
      players: [
        {
          id: "p1",
          name: "Alice",
          position: 1,
          money: -100, // negative money - can't recover
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: {
            type: "DEBT_RESOLUTION",
            amount: 500,
            creditorId: "p2",
          },
        },
        {
          id: "p2",
          name: "Bob",
          position: 5,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
        {
          id: "p3",
          name: "Charlie",
          position: 10,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      properties: [
        // p1 has no properties - can't recover
      ],
      events: [],
      pendingAction: null,
      pendingTrades: [],
    };

    const result = afterAssetChange(state);

    const p1 = result.players.find((p) => p.id === "p1")!;
    const p2 = result.players.find((p) => p.id === "p2")!;
    const p3 = result.players.find((p) => p.id === "p3")!;

    // p1 should be bankrupt
    expect(p1.isBankrupt).toBe(true);
    expect(p1.money).toBe(0);

    // p2 should receive remaining money from p1
    expect(p2.money).toBe(1000); // No money to transfer since p1 had -100

    // p3's money should be unchanged
    expect(p3.money).toBe(1000);

    // Should emit PLAYER_BANKRUPT event with creditor
    expect(result.events).toContainEqual({
      type: "PLAYER_BANKRUPT",
      playerId: "p1",
      causedBy: "p2",
    });

    // Turn should be ended (moved to p2)
    expect(result.currentTurnIndex).toBe(1);
    expect(result.events).toContainEqual({
      type: "TURN_ENDED",
      nextPlayerId: "p2",
    });
  });

  test("player stays in debt resolution when they have unmortgaged properties", () => {
    const state: GameState = {
      communityChestDeck: [],
      communityChestIndex: 0,
      players: [
        {
          id: "p1",
          name: "Alice",
          position: 1,
          money: -100, // negative money momentarily
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: {
            type: "DEBT_RESOLUTION",
            amount: 500,
            creditorId: "p2",
          },
        },
        {
          id: "p2",
          name: "Bob",
          position: 5,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      properties: [
        {
          tileIndex: 1,
          ownerId: "p1",
          houses: 0,
          isMortaged: false, // unmortgaged - can recover
        },
      ],
      events: [],
      pendingAction: null,
      pendingTrades: [],
      voteout: null,
    };

    const result = afterAssetChange(state);

    const p1 = result.players.find((p) => p.id === "p1")!;

    // p1 should NOT be bankrupt
    expect(p1.isBankrupt).toBe(false);

    // p1 should still be in debt resolution (can potentially recover)
    expect(p1.debtResolution).toBeDefined();
    expect(p1.debtResolution?.amount).toBe(500);

    // No bankruptcy event should be emitted
    expect(result.events).not.toContainEqual(
      expect.objectContaining({ type: "PLAYER_BANKRUPT" }),
    );

    // Turn should not have ended
    expect(result.currentTurnIndex).toBe(0);
  });

  test("canRecover returns true when player has unmortgaged properties", () => {
    const state: GameState = {
      communityChestDeck: [],
      communityChestIndex: 0,
      players: [
        {
          id: "p1",
          name: "Alice",
          position: 1,
          money: 100,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      properties: [
        { tileIndex: 1, ownerId: "p1", houses: 2, isMortaged: false },
        { tileIndex: 3, ownerId: "p1", houses: 0, isMortaged: true },
      ],
      events: [],
      pendingAction: null,
      pendingTrades: [],
      voteout: null,
    };

    expect(canRecover(state, "p1")).toBe(true);
  });

  test("canRecover returns false when player has only mortgaged properties", () => {
    const state: GameState = {
      communityChestDeck: [],
      communityChestIndex: 0,
      players: [
        {
          id: "p1",
          name: "Alice",
          position: 1,
          money: 100,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      properties: [
        { tileIndex: 1, ownerId: "p1", houses: 0, isMortaged: true },
        { tileIndex: 3, ownerId: "p1", houses: 0, isMortaged: true },
      ],
      events: [],
      pendingAction: null,
      pendingTrades: [],
      voteout: null,
    };

    expect(canRecover(state, "p1")).toBe(false);
  });

  test("canRecover returns false when player has no properties", () => {
    const state: GameState = {
      communityChestDeck: [],
      communityChestIndex: 0,
      players: [
        {
          id: "p1",
          name: "Alice",
          position: 1,
          money: 100,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      properties: [],
      events: [],
      pendingAction: null,
      pendingTrades: [],
    };

    expect(canRecover(state, "p1")).toBe(false);
  });

  test("bankrupt player ceases turn immediately after being declared bankrupt", () => {
    const state: GameState = {
      communityChestDeck: [],
      communityChestIndex: 0,
      players: [
        {
          id: "p1",
          name: "Alice",
          position: 1,
          money: -100,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: {
            type: "DEBT_RESOLUTION",
            amount: 500,
            creditorId: "p2",
          },
        },
        {
          id: "p2",
          name: "Bob",
          position: 5,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
        {
          id: "p3",
          name: "Charlie",
          position: 10,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0, // p1's turn
      properties: [],
      events: [],
      pendingAction: null,
      pendingTrades: [],
      voteout: null,
    };

    const result = afterAssetChange(state);

    // Verify p1 is bankrupt
    const p1 = result.players.find((p) => p.id === "p1")!;
    expect(p1.isBankrupt).toBe(true);

    // Verify turn has moved to p2 (next non-bankrupt player)
    expect(result.currentTurnIndex).toBe(1);
    expect(result.events).toContainEqual({
      type: "TURN_ENDED",
      nextPlayerId: "p2",
    });
  });

  test("bankruptcy transfers money to creditor when player still has funds", () => {
    const state: GameState = {
      communityChestDeck: [],
      communityChestIndex: 0,
      players: [
        {
          id: "p1",
          name: "Alice",
          position: 1,
          money: 150, // Has some money
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
        {
          id: "p2",
          name: "Bob",
          position: 5,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      properties: [],
      events: [],
      pendingAction: null,
      pendingTrades: [],
      voteout: null,
    };

    const result = bankruptPlayer(state, "p1", "p2");

    const p1 = result.players.find((p) => p.id === "p1")!;
    const p2 = result.players.find((p) => p.id === "p2")!;

    // p1 should lose all money
    expect(p1.money).toBe(0);
    expect(p1.isBankrupt).toBe(true);

    // p2 should receive remaining money
    expect(p2.money).toBe(1150);
  });
});
