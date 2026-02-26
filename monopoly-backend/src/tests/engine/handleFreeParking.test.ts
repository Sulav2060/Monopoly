import { handleFreeParking } from "../../engine/handleFreeParking";
import { GameState } from "../../types/game";

describe("handleFreeParking", () => {
  test("does nothing if pot is empty", () => {
    const state: GameState = {
      players: [
        {
          id: "p1",
          name: "A",
          position: 20,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      events: [],
      properties: [],
      freeParkingPot: 0,
      communityChestDeck: [
        { type: "MONEY", amount: 200 },
        { type: "GO_TO_JAIL" },
        { type: "MOVE", position: 12 },
      ],
      communityChestIndex: 0,
      pendingAction: null,
      pendingTrades: [],
      voteout: null,
    };

    const result = handleFreeParking(state);

    expect(result).toEqual(state);
  });

  test("gives pot money to current player and resets pot", () => {
    const state: GameState = {
      players: [
        {
          id: "p1",
          name: "A",
          position: 20,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      events: [],
      properties: [],
      freeParkingPot: 300,
      communityChestDeck: [
        { type: "MONEY", amount: 200 },
        { type: "GO_TO_JAIL" },
        { type: "MOVE", position: 12 },
      ],
      communityChestIndex: 0,
      pendingAction: null,
      pendingTrades: [],
      voteout: null,
    };

    const result = handleFreeParking(state);

    expect(result.players[0]!.money).toBe(1300);
    expect(result.freeParkingPot).toBe(0);
    expect(result.events).toContainEqual({
      type: "FREE_PARKING_COLLECTED",
      playerId: "p1",
      amount: 300,
    });
  });

  test("does not mutate original state", () => {
    const state: GameState = {
      players: [
        {
          id: "p1",
          name: "A",
          position: 20,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          debtResolution: undefined,
        },
      ],
      currentTurnIndex: 0,
      events: [],
      properties: [],
      freeParkingPot: 300,
      communityChestDeck: [
        { type: "MONEY", amount: 200 },
        { type: "GO_TO_JAIL" },
        { type: "MOVE", position: 12 },
      ],
      communityChestIndex: 0,
      pendingAction: null,
      pendingTrades: [],
      voteout: null,
    };

    handleFreeParking(state);

    expect(state.players[0]!.money).toBe(1000);
    expect(state.freeParkingPot).toBe(300);
    expect(state.events).toHaveLength(0);
  });
});
