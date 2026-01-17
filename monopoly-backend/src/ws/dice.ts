import { DiceRoll } from "../types/game";

export function rollDice(): DiceRoll {
  return {
    die1: Math.ceil(Math.random() * 6),
    die2: Math.ceil(Math.random() * 6),
  };
}
