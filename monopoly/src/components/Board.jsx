import React, { useEffect } from "react";
import { tiles, corners } from "./tiles.js";
import Tile from "./Tile";
import CornerTile from "./CornerTile";
import CenterComponent from "./CenterComponent.jsx";
import PlayerToken from "./PlayerToken.jsx";

const Board = ({ isAnimating, animationStep, currentPosition, diceValue }) => {
  // Create a flat array of all tiles in order for easy indexing
  const allTilesInOrder = [
    corners["top-left"],
    ...tiles.top,
    corners["top-right"],
    ...tiles.right,
    corners["bottom-right"],
    ...tiles.bottom,
    corners["bottom-left"],
    ...tiles.left,
  ].map((tile, index) => ({ ...tile, id: `tile-${index}` }));

  // Effect for the "wave" animation
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

  // Camera-like animation: zoom in, rotate, move down
  const getCameraTransform = () => {
    if (isAnimating && animationStep !== "idle") {
      return "translateZ(200px) rotateX(45deg) translateY(-50px) scale(1.1)";
    }
    return "translateZ(0px) rotateX(0deg) translateY(0px) scale(1)";
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
        className="transition-all duration-1000 ease-in-out"
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

          <PlayerToken position={currentPosition} />
        </div>
      </div>
    </div>
  );
};

export default Board;
