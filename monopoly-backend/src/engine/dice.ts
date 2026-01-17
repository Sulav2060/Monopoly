import { DiceRoll } from "../types/game";

export function rollDice(): DiceRoll {
  return {
    die1: Math.floor(Math.random() * 6) + 1,
    die2: Math.floor(Math.random() * 6) + 1,
  };
}
