import React, { useEffect, useState, useRef } from "react";
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
  currentDice,
  isMyTurn,
  onRollComplete,
}) => {
  const allTilesInOrder = [
    corners["bottom-right"],
    ...tiles.bottom,
    corners["bottom-left"],
    ...tiles.left,
    corners["top-left"],
    ...tiles.top,
    corners["top-right"],
    ...tiles.right,
  ].map((tile, index) => ({ ...tile, id: `tile-${index}` }));

  const rotationRef = useRef({ z: 0, tiltX: 0, tiltY: 0 });

  const currentPosition =
    players && players[currentPlayerIndex]
      ? players[currentPlayerIndex].position
      : 0;

  const diceSum = currentDice.d1 + currentDice.d2;

  // Tile "wave" animation
  useEffect(() => {
    if (animationStep === "waving") {
      for (let i = 1; i <= diceSum; i++) {
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
  }, [animationStep, currentPosition, diceSum, allTilesInOrder.length]);

  const tileElements = [];

  // Tile rendering logic
  allTilesInOrder.slice(0, 7).forEach((tile, index) => {
    const Component = tile.type === "corner" ? CornerTile : Tile;
    tileElements.push(
      <div style={{ gridRow: 1, gridColumn: index + 1 }} key={tile.id}>
        <Component {...tile} />
      </div>
    );
  });

  allTilesInOrder.slice(7, 12).forEach((tile, index) => {
    tileElements.push(
      <div style={{ gridRow: index + 2, gridColumn: 7 }} key={tile.id}>
        <Tile {...tile} />
      </div>
    );
  });

  allTilesInOrder.slice(12, 19).forEach((tile, index) => {
    const Component = tile.type === "corner" ? CornerTile : Tile;
    tileElements.push(
      <div style={{ gridRow: 7, gridColumn: 7 - index }} key={tile.id}>
        <Component {...tile} />
      </div>
    );
  });

  allTilesInOrder.slice(19, 24).forEach((tile, index) => {
    tileElements.push(
      <div style={{ gridRow: 7 - (index + 1), gridColumn: 1 }} key={tile.id}>
        <Tile {...tile} />
      </div>
    );
  });

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ perspective: "2000px", perspectiveOrigin: "center center" }}
    >
      <div
        className="transition-all duration-800 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="w-full h-full min-w-[80vmin] min-h-[80vmin] aspect-square relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="w-full h-full grid grid-cols-[1.6fr_repeat(5,1fr)_1.6fr] grid-rows-[1.6fr_repeat(5,1fr)_1.6fr]">
            {tileElements}

            <CenterComponent
              currentDice={currentDice}
              isRolling={animationStep === "rotating"}
              onRollComplete={onRollComplete}
              showDice={true}
              currentPlayerIndex={currentPlayerIndex}
              totalPlayers={players.length}
            />
          </div>

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
                diceValue={diceSum}
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
