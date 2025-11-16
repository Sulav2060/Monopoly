import React, { useEffect } from "react";
import { tiles, corners } from "./tiles.js";
import Tile from "./Tile";
import CornerTile from "./CornerTile";
import CenterComponent from "./CenterComponent.jsx";
import PlayerToken from "./PlayerToken.jsx";

const Board = ({
  isAnimating,
  animationStep,
  players,
  currentPlayerIndex,
  diceValue,
  isMyTurn, // NEW PROP
}) => {
  // Create a flat array of all tiles in order for easy indexing
  const allTilesInOrder = [
    // Start at GO (bottom-right)
    corners["bottom-right"],
    ...tiles.bottom, // move left along bottom row

    corners["bottom-left"],
    ...tiles.left, // move up left column

    corners["top-left"],
    ...tiles.top, // move right along top row

    corners["top-right"],
    ...tiles.right, // move down right column
  ].map((tile, index) => ({ ...tile, id: `tile-${index}` }));

  // Get current player position safely
  const currentPosition =
    players && players[currentPlayerIndex]
      ? players[currentPlayerIndex].position
      : 0;

  useEffect(() => {
    if (animationStep === "waving") {
      for (let i = 1; i <= diceValue; i++) {
        const tileIndex = (currentPosition + i) % allTilesInOrder.length;
        const tileElement = document.getElementById(`tile-${tileIndex}`);
        if (tileElement) {
          tileElement.style.animation = "none";
          void tileElement.offsetWidth;
          tileElement.style.animation = `wave 0.5s ease-in-out forwards`;
          tileElement.style.animationDelay = `${i * 0.1}s`;
        }
      }
    }
  }, [animationStep, currentPosition, diceValue, allTilesInOrder.length]);

  const tileElements = [];

  // Top Row (Row 1)
  allTilesInOrder.slice(0, 7).forEach((tile, index) => {
    const Component = tile.type === "corner" ? CornerTile : Tile;
    tileElements.push(
      <div style={{ gridRow: 1, gridColumn: index + 1 }} key={tile.id}>
        <Component {...tile} />
      </div>
    );
  });

  // Right Column (Column 7)
  allTilesInOrder.slice(7, 12).forEach((tile, index) => {
    tileElements.push(
      <div style={{ gridRow: index + 2, gridColumn: 7 }} key={tile.id}>
        <Tile {...tile} />
      </div>
    );
  });

  // Bottom Row (Row 7)
  allTilesInOrder.slice(12, 19).forEach((tile, index) => {
    const Component = tile.type === "corner" ? CornerTile : Tile;
    tileElements.push(
      <div style={{ gridRow: 7, gridColumn: 7 - index }} key={tile.id}>
        <Component {...tile} />
      </div>
    );
  });

  // Left Column (Column 1)
  allTilesInOrder.slice(19, 24).forEach((tile, index) => {
    tileElements.push(
      <div style={{ gridRow: 7 - (index + 1), gridColumn: 1 }} key={tile.id}>
        <Tile {...tile} />
      </div>
    );
  });
  const rotationRef = React.useRef({
    z: 0,
    tiltX: 0,
    tiltY: 0,
  });

  const getCameraTransform = () => {
    const total = allTilesInOrder.length;
    const currentPlayer = players[currentPlayerIndex];

    const basePos = currentPlayer?.position ?? currentPosition;

    const { z, tiltX, tiltY } = rotationRef.current;

    // If it's NOT my turn -> DO NOT rotate, keep last saved rotation
    if (!isMyTurn) {
      return `
      rotateZ(${z}deg)
      rotateX(0deg)
      rotateY(0deg)
      scale(1)
    `;
    }

    // --- 1. During WAVING -> calculate and SAVE rotation ---
    if (animationStep === "waving") {
      const futurePos = (basePos + diceValue) % total;

      let targetZ = 0;
      let tX = 0;
      let tY = 0;

      if (futurePos >= 0 && futurePos < 7) {
        targetZ = 180;
        tX = -40;
      } else if (futurePos >= 7 && futurePos < 12) {
        targetZ = 90;
        tY = -40;
      } else if (futurePos >= 12 && futurePos < 19) {
        targetZ = 0;
        tX = 40;
      } else if (futurePos >= 19 && futurePos < 24) {
        targetZ = -90;
        tY = 40;
      }

      // Save to ref (persistent!)
      rotationRef.current = { z: targetZ, tiltX: tX, tiltY: tY };

      return `
      rotateZ(${targetZ}deg)
      rotateX(${tX}deg)
      rotateY(${tY}deg)
      scale(1.1)
    `;
    }

    // --- 2. For moving, jumping, landing, idle: KEEP LAST ROTATION ---
    return `
    rotateZ(${z}deg)
    rotateX(0deg)
    rotateY(0deg)
    scale(1)
  `;
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        perspective: "2000px",
        perspectiveOrigin: "center center",
      }}
    >
      <div
        className="transition-all duration-800 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: getCameraTransform(),
        }}
      >
        <div
          className="w-full h-full min-w-[80vmin] min-h-[80vmin] aspect-square relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="w-full h-full grid grid-cols-[1.6fr_repeat(5,1fr)_1.6fr] grid-rows-[1.6fr_repeat(5,1fr)_1.6fr]">
            {tileElements}
            <CenterComponent />
          </div>

          {/* Render all player tokens */}
          {players &&
            players.length > 0 &&
            players.map((player, index) => (
              <PlayerToken
                key={player.id}
                position={player.position}
                color={player.color}
                isCurrentPlayer={index === currentPlayerIndex}
                playerCount={players.length}
                playerIndex={index}
                animationStep={animationStep}
                diceValue={diceValue}
                currentPosition={currentPosition}
                tilesCount={allTilesInOrder.length}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
