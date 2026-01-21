import { DiceRoll } from "../types/game";
import { webcrypto } from "crypto";

export function rollDice(): DiceRoll {
  const values = new Uint32Array(2);
  webcrypto.getRandomValues(values);

  return {
    die1: (values[0]! % 6) + 1,
    die2: (values[1]! % 6) + 1,
  };
}
