import { endTurn } from "../../engine/endTurn";
import { createBaseState } from "../helpers/gameState";

describe("endTurn", () => {
  test("advances to next player", () => {
    const state = createBaseState();

    const next = endTurn(state);

    expect(next.currentTurnIndex).toBe(1);
  });

  test("loops back to first player after last", () => {
    const state = createBaseState();
    state.currentTurnIndex = 1; // last player

    const next = endTurn(state);

    expect(next.currentTurnIndex).toBe(0);
  });

  test("adds TURN_ENDED event", () => {
    const state = createBaseState();

    const next = endTurn(state);

    expect(next.events[next.events.length - 1]).toEqual({
      type: "TURN_ENDED",
      nextPlayerId: next.players[next.currentTurnIndex]!.id,
    });
  });

  test("does not mutate original state", () => {
    const state = createBaseState();

    const next = endTurn(state);

    expect(state.currentTurnIndex).toBe(0);
    expect(state.events).toHaveLength(0);
  });
});
