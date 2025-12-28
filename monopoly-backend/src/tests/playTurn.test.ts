import { playTurn } from "../engine/playTurn"
import { baseState } from "./movePlayer.test"

test("turn moves to next player", () => {
  const next = playTurn(baseState)

  expect(next.currentTurnIndex).toBe(1)
})
