import { getCurrentPlayerSafe } from "../engine/assertions";
import { movePlayer } from "../engine/move";
import { GameState } from "../types/game";

export const baseState: GameState = {
  communityChestDeck: [],
  communityChestIndex: 0,
  players: [
    {
      id: "p1",
      name: "A",
      position: 0,
      money: 1500,
      inJail: false,
      jailTurns: 0,
      isBankrupt: false,
      debtResolution: undefined,
    },
    {
      id: "p2",
      name: "B",
      position: 0,
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

test("player moves correct number of steps", () => {
  const next = movePlayer(baseState, { die1: 3, die2: 4 });
  const player = getCurrentPlayerSafe(next);
  expect(player.position).toBe(7);
});
