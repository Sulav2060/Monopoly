import { getCurrentPlayerSafe } from "../../engine/assertions";
import { playTurn } from "../../engine/playTurn";
import { baseGameState } from "../helper";
import { goToJail } from "../../engine/goToJail";
import { createBaseState } from "../helpers/gameState";

test("player in jail does not move without doubles", () => {
  const state = baseGameState();

  //make player playTurn with certain die values when in jail
  const next = playTurn(state, { die1: 2, die2: 3 });

  const player = getCurrentPlayerSafe(state);

  //then see if he is still in jail with same player position?
  expect(player.inJail).toBe(true);
  expect(player.jailTurns).toBe(1);
  expect(player.position).toBe(10);
});

test("player exits jail on doubles", () => {
  const state = baseGameState();

  const next = playTurn(state, { die1: 4, die2: 4 });

  const player = getCurrentPlayerSafe(state);

  expect(player.inJail).toBe(false);
  expect(player.jailTurns).toBe(0);
});

test("player exits jail after 3 failed attempts", () => {
  const state = baseGameState();
  if (state.players[0]) {
    state.players[0].jailTurns = 2;
  }

  const next = playTurn(state, { die1: 1, die2: 2 });

  const player = getCurrentPlayerSafe(next);

  expect(player.inJail).toBe(false);
  expect(player.jailTurns).toBe(0);
});

describe("goToJail", () => {
  test("moves player to jail and marks inJail", () => {
    const state = createBaseState();

    const result = goToJail(state);

    const player = result.players[0]!; // non-null assertion

    expect(player.position).toBe(10);
    expect(player.inJail).toBe(true);
    expect(player.jailTurns).toBe(0);
  });

  test("adds GO_TO_JAIL event", () => {
    const state = createBaseState();

    const result = goToJail(state);

    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toEqual({
      type: "PLAYER_SENT_TO_JAIL",
      playerId: "p1",
    });
  });

  test("does not mutate original state", () => {
    const state = createBaseState();

    goToJail(state);

    expect(state.players[0]!.position).toBe(1);
    expect(state.players[0]!.inJail).toBe(false);
  });
});
