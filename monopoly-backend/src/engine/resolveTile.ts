import { GameState } from "../types/game";
import { BOARD } from "./board";
import { getCurrentPlayerSafe } from "./assertions";
import { handleProperty } from "./property";

export function resolveCurrentTile(state: GameState): GameState {
  const player = getCurrentPlayerSafe(state);
  const tile = BOARD[player.position];

  if (!tile) return state;

  switch (tile.type) {
    case "GO":
      return state;

    case "PROPERTY":
      return handleProperty(state, tile);

    case "TAX":
      // return handleTax(state, tile.amount);

    default:
      return state;
  }
}
