import { getCurrentPlayerSafe } from "../engine/assertions";
import { movePlayer } from "../engine/move";
import { GameState } from "../types/game";
import { baseState } from "./movePlayer.test";

test("player gets money when passing GO", () => {
  const state: GameState = {
    ...baseState,
    players: baseState.players.map((p, index) =>
      index === 0 ? { ...p, position: 39, money: 1000 } : p,
    ),
    voteout: null,
  };

  const next = movePlayer(state, { die1: 2, die2: 1 });
  const player = getCurrentPlayerSafe(next);

  expect(player.position).toBe(2);
  expect(player.money).toBe(1200);
});
