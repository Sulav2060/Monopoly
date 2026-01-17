import { playTurn } from "../engine/playTurn";
import { baseState } from "./movePlayer.test";

test("turn moves to next player", () => {
  const dice = { die1: 2, die2: 2 };
  const next = playTurn(baseState, dice);

  expect(next.currentTurnIndex).toBe(1);
});
