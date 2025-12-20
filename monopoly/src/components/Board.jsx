import React, { useEffect, useRef } from "react";
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
  hasRolled,
  onRollDice,
  onEndTurn,
}) => {
  // ────────────────────────────────
  // Flatten all tiles in board order (starting from GO at top-left)
  // ────────────────────────────────
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

  const currentPosition =
    players && players[currentPlayerIndex]
      ? players[currentPlayerIndex].position
      : 0;

  const diceSum = currentDice.d1 + currentDice.d2;

  const getOwnerColorForTile = (tileIndex) => {
    if (!players) return null;
    for (const player of players) {
      if (player.ownedTiles?.includes(tileIndex)) return player.color;
    }
    return null;
  };

  // ────────────────────────────────
  // Wave animation
  // ────────────────────────────────
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

  // ────────────────────────────────
  // Dynamic tile positions (rotated 180°: GO at top-left)
  // ────────────────────────────────
  const boardSize = 11; // 11×11 grid for full Monopoly board
  const tileElements = allTilesInOrder.map((tile, index) => {
    let row = 0;
    let col = 0;

    // Top row (GO starts here)
    if (index <= 10) {
      row = 1;
      col = index + 1;
    }
    // Right column
    else if (index <= 20) {
      row = index - 10 + 1;
      col = boardSize;
    }
    // Bottom row
    else if (index <= 30) {
      row = boardSize;
      col = boardSize - (index - 20);
    }
    // Left column
    else {
      row = boardSize - (index - 30);
      col = 1;
    }

    const Component = tile.type === "corner" ? CornerTile : Tile;
    const ownerColor = getOwnerColorForTile(index)?.color;

    return (
      <div style={{ gridRow: row, gridColumn: col }} key={tile.id}>
        <Component {...tile} ownedBy={ownerColor} />
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
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="w-full h-full min-w-[92vmin] min-h-[92vmin] aspect-square relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className={`w-full h-full grid`}
            style={{
              gridTemplateRows: "1.6fr repeat(9, 1fr) 1.6fr",
              gridTemplateColumns: "1.6fr repeat(9, 1fr) 1.6fr",
            }}
          >
            {tileElements}
            <CenterComponent
              currentDice={currentDice}
              isRolling={animationStep === "rotating"}
              onRollComplete={onRollComplete}
              showDice={true}
              currentPlayerIndex={currentPlayerIndex}
              totalPlayers={players.length}
              hasRolled={hasRolled}
              isMyTurn={isMyTurn}
              isAnimating={isAnimating}
              onRollDice={onRollDice}
              onEndTurn={onEndTurn}
              currentPlayer={players[currentPlayerIndex]}
            />
          </div>

          {players?.map((player, index) => (
            <PlayerToken
              key={player.id}
              position={player.position}
              color={player.color}
              isCurrentPlayer={index === currentPlayerIndex}
              playerCount={players.length}
              playerIndex={index}
              animationStep={animationStep}
              diceValue={diceSum}
              currentPosition={player.position}
              tilesCount={allTilesInOrder.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
