import { GameState } from "../types/game";

export function baseGameState(): GameState {
  return {
    communityChestDeck: [],
    communityChestIndex: 0,
    voteout: null,
    players: [
      {
        id: "p1",
        name: "A",
        position: 10, // jail tile
        money: 1500,
        inJail: true,
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
  };
}
