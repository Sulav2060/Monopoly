// engine/propertyHelpers.ts
import { GameState } from "../types/game";

export function getPropertyOwner(state: GameState, tileIndex: number) {
  return state.properties.find((p) => p.tileIndex === tileIndex);
}
