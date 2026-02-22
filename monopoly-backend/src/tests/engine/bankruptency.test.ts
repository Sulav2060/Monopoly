import { payRent } from "../../engine/payRent";
import { GameState } from "../../types/game";
import { PropertyTile } from "../../types/board";
import { BOARD } from "../../engine/board";
import { endTurn } from "../../engine/endTurn";
import { bankruptPlayer } from "../../engine/bankruptPlayer";

test("player goes bankrupt if cannot pay rent", () => {
  const state: GameState = {
    communityChestDeck: [],
    communityChestIndex: 0,
    players: [
      {
        id: "p1",
        name: "A",
        position: 1,
        money: 15,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      },
      {
        id: "p2",
        name: "B",
        position: 5,
        money: 1500,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      },
    ],
    currentTurnIndex: 0, // p1's turn
    properties: [
      {
        tileIndex: 5,
        ownerId: "p2",
        houses: 0,
        isMortaged: false,
      },
    ],
    events: [],
    pendingAction: null,
  };

  const tile = BOARD[5] as PropertyTile;

  const result = payRent(state, tile);
  console.log("Resulting State:", result);

  const p1 = result.players.find((p) => p.id === "p1")!;
  const p2 = result.players.find((p) => p.id === "p2")!;

  expect(p1.isBankrupt).toBe(true);
  expect(p1.money).toBe(0);

  expect(p2.money).toBe(1515);

  expect(result.events).toContainEqual({
    type: "PLAYER_BANKRUPT",
    playerId: "p1",
    causedBy: "p2",
  });
});
test("skips bankrupt players when ending turn", () => {
  const state: GameState = {
    communityChestDeck: [],
    communityChestIndex: 0,
    players: [
      {
        id: "p1",
        name: "A",
        position: 0,
        money: 500,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      },
      {
        id: "p2",
        name: "B",
        position: 0,
        money: 0,
        inJail: false,
        jailTurns: 0,
        isBankrupt: true, // 👈 should be skipped
      },
      {
        id: "p3",
        name: "C",
        position: 0,
        money: 500,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
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
    };

    const result = bankruptPlayer(state, "p1");

    const p1 = result.players.find((p) => p.id === "p1")!;
    expect(p1.isBankrupt).toBe(true);
    expect(p1.money).toBe(0);

    // Properties should be removed
    expect(result.properties.length).toBe(0);
    
    //STODO: recheck this 
    // Event should be added
    expect(result.events).toContainEqual([
      { playerId: "p1", type: "PLAYER_BANKRUPT",causedBy:"" },
      { type: "GAME_OVER", winnerId: "p2" },
    ]);
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
      properties: [],
      events: [],
      pendingAction: null,
      pendingTrades: [],
    };

    const result = bankruptPlayer(state, "p1");

    // Check bankruptcy event
    expect(result.events).toContainEqual({
      type: "PLAYER_BANKRUPT",
      playerId: "p1",
      causedBy: "",
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
        {
          id: "p3",
          name: "Charlie",
          position: 10,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
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
        },
        {
          id: "p2",
          name: "Bob",
          position: 5,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
        },
      ],
      currentTurnIndex: 0,
      properties: [],
      events: [],
      pendingAction: null,
      pendingTrades: [],
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
