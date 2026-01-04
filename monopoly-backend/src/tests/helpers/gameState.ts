// tests/helpers/gameState.ts
import { GameState } from "../../types/game";

export function createBaseState(): GameState {
  return {
    currentTurnIndex: 0,
    players: [
      {
        id: "p1",
        name: "Alice",
        position: 1,
        money: 1500,
        inJail: false,
        jailTurns: 0,
      },
      {
        id: "p2",
        name: "Bob",
        position: 5,
        money: 1500,
        inJail: false,
        jailTurns: 0,
      },
    ],
    properties: [
      {
        propertyId: "1",
        ownerId: "p2",
      },
    ],
    events: [],
  };
}
