import { checkGameOver } from "../../engine/gameOver";
import { GameState } from "../../types/game";

test("emits GAME_OVER when only one player remains", () => {
  const state: GameState = {
    players: [
      {
        id: "p1",
        name: "A",
        position: 0,
        money: -50,
        inJail: false,
        jailTurns: 0,
        isBankrupt: true,
        debtResolution: undefined,
      },
      {
        id: "p2",
        name: "B",
        position: 0,
        money: 500,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
        debtResolution: undefined,
      },
    ],
    currentTurnIndex: 1,
    events: [],
    properties: [],
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

  const result = checkGameOver(state);

  expect(result.events).toHaveLength(1);
  expect(result.events[0]).toEqual({
    type: "GAME_OVER",
    winnerId: "p2",
  });
});
