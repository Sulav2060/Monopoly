import { DiceRoll } from "../types/game";
import { webcrypto } from "crypto";

export function rollDice(): DiceRoll {
  const values = new Uint32Array(2);
  webcrypto.getRandomValues(values);

  return {
    die1: (values[0]! % 6) + 1,
    die2: (values[1]! % 6) + 1,
    // die1: 6,
    // die2: 4,
  };
  // const results = [];
  // for (let i = 0; i < 1000; i++) {
  //   const roll = rollDice();
  //   results.push({ ...roll, total: roll.die1 + roll.die2 });
  // }
  // console.log(JSON.stringify(results, null, 2));
}
