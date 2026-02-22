// tests/helpers/gameState.ts
import { GameState } from "../../types/game";

export function createBaseState(): GameState {
  return {
    pendingAction: null,
    pendingTrades: [],
    currentTurnIndex: 0,
    communityChestDeck: [],
    communityChestIndex: 0,
    players: [
      {
        id: "p1",
        name: "Alice",
        position: 1,
        money: 1500,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      },
      {
        id: "p2",
        name: "Bob",
        position: 5,
        money: 1500,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
      },
    ],
    properties: [
      {
        tileIndex: 1,
        ownerId: "p2",
        houses: 0,
        isMortaged: false,
      },
    ],
    events: [],
  };
}
