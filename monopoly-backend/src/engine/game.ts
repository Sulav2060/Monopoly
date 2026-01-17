//changed so that we can have a initial game state creation in one place
import { GameState } from "../types/game";

export function createInitialGameState(): GameState {
  return {
    players: [],
    currentTurnIndex: 0,
    events: [],
    properties: [],
  };
}
