import React, { useEffect, useState, useRef } from "react";
const PlayerToken = ({
  position,
  color,
  isCurrentPlayer,
  playerIndex,
  animationStep,
  diceValue,
  tilesCount,
}) => {
  if (!color) return null;
  const [jumpStep, setJumpStep] = useState(0);
  const timeoutsRef = useRef([]);

  const displayedPosition = (position + jumpStep) % tilesCount;
  const getPositionStyle = (pos) => {
    const boardSize = 11;
    // Top row (GO starts here at index 0)
    if (pos <= 10) return { gridRow: 1, gridColumn: pos + 1 };
    // Right column
    if (pos <= 20) return { gridRow: pos - 10 + 1, gridColumn: boardSize };
    // Bottom row
    if (pos <= 30)
      return { gridRow: boardSize, gridColumn: boardSize - (pos - 20) };
    // Left column
    return { gridRow: boardSize - (pos - 30), gridColumn: 1 };
  };
  const getTokenOffset = () => {
    const offsets = [
      { x: 0, y: 0 }, // Player 0
      { x: 8, y: 0 }, // Player 1
      { x: 0, y: 8 }, // Player 2
      { x: 8, y: 8 }, // Player 3
    ];
    return offsets[playerIndex] || { x: 0, y: 0 };
  };
  const offset = getTokenOffset();
  useEffect(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];

    if (isCurrentPlayer && animationStep === "waving" && diceValue > 0) {
      for (let i = 1; i <= diceValue; i++) {
        const t = setTimeout(() => setJumpStep(i), i * 100);
        timeoutsRef.current.push(t);
      }
      const cleanup = setTimeout(() => setJumpStep(0), diceValue * 100 + 600);
      timeoutsRef.current.push(cleanup);
    } else {
      setJumpStep(0);
    }

    return () => timeoutsRef.current.forEach((t) => clearTimeout(t));
  }, [animationStep, diceValue, isCurrentPlayer]);

  // Determine if token should show the hop animation class
  const shouldAnimateNow =
    isCurrentPlayer && animationStep === "waving" && jumpStep > 0;

  return (
    <div
      className="absolute w-full h-full top-0 left-0 grid pointer-events-none"
      style={{
        gridTemplateRows: "1.6fr repeat(9, 1fr) 1.6fr",
        gridTemplateColumns: "1.6fr repeat(9, 1fr) 1.6fr",
      }}
    >
      <div
        style={getPositionStyle(displayedPosition)}
        className="flex items-center justify-center relative"
      >
        <div
          className={`w-8 h-8 ${color.color} rounded-full border-2 ${
            color.borderColor
          } shadow-lg transition-all duration-300 ease-out ${
            shouldAnimateNow ? "player-token--jump" : ""
          } ${isCurrentPlayer ? "scale-105" : ""}`}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px)`,
          }}
        />
      </div>
    </div>
  );
};

export default PlayerToken;
