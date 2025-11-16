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

  const getCameraTransform = () => {
    const total = allTilesInOrder.length;
    const currentPlayer = players[currentPlayerIndex];

    const basePos = currentPlayer?.position ?? currentPosition;

    // --- 1) CALCULATE ROTATION ONLY WHEN TURN STARTS (wave step) ---
    if (animationStep === "waving") {
      const futurePos = (basePos + diceValue) % total;

      let targetRotation = 0;
      let tiltX = 0;
      let tiltY = 0;

      if (futurePos >= 0 && futurePos < 7) {
        targetRotation = 180;
        tiltX = -40;
      } else if (futurePos >= 7 && futurePos < 12) {
        targetRotation = 90;
        tiltY = -40;
      } else if (futurePos >= 12 && futurePos < 19) {
        targetRotation = 0;
        tiltX = 40;
      } else if (futurePos >= 19 && futurePos < 24) {
        targetRotation = -90;
        tiltY = 40;
      }

      // Save once when turn starts
      getCameraTransform.targetRotation = targetRotation;
      getCameraTransform.savedTiltX = tiltX;
      getCameraTransform.savedTiltY = tiltY;

      return `
      rotateZ(${targetRotation}deg)
      rotateX(${tiltX}deg)
      rotateY(${tiltY}deg)
      scale(1.1)
    `;
    }

    // --- 2) DURING MOVEMENT — USE SAVED ROTATION (NO RECALC) ---
    if (
      animationStep === "moving" ||
      animationStep === "jumping" ||
      animationStep === "landing"
    ) {
      const r = getCameraTransform.targetRotation ?? 0;
      return `
      rotateZ(${r}deg)
      rotateX(0deg)
      rotateY(0deg)
      scale(1)
    `;
    }

    // --- 3) AFTER TURN FINISHES — LOCK CAMERA (NO NEW ROTATION) ---
    if (animationStep === "idle") {
      const r = getCameraTransform.targetRotation ?? 0;
      return `
      rotateZ(${r}deg)
      rotateX(0deg)
      rotateY(0deg)
      scale(1)
    `;
    }
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        perspective: "2000px", // Increased for more dramatic 3D effect
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
                // NEW props to enable jumping animation & correct timing
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
