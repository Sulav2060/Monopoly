import { randomBytes } from "crypto";

/**
 * Cryptographically secure random dice roller
 * Uses Node.js crypto module for true randomness
 */
export class CryptoDice {
  /**
   * Roll a single die (1-6)
   * @returns Random number between 1 and 6
   */
  static rollSingleDie(): number {
    // Get 1 random byte and use modulo 6
    // To avoid bias, we use rejection sampling
    // Valid range: 0-5, map to 1-6
    let randomByte: number;
    do {
      const bytes = randomBytes(1);
      randomByte = bytes[0] ?? 0;
    } while (randomByte >= 252); // 252 = 256 - (256 % 6), ensures uniform distribution

    return (randomByte % 6) + 1;
  }

  /**
   * Roll two dice
   * @returns Object with d1, d2, isDouble, and total
   */
  static rollTwoDice(): {
    d1: number;
    d2: number;
    isDouble: boolean;
    total: number;
  } {
    const d1 = this.rollSingleDie();
    const d2 = this.rollSingleDie();

    return {
      d1,
      d2,
      isDouble: d1 === d2,
      total: d1 + d2,
    };
  }

  /**
   * Generate a random number in range [min, max]
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @returns Random integer between min and max
   */
  static randomInRange(min: number, max: number): number {
    if (min === max) return min;
    if (min > max) [min, max] = [max, min];

    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    let randomValue: number;

    do {
      const buffer = randomBytes(bytesNeeded);
      randomValue = 0;
      for (let i = 0; i < bytesNeeded; i++) {
        randomValue = (randomValue << 8) | (buffer[i] ?? 0);
      }
      randomValue = randomValue >>> 0; // Convert to unsigned
    } while (randomValue >= Math.pow(2, bytesNeeded * 8) - (Math.pow(2, bytesNeeded * 8) % range));

    return min + (randomValue % range);
  }
}

export default CryptoDice;
