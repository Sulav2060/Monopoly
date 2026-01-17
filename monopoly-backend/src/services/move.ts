import { rollDice } from "../engine/dice";
import { movePlayer } from "../engine/move";
import { resolveCurrentTile } from "../engine/resolveTile";
import { GameState } from "../types/game";

export function rollMoveResolve(state: GameState): GameState {
  const dice = rollDice();
  let next = movePlayer(state, dice);
  next = resolveCurrentTile(next);
  return next;
}
