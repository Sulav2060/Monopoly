import { playTurn } from "../../engine/playTurn";
import { createBaseState } from "../helpers/gameState";

describe("Doubles Logic", () => {
  test("rolling doubles gives extra turn without advancing player", () => {
    const state = createBaseState();

    const dice = { die1: 2, die2: 2 };

    const next = playTurn(state, dice);

    // currentTurnIndex stays the same because player gets extra turn
    expect(next.currentTurnIndex).toBe(state.currentTurnIndex);
    expect(next.doublesCount).toBe(1);
    expect(next.events.some((e) => e.type === "DICE_ROLLED")).toBe(true);
  });

  test("3 consecutive doubles sends player to jail", () => {
    const state = { ...createBaseState(), doublesCount: 2 };

    const dice = { die1: 6, die2: 6 };

    const next = playTurn(state, dice);

    // Player goes to jail
    expect(next.players[0]!.position).toBe(10);
    expect(next.players[0]!.inJail).toBe(true);

    // doublesCount resets
    expect(next.doublesCount).toBe(0);
    console.log("events:", next.events);

    // Event includes GO_TO_JAIL
    expect(next.events.some((e) => e.type === "PLAYER_SENT_TO_JAIL")).toBe(
      true
    );
  });

  test("non-doubles resets doubles count and ends turn", () => {
    const state = { ...createBaseState(), doublesCount: 1 };

    const dice = { die1: 2, die2: 3 };

    const next = playTurn(state, dice);

    // Turn advances
    expect(next.currentTurnIndex).toBe(
      (state.currentTurnIndex + 1) % state.players.length
    );
    expect(next.doublesCount).toBe(0);
  });
});
