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
  currentTurnIndex,
  currentDice,
  isMyTurn,
  onRollComplete,
  hasRolled,
  onRollDice,
  onEndTurn,
  onTileClick,
  prevPositions = {},
  currentGame,
}) => {
  const getTileColorClass = (group) => {
    const colorMap = {
      "dark-purple": "bg-purple-600",
      "light-blue": "bg-cyan-400",
      pink: "bg-rose-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
      yellow: "bg-amber-400",
      green: "bg-emerald-500",
      "dark-blue": "bg-blue-600",
      railroad: "bg-slate-800",
      utility: "bg-gray-500",
    };
    return colorMap[group] || "bg-gray-500";
  };

  const [activeIndex, setActiveIndex] = React.useState(null);
  const gridRef = useRef(null);
  const [popoverPos, setPopoverPos] = React.useState(null);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);
  const [boardScale, setBoardScale] = React.useState(1);
  const mobileScrollRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth < 1024);
        // Scale board to fit screen width if smaller than 640px
        if (window.innerWidth < 640) {
            setBoardScale(window.innerWidth / 640);
        } else {
            setBoardScale(1);
        }
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll to current player on mobile
  useEffect(() => {
    if (isMobile && mobileScrollRef.current && players && players.length > 0) {
       // Find scroll target - prioritize active player
       const activePlayer = players[currentTurnIndex];
       if (activePlayer) {
          const tileEl = document.getElementById(`mobile-tile-${activePlayer.position}`);
          if (tileEl) {
             tileEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
       }
    }
  }, [isMobile, currentTurnIndex, players, animationStep]);

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

  // Get properties array from game state for direct ownership check
  const propertiesFromGame = currentGame?.properties || [];

  // Get the current player's position (where they're landing)
  const currentPlayer = players && players[currentTurnIndex];
  const currentPlayerPosition = currentPlayer ? currentPlayer.position : -1;

  const getOwnerColorForTile = (tileIndex) => {
    // Don't show ownership colors for the currently moving player's position
    // until the animation is complete (animationStep === "idle")
    if (
      isAnimating &&
      animationStep !== "idle" &&
      tileIndex === currentPlayerPosition
    ) {
      return null;
    }

    // First check the properties array directly from game state
    const propertyEntry = propertiesFromGame.find(
      (prop) => prop.tileIndex === tileIndex || prop.propertyId === tileIndex
    );

    if (propertyEntry && players) {
      const ownerId =
        propertyEntry.ownerId || propertyEntry.owner || propertyEntry.playerId;
      const ownerPlayer = players.find((p) => p.id === ownerId);

      if (ownerPlayer) {
        // Find player's index in the players array
        const playerIndex = players.indexOf(ownerPlayer);

        // Get color from palette based on player index (not from player object)
        const PLAYER_COLORS = [
          {
            name: "Red",
            color: "bg-red-500",
            borderColor: "border-red-700",
            glow: "rgba(239,68,68,0.6)",
          },
          {
            name: "Blue",
            color: "bg-blue-500",
            borderColor: "border-blue-700",
            glow: "rgba(59,130,246,0.6)",
          },
          {
            name: "Green",
            color: "bg-green-500",
            borderColor: "border-green-700",
            glow: "rgba(34,197,94,0.6)",
          },
          {
            name: "Yellow",
            color: "bg-yellow-400",
            borderColor: "border-yellow-600",
            glow: "rgba(245,158,11,0.65)",
          },
        ];

        const playerColor = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
        return playerColor;
      }
    }

    // Fallback: check ownedTiles array on players
    for (const player of players) {
      if (player.ownedTiles?.includes(tileIndex)) {
        const playerIndex = players.indexOf(player);
        const PLAYER_COLORS = [
          {
            color: "bg-red-500",
            borderColor: "border-red-700",
            glow: "rgba(239,68,68,0.6)",
          },
          {
            color: "bg-blue-500",
            borderColor: "border-blue-700",
            glow: "rgba(59,130,246,0.6)",
          },
          {
            color: "bg-green-500",
            borderColor: "border-green-700",
            glow: "rgba(34,197,94,0.6)",
          },
          {
            color: "bg-yellow-400",
            borderColor: "border-yellow-600",
            glow: "rgba(245,158,11,0.65)",
          },
        ];
        return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
      }
      if (player.properties?.includes(tileIndex)) {
        const playerIndex = players.indexOf(player);
        const PLAYER_COLORS = [
          {
            color: "bg-red-500",
            borderColor: "border-red-700",
            glow: "rgba(239,68,68,0.6)",
          },
          {
            color: "bg-blue-500",
            borderColor: "border-blue-700",
            glow: "rgba(59,130,246,0.6)",
          },
          {
            color: "bg-green-500",
            borderColor: "border-green-700",
            glow: "rgba(34,197,94,0.6)",
          },
          {
            color: "bg-yellow-400",
            borderColor: "border-yellow-600",
            glow: "rgba(245,158,11,0.65)",
          },
        ];
        return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
      }
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
    const ownerColor = getOwnerColorForTile(index);

    const handleClick = (e) => {
      setActiveIndex(index);

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
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <div 
        className={`relative aspect-square shrink-0 m-auto transition-transform duration-300 origin-center ${!isMobile ? 'min-w-[600px] min-h-[600px] w-[100vmin] h-[100vmin] lg:w-full lg:h-full lg:min-w-0 lg:min-h-0' : ''}`}
        style={isMobile ? {
            transform: `scale(${boardScale})`,
            width: '640px',
            height: '640px',
        } : {}}
      >
        <div
          ref={gridRef}
          className="w-full h-full grid relative"
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
