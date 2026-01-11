import { handleTax } from "../../engine/handleTax";
import { GameState } from "../../types/game";

describe("handleTax", () => {
  test("deducts tax from player and adds to free parking pot", () => {
    const state: GameState = {
      players: [
        {
          id: "p1",
          name: "A",
          position: 4,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
        },
      ],
      currentTurnIndex: 0,
      events: [],
      properties: [],
      freeParkingPot: 300,

      communityChestDeck: [],
      communityChestIndex: 0,
    };

    const result = handleTax(state, 200);

    expect(result.players[0]!.money).toBe(800);
    expect(result.freeParkingPot).toBe(500);
  });

  test("adds TAX_PAID event", () => {
    const state: GameState = {
      players: [
        {
          id: "p1",
          name: "A",
          position: 4,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
        },
      ],
      currentTurnIndex: 0,
      events: [],
      properties: [],
      freeParkingPot: 0,

      communityChestDeck: [],
      communityChestIndex: 0,
    };

    const result = handleTax(state, 150);

    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toEqual({
      type: "TAX_PAID",
      playerId: "p1",
      amount: 150,
    });
  });

  test("does not mutate original state", () => {
    const state: GameState = {
      players: [
        {
          id: "p1",
          name: "A",
          position: 4,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
        },
      ],
      currentTurnIndex: 0,
      events: [],
      properties: [],
      freeParkingPot: 0,

      communityChestDeck: [],
      communityChestIndex: 0,
    };

    handleTax(state, 100);

    expect(state.players[0]!.money).toBe(1000);
    expect(state.freeParkingPot).toBe(0);
    expect(state.events).toHaveLength(0);
  });
});
