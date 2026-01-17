import { GameState } from "../types/game";

export function baseGameState(): GameState {
  return {
    players: [
      {
        id: "p1",
        name: "A",
        position: 10, // jail tile
        money: 1500,
        inJail: true,
        jailTurns: 0,
        isBankrupt:false
      },
      {
        id: "p2",
        name: "B",
        position: 0,
        money: 1500,
        inJail: false,
        jailTurns: 0,
        isBankrupt:false
      },
    ],
    currentTurnIndex: 0,
    properties: [],
    events: [],
  };
}
