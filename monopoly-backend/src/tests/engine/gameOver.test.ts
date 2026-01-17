import { checkGameOver } from "../../engine/gameOver";
import { GameState } from "../../types/game";

test("emits GAME_OVER when only one player remains", () => {
  const state: GameState = {
    communityChestDeck: [],
    communityChestIndex: 0,
    players: [
      {
        id: "p1",
        name: "A",
        position: 0,
        money: 0,
        inJail: false,
        jailTurns: 0,
        isBankrupt: true,
      },
      {
        id: "p2",
        name: "B",
        position: 0,
        money: 500,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      },
    ],
    currentTurnIndex: 1,
    events: [],
    properties: [],
  };

  const result = checkGameOver(state);

  expect(result.events).toHaveLength(1);
  expect(result.events[0]).toEqual({
    type: "GAME_OVER",
    winnerId: "p2",
  });
});
