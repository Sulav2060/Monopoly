// engine/propertyHelpers.ts
import { GameState } from "../types/game";

export function getPropertyOwner(state: GameState, propertyId: string) {
  return state.properties.find((p) => p.propertyId === propertyId);
}
