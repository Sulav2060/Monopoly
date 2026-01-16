import React, { useEffect, useState, useRef } from "react";

const PlayerToken = ({
  position,
  color,
  isAnimatingPlayer,
  isCurrentPlayer,
  playerIndex,
  animationStep,
  startPosition,
  moveSteps,
  tilesCount,
}) => {
  const fallbackPalette = [
    { color: "bg-red-500", borderColor: "border-red-900" },
    { color: "bg-blue-500", borderColor: "border-blue-900" },
    { color: "bg-green-500", borderColor: "border-green-900" },
    { color: "bg-yellow-400", borderColor: "border-yellow-700" },
  ];

  // Normalize `color` prop to ensure proper tailwind classes are applied
  const resolvedColor = (() => {
    const fallback = fallbackPalette[playerIndex % fallbackPalette.length];
    if (!color) return fallback;
    if (typeof color === "object") {
      return {
        color: color.color || fallback.color,
        borderColor: color.borderColor || fallback.borderColor,
      };
    }
    if (typeof color === "string") {
      const parts = color.split(/\s+/).filter(Boolean);
      const bgClass = parts.find((p) => p.startsWith("bg-"));
      const borderClass = parts.find((p) => p.startsWith("border-"));
      if (bgClass || borderClass) {
        return {
          color: bgClass || fallback.color,
          borderColor: borderClass || fallback.borderColor,
        };
      }
      return fallback;
    }
    return fallback;
  })();

  const [jumpStep, setJumpStep] = useState(0);
  const [currentDisplayPosition, setCurrentDisplayPosition] =
    useState(position);
  const timeoutsRef = useRef([]);
  const lastAnimationKeyRef = useRef(null);

  const normalizedTilesCount = tilesCount || 40;

  const normalizePosition = (pos) =>
    ((pos % normalizedTilesCount) + normalizedTilesCount) %
    normalizedTilesCount;

  const normalizedStart = normalizePosition(
    Number.isFinite(startPosition) ? startPosition : position
  );
  const normalizedEnd = normalizePosition(position);
  const steps = moveSteps || 0;

  // Key insight: If moveSteps > 0, this player is moving!
  const isMoving = steps > 0;

  //console.log(
  //   `[Player ${playerIndex}] animationStep: ${animationStep}, isMoving: ${isMoving}, steps: ${steps}, start: ${normalizedStart}, end: ${normalizedEnd}`
  // );

  // When animation phase changes, handle position locking
  useEffect(() => {
    if (animationStep === "rotating" && isMoving) {
      // Lock at start position when dice starts rolling
      //console.log(
      //   `[Player ${playerIndex}] ROTATING - Locking at position ${normalizedStart}`
      // );
      setCurrentDisplayPosition(normalizedStart);
      setJumpStep(0);
    } else if (animationStep === "zooming" && isMoving) {
      // Keep token at the destination during zoom to avoid snap-back
      setCurrentDisplayPosition(normalizedEnd);
    } else if (animationStep === "idle") {
      // Animation complete - update to final position
      //console.log(
      //   `[Player ${playerIndex}] IDLE - Moving to final position ${normalizedEnd}`
      // );
      setCurrentDisplayPosition(normalizedEnd);
      setJumpStep(0);
      lastAnimationKeyRef.current = null;
    }
  }, [animationStep, isMoving, normalizedStart, normalizedEnd, playerIndex]);

  // Handle wave animation steps
  useEffect(() => {
    // Clear any pending timeouts
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];

    // Only animate if in waving phase and this player is moving
    if (animationStep !== "waving" || !isMoving || steps === 0) {
      setJumpStep(0);
      return;
    }

    // Create unique key for this animation sequence
    const animKey = `${normalizedStart}-${normalizedEnd}-${steps}`;

    // Prevent duplicate animations
    if (lastAnimationKeyRef.current === animKey) {
      return;
    }

    lastAnimationKeyRef.current = animKey;
    //console.log(
    //   `[Player ${playerIndex}] WAVING - Animating ${steps} steps from ${normalizedStart}`
    // );

    // Schedule each step of the wave animation
    for (let i = 1; i <= steps; i++) {
      const t = setTimeout(() => {
        //console.log(
        //   `[Player ${playerIndex}] Wave step ${i}/${steps} - position ${
        //     (normalizedStart + i) % normalizedTilesCount
        //   }`
        // );
        setJumpStep(i);
      }, i * 100);
      timeoutsRef.current.push(t);
    }

    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, [
    animationStep,
    isMoving,
    steps,
    normalizedStart,
    normalizedEnd,
    normalizedTilesCount,
    playerIndex,
  ]);

  // Calculate the position to display
  const displayPosition = (() => {
    if (!isMoving) return currentDisplayPosition;
    if (animationStep === "rotating") return normalizedStart;
    if (animationStep === "waving")
      return (normalizedStart + jumpStep) % normalizedTilesCount;
    // During zooming and idle, keep the destination visible
    return normalizedEnd;
  })();

  const getPositionStyle = (pos) => {
    const boardSize = 11;
    const normalizedPos = normalizePosition(pos);

    // Top row (GO starts here at index 0)
    if (normalizedPos <= 10)
      return { gridRow: 1, gridColumn: normalizedPos + 1 };
    // Right column
    if (normalizedPos <= 20)
      return { gridRow: normalizedPos - 10 + 1, gridColumn: boardSize };
    // Bottom row
    if (normalizedPos <= 30)
      return {
        gridRow: boardSize,
        gridColumn: boardSize - (normalizedPos - 20),
      };
    // Left column
    return { gridRow: boardSize - (normalizedPos - 30), gridColumn: 1 };
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

  // Show hop animation during waving
  const shouldShowHop = animationStep === "waving" && isMoving && jumpStep > 0;

  // Add pulse animation style
  const pulseStyle = isCurrentPlayer
    ? {
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }
    : {};

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.15);
          }
        }
      `}</style>
      <div
        className="absolute w-full h-full top-0 left-0 grid pointer-events-none"
        style={{
          gridTemplateRows: "1.6fr repeat(9, 1fr) 1.6fr",
          gridTemplateColumns: "1.6fr repeat(9, 1fr) 1.6fr",
        }}
      >
        <div
          style={getPositionStyle(displayPosition)}
          className="flex items-center justify-center relative"
        >
          <div
            className={`w-8 h-8 rounded-full border-2 shadow-lg transition-all duration-300 ease-out ${
              resolvedColor.color
            } ${resolvedColor.borderColor} ${
              shouldShowHop ? "player-token--jump" : ""
            }`}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px)`,
              ...pulseStyle,
            }}
          >
            {/* Cute bubbly water-drop eyes */}
            <div className="absolute inset-0 flex items-center justify-center gap-1">
              {/* Left eye */}
              <div 
                className="w-3 h-3 bg-white rounded-full shadow-md flex items-center justify-center relative"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset -1px -1px 2px rgba(0,0,0,0.1)'
                }}
              >
                {/* Pupil */}
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                {/* Shine spot */}
                <div 
                  className="absolute w-0.5 h-0.5 bg-white rounded-full"
                  style={{
                    top: '3px',
                    left: '3px',
                    opacity: 0.9
                  }}
                ></div>
              </div>
              {/* Right eye */}
              <div 
                className="w-3 h-3 bg-white rounded-full shadow-md flex items-center justify-center relative"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset -1px -1px 2px rgba(0,0,0,0.1)'
                }}
              >
                {/* Pupil */}
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                {/* Shine spot */}
                <div 
                  className="absolute w-0.5 h-0.5 bg-white rounded-full"
                  style={{
                    top: '3px',
                    left: '3px',
                    opacity: 0.9
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerToken;
