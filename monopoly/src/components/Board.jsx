import React, { useEffect, useRef } from "react";
import { tiles, corners } from "./tiles.js";
import Tile from "./Tile";
import CornerTile from "./CornerTile";
import CenterComponent from "./CenterComponent.jsx";
import PlayerToken from "./PlayerToken.jsx";
import PopoverCard from "./PopoverCard.jsx";

const Board = ({
  isAnimating,
  animationStep,
  players,
  currentTurnIndex,
  currentDice,
  isMyTurn,
  onRollComplete,
  hasRolled,
  onRollDice,
  onEndTurn,
  onTileClick,
  prevPositions = {},
}) => {
  const [activeIndex, setActiveIndex] = React.useState(null);
  const gridRef = useRef(null);
  const [popoverPos, setPopoverPos] = React.useState(null);
  // ────────────────────────────────
  // Flatten all tiles in board order (starting from GO at top-left)
  // If your intended "top" side content is currently in tiles.bottom,
  // we render tiles.bottom on the top row and tiles.top on the bottom row.
  // ────────────────────────────────
  const allTilesInOrder = [
    corners["top-left"],
    ...tiles.bottom, // render this immediately after GO on the top row
    corners["top-right"],
    ...tiles.right,
    corners["bottom-right"],
    ...tiles.top, // render this on the bottom row
    corners["bottom-left"],
    ...tiles.left,
  ].map((tile, index) => ({ ...tile, id: `tile-${index}` }));

  const currentPosition =
    players && players[currentTurnIndex]
      ? players[currentTurnIndex].position
      : 0;

  const tilesCount = allTilesInOrder.length;

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
      if (!players?.length) return;

      // Find the player who actually moved (actor)
      const actor = players.find((p) => {
        const prev = prevPositions?.[p.id] ?? p.position ?? 0;
        const delta = (p.position - prev + tilesCount) % tilesCount;
        return delta > 0;
      });

      if (!actor) return;

      const startPos = prevPositions?.[actor.id] ?? actor.position ?? 0;
      const steps = (actor.position - startPos + tilesCount) % tilesCount;

      for (let i = 1; i <= steps; i++) {
        const tileIndex = (startPos + i) % tilesCount;
        const tileElement = document.getElementById(`tile-${tileIndex}`);
        if (tileElement) {
          tileElement.style.animation = "none";
          void tileElement.offsetWidth;
          tileElement.style.animation = `wave 0.5s ease-in-out forwards`;
          tileElement.style.animationDelay = `${i * 0.1}s`;
        }
      }
    }
  }, [
    animationStep,
    currentPosition,
    tilesCount,
    players,
    currentTurnIndex,
    prevPositions,
  ]);

  // ────────────────────────────────
  // Close popover on outside click
  // ────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeIndex === null) return;

      // Check if the click is on a popover or within the board
      const popoverElement = document.querySelector(".popover-card");
      const boardElement = gridRef.current;

      // If popover exists and click is outside both popover and tiles, close it
      if (
        popoverElement &&
        !popoverElement.contains(event.target) &&
        boardElement &&
        !boardElement.contains(event.target)
      ) {
        setActiveIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeIndex]);

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
      row = index - 30 + 1;
      col = 1;
    }

    const Component = tile.type === "corner" ? CornerTile : Tile;
    const ownerColor = getOwnerColorForTile(index)?.color;

    const handleClick = (e) => {
      setActiveIndex(index);

      // Calculate popover position based on tile location
      const tileElement = e.currentTarget;
      const boardElement = gridRef.current;

      if (tileElement && boardElement) {
        const tileRect = tileElement.getBoundingClientRect();
        const boardRect = boardElement.getBoundingClientRect();

        // Calculate relative position within the board
        const relativeLeft = tileRect.left - boardRect.left;
        const relativeTop = tileRect.top - boardRect.top;

        // Determine which side of the board the tile is on
        let side, left, top, transform;

        // Top row
        if (index <= 10) {
          side = "bottom";
          left = relativeLeft + tileRect.width / 2;
          top = relativeTop + tileRect.height;
          transform = "translate(-50%, 8px)";
        }
        // Right column
        else if (index <= 20) {
          side = "left";
          left = relativeLeft;
          top = relativeTop + tileRect.height / 2;
          transform = "translate(-100%, -50%) translateX(-8px)";
        }
        // Bottom row
        else if (index <= 30) {
          side = "top";
          left = relativeLeft + tileRect.width / 2;
          top = relativeTop;
          transform = "translate(-50%, -100%) translateY(-8px)";
        }
        // Left column
        else {
          side = "right";
          left = relativeLeft + tileRect.width;
          top = relativeTop + tileRect.height / 2;
          transform = "translate(8px, -50%)";
        }

        setPopoverPos({ left, top, side, transform });
      }

      if (typeof onTileClick === "function") {
        onTileClick({ tile: allTilesInOrder[index], index });
      }
    };

    return (
      <div
        style={{ gridRow: row, gridColumn: col }}
        key={tile.id}
        onClick={handleClick}
        className="cursor-pointer"
      >
        <Component {...tile} ownedBy={ownerColor} />
      </div>
    );
  });

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-full h-full aspect-square overflow-hidden">
        <div
          ref={gridRef}
          className="w-full h-full grid relative"
          style={{
            gridTemplateRows: "1.6fr repeat(9, 1fr) 1.6fr",
            gridTemplateColumns: "1.6fr repeat(9, 1fr) 1.6fr",
          }}
        >
          {tileElements}
          {popoverPos && activeIndex !== null && (
            <div
              className="absolute z-70"
              style={{
                left: popoverPos.left,
                top: popoverPos.top,
                transform: popoverPos.transform,
              }}
            >
              <PopoverCard
                tile={allTilesInOrder[activeIndex]}
                side={popoverPos.side}
                onClose={() => setActiveIndex(null)}
              />
            </div>
          )}
          <CenterComponent
            currentDice={currentDice}
            isRolling={animationStep === "rotating"}
            onRollComplete={onRollComplete}
            showDice={true}
            currentTurnIndex={currentTurnIndex}
            totalPlayers={players.length}
            hasRolled={hasRolled}
            isMyTurn={isMyTurn}
            isAnimating={isAnimating}
            onRollDice={onRollDice}
            onEndTurn={onEndTurn}
            currentPlayer={players[currentTurnIndex]}
          />
        </div>

        {players?.map((player, index) => {
          const prevPos = prevPositions?.[player.id] ?? player.position ?? 0;
          const steps = (player.position - prevPos + tilesCount) % tilesCount;
          const isAnimatingPlayer =
            (animationStep === "rotating" || animationStep === "waving") &&
            steps > 0;

          return (
            <PlayerToken
              key={player.id}
              position={player.position}
              color={player.color}
              isAnimatingPlayer={isAnimatingPlayer}
              isCurrentPlayer={index === currentTurnIndex}
              playerCount={players.length}
              playerIndex={index}
              animationStep={animationStep}
              startPosition={prevPos}
              moveSteps={steps}
              tilesCount={tilesCount}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Board;
