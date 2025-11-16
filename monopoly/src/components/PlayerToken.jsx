import React, { useEffect, useState, useRef } from "react";

const PlayerToken = ({
  position,
  color,
  isCurrentPlayer,
  playerCount,
  playerIndex,
  // NEW props
  animationStep,
  diceValue,
  currentPosition,
  tilesCount,
}) => {
  if (!color) return null;

  // jumpStep: how many tiles ahead we've jumped visually (0..diceValue)
  const [jumpStep, setJumpStep] = useState(0);
  const timeoutsRef = useRef([]);

  // Compute displayed position (used for placing the token on the grid)
  const displayedPosition = (position + jumpStep) % tilesCount;

  // Grid placement logic (same as before, but using displayedPosition)
  const getPositionStyle = (pos) => {
    if (pos >= 0 && pos <= 6) return { gridRow: 1, gridColumn: pos + 1 }; // Top
    if (pos >= 7 && pos <= 12) return { gridRow: pos - 5, gridColumn: 7 }; // Right
    if (pos >= 13 && pos <= 18) return { gridRow: 7, gridColumn: 19 - pos }; // Bottom
    if (pos >= 19 && pos <= 23) return { gridRow: 25 - pos, gridColumn: 1 }; // Left
    return {};
  };

  // Offsets so multiple tokens on same tile don't overlap
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

  // When the waving animation starts, schedule jump steps for the current player
  useEffect(() => {
    // Clear previous timeouts
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];

    if (isCurrentPlayer && animationStep === "waving" && diceValue > 0) {
      // For visual sync with your tile wave: use same timing
      // wave delay per tile used in Board was: i * 0.1s
      // token jump duration we set to ~300ms, start each jump at i*100ms
      for (let i = 1; i <= diceValue; i++) {
        const startDelay = i * 100; // ms
        // schedule change of jumpStep to i (so token visually moves to that tile)
        const t1 = setTimeout(() => {
          setJumpStep(i);
        }, startDelay);
        timeoutsRef.current.push(t1);

        // optionally remove "jump" (we keep jumpStep at i so it stays on that tile;
        // the CSS animation handles the brief visual hop)
      }
      // After the waving finishes, leave jumpStep as diceValue (the Game logic will update the real position)
      // Clear after a safe margin (e.g., extra 600ms) to avoid leftover timers next time
      const cleanupTimer = setTimeout(() => {
        timeoutsRef.current.forEach((t) => clearTimeout(t));
        timeoutsRef.current = [];
      }, diceValue * 100 + 1000);
      timeoutsRef.current.push(cleanupTimer);
    } else {
      // Not waving or not current player -> ensure no visual jump
      setJumpStep(0);
    }

    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, [
    animationStep,
    diceValue,
    isCurrentPlayer,
    playerIndex,
    tilesCount,
    position,
    currentPosition,
  ]);

  // Determine if token should show the hop animation class
  const shouldAnimateNow =
    isCurrentPlayer && animationStep === "waving" && jumpStep > 0;

  return (
    <div className="absolute w-full h-full top-0 left-0 grid grid-cols-[1.6fr_repeat(5,1fr)_1.6fr] grid-rows-[1.6fr_repeat(5,1fr)_1.6fr] pointer-events-none">
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
