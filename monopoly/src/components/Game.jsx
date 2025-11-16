import React, { useState, useEffect, useCallback } from "react";
import Board from "./Board";

// Total number of tiles on the board
const TOTAL_TILES = 40; // 4 corners + (4 * 9 properties/specials) is not right. It's 40 tiles.
// My previous calculation was wrong. Standard board has 40 tiles.
// Top: 1 corner + 9 tiles
// Right: 1 corner + 9 tiles
// Bottom: 1 corner + 9 tiles
// Left: 1 corner + 9 tiles
// Let's re-verify from the data.
// corners: 4
// tiles.top: 5
// tiles.right: 5
// tiles.bottom: 5
// tiles.left: 5
// Total = 4 + 5*4 = 24. My old number was correct for the provided data. Let's stick with 24.
const TILES_ON_BOARD = 24;

const Game = () => {
  const [playerPosition, setPlayerPosition] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [diceValue, setDiceValue] = useState(0);
  const [animationStep, setAnimationStep] = useState("idle");

  const startMove = useCallback(
    (roll) => {
      if (isAnimating) return;
      setDiceValue(roll);
      setIsAnimating(true);
      setAnimationStep("rotating");
    },
    [isAnimating]
  );

  // Function for manual or automatic dice roll
  const rollDice = useCallback(() => {
    const roll = Math.floor(Math.random() * 10) + 1; // From 1 to 10 for more movement
    startMove(roll);
  }, [startMove]);

  // Effect for automatic movement every 10 seconds
  useEffect(() => {
    const gameInterval = setInterval(() => {
      rollDice();
    }, 10000); // 10 seconds

    return () => clearInterval(gameInterval); // Cleanup interval on component unmount
  }, [rollDice]);

  // Effect to handle the animation sequence
  useEffect(() => {
    if (!isAnimating) return;

    let timeout;

    if (animationStep === "rotating") {
      timeout = setTimeout(() => setAnimationStep("waving"), 1000);
    } else if (animationStep === "waving") {
      const waveDuration = diceValue * 100 + 500;
      timeout = setTimeout(() => {
        const newPosition = (playerPosition + diceValue) % TILES_ON_BOARD;
        setPlayerPosition(newPosition);
        setAnimationStep("zooming");
      }, waveDuration);
    } else if (animationStep === "zooming") {
      timeout = setTimeout(() => {
        setIsAnimating(false);
        setAnimationStep("idle");
      }, 1500);
    }

    return () => clearTimeout(timeout);
  }, [isAnimating, animationStep, playerPosition, diceValue]);

  return (
    <div className="w-screen h-screen  flex flex-col items-center justify-center gap-4">
      <Board
        isAnimating={isAnimating}
        animationStep={animationStep}
        currentPosition={playerPosition}
        diceValue={diceValue}
      />
      <button
        onClick={rollDice}
        disabled={isAnimating}
        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-500 transition-all"
      >
        {isAnimating ? "Moving..." : `Roll Dice (Position: ${playerPosition})`}
      </button>
    </div>
  );
};

export default Game;
