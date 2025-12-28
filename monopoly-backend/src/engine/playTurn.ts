//orchastrator
import { GameState } from "../types/game";
import { rollDice } from "./dice";
import { resolveCurrentTile } from "./resolveTile";
import { endTurn } from "./turn";
import { movePlayer } from "./move";

export function playTurn(state: GameState): GameState {
  let next = state;

  const dice = rollDice();
  next = movePlayer(next, dice);
  next = resolveCurrentTile(next);
  next = endTurn(next);

  return next;
}
