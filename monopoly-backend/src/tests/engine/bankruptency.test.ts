import { payRent } from "../../engine/payRent";
import { GameState } from "../../types/game";
import { PropertyTile } from "../../types/board";
import { BOARD } from "../../engine/board";
import { endTurn } from "../../engine/endTurn";

test("player goes bankrupt if cannot pay rent", () => {
  const state: GameState = {
    communityChestDeck: [],
    communityChestIndex: 0,
    players: [
      {
        id: "p1",
        name: "A",
        position: 1,
        money: 30,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      },
      {
        id: "p2",
        name: "B",
        position: 5,
        money: 1500,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      },
    ],
    currentTurnIndex: 0, // p1's turn
    properties: [
      {
        tileIndex: 5,
        ownerId: "p2",
      },
    ],
    events: [],
  };

  const tile = BOARD[5] as PropertyTile;

  const result = payRent(state, tile);

  const p1 = result.players.find((p) => p.id === "p1")!;
  const p2 = result.players.find((p) => p.id === "p2")!;

  expect(p1.isBankrupt).toBe(true);
  expect(p1.money).toBe(0);

  expect(p2.money).toBe(1530);

  expect(result.events).toContainEqual({
    type: "PLAYER_BANKRUPT",
    playerId: "p1",
    causedBy: "p2",
  });
});
test("skips bankrupt players when ending turn", () => {
  const state: GameState = {
    communityChestDeck: [],
    communityChestIndex: 0,
    players: [
      {
        id: "p1",
        name: "A",
        position: 0,
        money: 500,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      },
      {
        id: "p2",
        name: "B",
        position: 0,
        money: 0,
        inJail: false,
        jailTurns: 0,
        isBankrupt: true, // 👈 should be skipped
      },
      {
        id: "p3",
        name: "C",
        position: 0,
        money: 500,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      },
    ],
    currentTurnIndex: 0,
    events: [],
    properties: [],
  };

  const result = endTurn(state);

  expect(result.currentTurnIndex).toBe(2);
  expect(result.events[0]).toEqual({
    type: "TURN_ENDED",
    nextPlayerId: "p3",
  });
});
