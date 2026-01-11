import React, { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";
import Board from "./Board";
import { tiles } from "./tiles";
import { useGame } from "../context/GameContext";

const TILES_ON_BOARD =
  tiles.bottom.length +
  tiles.left.length +
  tiles.top.length +
  tiles.right.length +
  4; // four corners

const PLAYER_COLORS = [
  { name: "Red", color: "bg-red-500", borderColor: "border-red-600" },
  { name: "Blue", color: "bg-blue-500", borderColor: "border-blue-600" },
  { name: "Green", color: "bg-green-500", borderColor: "border-green-600" },
  { name: "Yellow", color: "bg-yellow-500", borderColor: "border-yellow-600" },
];

// Tile types that can be purchased
const PURCHASABLE_TYPES = ["property", "railroad", "utility"];

const Game = () => {
  const {
    currentGame,
    currentPlayerId,
    currentRoom,
    rollDice: contextRollDice,
    buyProperty: contextBuyProperty,
    endTurn: contextEndTurn,
    syncGameFromSocket,
  } = useGame();

  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState("idle");

  // Single source of truth for dice values from game state
  const [currentDice, setCurrentDice] = useState({ d1: 1, d2: 1 });
  const [hasRolled, setHasRolled] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [prevPositions, setPrevPositions] = useState({});

  // UI States
  const [_showPropertyCard, setShowPropertyCard] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [_gameLog, setGameLog] = useState([]);

  const botTimerRef = useRef(null);
  const socketRef = useRef(null);
  const prevGameRef = useRef(null);
  const lastPositionsSigRef = useRef("");

  // Helper Functions
  const addLog = (message) => {
    setGameLog((prev) => [
      { id: Date.now(), message, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19), // Keep last 20 logs
    ]);
  };

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Socket connection for real-time updates
  useEffect(() => {
    if (!currentGame || !currentPlayerId) return;

    // Use mock socket if available, otherwise use real socket.io
    const socket = window.__mockIO
      ? window.__mockIO(
          import.meta.env.VITE_BACKEND_URL || "http://localhost:4000",
          { transports: ["websocket"] }
        )
      : io(import.meta.env.VITE_BACKEND_URL || "http://localhost:4000", {
          transports: ["websocket"],
        });

    socketRef.current = socket;

    socket.emit("join-game", currentGame.id, currentPlayerId);

    socket.on("game-updated", (game) => {
      if (game) {
        console.log("🔄 Game updated from socket:", game);
        syncGameFromSocket(game);
      }
    });

    socket.on("turn-changed", () => {
      setHasRolled(false);
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentGame?.id, currentPlayerId, syncGameFromSocket]);

  // Reset hasRolled when turn changes
  useEffect(() => {
    const currentPlayerIndex = currentGame?.currentPlayerIndex;
    if (currentPlayerIndex !== undefined) {
      setHasRolled(false);
    }
  }, [currentGame?.currentPlayerIndex]);

  // Roll Dice + Start Animation
  // Roll Dice - CAPTURE POSITION BEFORE ROLLING
  const rollDice = useCallback(async () => {
    if (isAnimating || hasRolled || isLoadingAction || !currentGame) return;

    try {
      setIsLoadingAction(true);

      // CRITICAL: Capture all player positions BEFORE the roll
      const positionsBeforeRoll = {};
      currentGame.players.forEach((p) => {
        positionsBeforeRoll[p.id] = p.position;
      });

      console.log("Positions BEFORE roll:", positionsBeforeRoll);
      setPrevPositions(positionsBeforeRoll);

      // Now roll the dice (this will update positions on backend)
      const diceRoll = await contextRollDice();

      console.log(
        "Rolled:",
        diceRoll.d1,
        "+",
        diceRoll.d2,
        "=",
        diceRoll.d1 + diceRoll.d2
      );
      // ... rest of your code

      setCurrentDice(diceRoll);
      setAnimationStep("rotating");
      setIsAnimating(true);
      setHasRolled(true);
    } catch (error) {
      showNotification(error.message, "error");
      console.error("Dice roll failed:", error);
    } finally {
      setIsLoadingAction(false);
    }
  }, [isAnimating, hasRolled, isLoadingAction, currentGame, contextRollDice]);

  // End Turn Function
  const endTurn = useCallback(async () => {
    if (isAnimating || isLoadingAction || !currentGame) return;

    try {
      setIsLoadingAction(true);
      await contextEndTurn();
      addLog(
        `${
          currentGame.players[currentGame.currentPlayerIndex]?.name
        }'s turn ended.`
      );
      setHasRolled(false);
    } catch (error) {
      showNotification(error.message, "error");
      console.error("End turn failed:", error);
    } finally {
      setIsLoadingAction(false);
    }
  }, [isAnimating, isLoadingAction, currentGame, contextEndTurn]);

  // Helper to get tile at position
  const getTileAtPosition = (position) => {
    const allTiles = [
      { type: "corner", subType: "go" }, // 0: GO
      ...tiles.bottom, // 1-9
      { type: "corner", subType: "jail" }, // 10: Jail
      ...tiles.right, // 11-19
      { type: "corner", subType: "free-parking" }, // 20: Free Parking
      ...tiles.top, // 21-29
      { type: "corner", subType: "go-to-jail" }, // 30: Go to Jail
      ...tiles.left, // 31-39
    ];
    return allTiles[position] || null;
  };

  // Helper function to check if property can be bought
  const canBuyProperty = () => {
    if (!currentGame || !isMyTurn || !hasRolled) return false;

    const player = currentGame.players?.[currentGame.currentPlayerIndex];
    if (!player) return false;

    const tileIndex = player.position;
    const tile = getTileAtPosition(tileIndex);

    // Check if tile is a purchasable type
    if (!tile || !PURCHASABLE_TYPES.includes(tile.type)) {
      return false;
    }

    // Check if property is already owned
    const isOwned = currentGame.properties?.some(
      (p) => p.propertyId === tileIndex
    );
    if (isOwned) {
      return false;
    }

    // Check if player has enough money
    if (player.money < tile.price) {
      return false;
    }

    return true;
  };

  // Buy Property Function
  const buyProperty = useCallback(async () => {
    if (!currentGame) return;

    const player = currentGame.players?.[currentGame.currentPlayerIndex];
    if (!player) return;

    const tileIndex = player.position;
    const tile = getTileAtPosition(tileIndex);

    // Check if tile is purchasable
    if (!tile || !PURCHASABLE_TYPES.includes(tile.type)) {
      showNotification("This property cannot be purchased!", "error");
      return;
    }

    // Check if property is already owned
    const isOwned = currentGame.properties?.some(
      (p) => p.propertyId === tileIndex
    );
    if (isOwned) {
      showNotification("This property is already owned!", "error");
      return;
    }

    if (player.money < tile.price) {
      showNotification("Not enough money!", "error");
      return;
    }

    try {
      setIsLoadingAction(true);
      await contextBuyProperty(tileIndex);
      addLog(
        `${player.name} bought property "${tile.title}" for $${tile.price}`
      );
      showNotification(`Property purchased for $${tile.price}!`, "success");
    } catch (error) {
      showNotification(error.message, "error");
      console.error("Buy property failed:", error);
    } finally {
      setIsLoadingAction(false);
    }
  }, [currentGame, contextBuyProperty]);

  // Bot auto-play removed to prevent unintended rolls on other players' turns
  // Sync dice animation across all players in room
  useEffect(() => {
    if (!currentGame || !currentGame.lastDiceRoll) return;

    // Check if we already displayed this dice roll
    if (
      currentDice.d1 === currentGame.lastDiceRoll.d1 &&
      currentDice.d2 === currentGame.lastDiceRoll.d2
    ) {
      return; // Already displayed
    }

    // New dice roll detected - show it for all players
    setCurrentDice({
      d1: currentGame.lastDiceRoll.d1,
      d2: currentGame.lastDiceRoll.d2,
    });
    setAnimationStep("rotating");
    setIsAnimating(true);
  }, [currentGame?.lastDiceRoll]);

  // Sync player position changes from backend -> drive animation with previous positions
  useEffect(() => {
    if (!currentGame?.players) return;

    const nextSig = currentGame.players.map((p) => p.position).join("-");
    const prevSig = lastPositionsSigRef.current;

    if (!prevGameRef.current) {
      prevGameRef.current = currentGame;
      lastPositionsSigRef.current = nextSig;
      return;
    }

    // Detect any movement from the previous game snapshot
    const movedPlayers = currentGame.players.filter((p) => {
      const prevPlayer = prevGameRef.current.players?.find(
        (pp) => pp.id === p.id
      );
      return prevPlayer && prevPlayer.position !== p.position;
    });

    if (nextSig !== prevSig && movedPlayers.length > 0) {
      // Capture previous positions for all players to drive animation start
      const prevPositionsMap = {};
      currentGame.players.forEach((p) => {
        const prevPlayer = prevGameRef.current.players?.find(
          (pp) => pp.id === p.id
        );
        prevPositionsMap[p.id] = prevPlayer ? prevPlayer.position : p.position;
      });

      setPrevPositions(prevPositionsMap);

      // Use latest dice from game if present
      if (currentGame.lastDiceRoll) {
        setCurrentDice({
          d1: currentGame.lastDiceRoll.d1,
          d2: currentGame.lastDiceRoll.d2,
        });
      }

      setAnimationStep("rotating");
      setIsAnimating(true);
      setHasRolled(true);
    }

    prevGameRef.current = currentGame;
    lastPositionsSigRef.current = nextSig;
  }, [currentGame]);
  // Handle Animation Steps
  useEffect(() => {
    if (!isAnimating || !currentGame) return;
    let timeout;
    const diceSum = currentDice.d1 + currentDice.d2;

    console.log("Animation step:", animationStep, "Dice sum:", diceSum);

    // 1. Dice Rotate Stage
    if (animationStep === "rotating") {
      const rotationDuration = 1000;
      timeout = setTimeout(() => setAnimationStep("waving"), rotationDuration);
    }

    // 2. Token "waving" animation (shake) before moving
    else if (animationStep === "waving") {
      const waveDuration = diceSum * 100 + 500;

      timeout = setTimeout(() => {
        // Movement is handled by backend via rollDice
        // Just update animation
        setAnimationStep("zooming");
      }, waveDuration);
    }

    // 3. Camera zoom animation
    else if (animationStep === "zooming") {
      const zoomDuration = 1200;
      timeout = setTimeout(() => {
        setIsAnimating(false);
        setAnimationStep("idle");
      }, zoomDuration);
    }

    return () => clearTimeout(timeout);
  }, [animationStep, currentDice, isAnimating, currentGame, currentPlayerId]);

  // Determine current player and turn state
  const currentPlayer = currentGame?.players?.[currentGame?.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === currentPlayerId;

  // Loading state or not in game
  if (!currentRoom || !currentGame) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800 mb-4">
            Loading game...
          </p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Main Game UI
  return (
    <div className="w-screen h-screen flex items-center justify-center p-4 bg-[#1D1D1D]">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold animate-pulse ${
            notification.type === "success"
              ? "bg-green-500"
              : notification.type === "error"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="w-full h-full flex gap-4">
        {/* Left Sidebar - Players */}
        <div className="w-56 bg-[#3C4848] rounded-xl shadow-xl p-4 overflow-y-auto flex flex-col gap-3">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
            Players
          </h2>

          {currentGame.players.map((p, index) => (
            <div
              key={p.id}
              className={`p-3 rounded-lg border-2 transition-all ${
                index === currentGame.currentPlayerIndex
                  ? "bg-yellow-50 border-yellow-400 shadow-md scale-105"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-6 h-6 rounded-full ${p.color} border-2 border-gray-800`}
                />
                <span className="font-bold text-lg">
                  {p.name}
                  {p.id === currentPlayerId ? " (You)" : ""}
                </span>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold text-green-700">💰 ${p.money}</p>
                <p>📍 Position {p.position}</p>
                <p>🏠 Properties: {p.properties?.length || 0}</p>
              </div>
            </div>
          ))}

          {/* Game Log */}
          <div className="mt-4 border-t pt-3">
            <h3 className="font-bold text-sm text-gray-700 mb-2">Game Log</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto text-xs">
              {_gameLog.map((log) => (
                <div key={log.id} className="text-gray-600">
                  <span className="text-gray-400">{log.time}</span> -{" "}
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 overflow-hidden ">
          <Board
            isAnimating={isAnimating}
            animationStep={animationStep}
            players={currentGame.players}
            currentPlayerIndex={currentGame.currentPlayerIndex}
            currentDice={currentDice}
            isMyTurn={isMyTurn}
            hasRolled={hasRolled}
            onRollDice={rollDice}
            onEndTurn={endTurn}
            onRollComplete={() => {
              if (animationStep === "rotating") {
                setAnimationStep("waving");
              }
            }}
            onTileClick={({ tile, index }) =>
              setShowPropertyCard({ tile, index })
            }
            prevPositions={prevPositions}
          />

          {/* Dice + Controls Panel - Now inside Board center component */}
        </div>

        {/* Right Sidebar - Actions & Info */}
        <div className="w-72 bg-white rounded-xl shadow-xl p-4 flex flex-col gap-4">
          <div className="border-b pb-2">
            <h3 className="font-bold text-xl text-gray-800">Actions</h3>
          </div>

          {/* Property Actions */}
          <div className="space-y-2">
            <button
              onClick={buyProperty}
              disabled={!canBuyProperty() || isLoadingAction}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                canBuyProperty() && !isLoadingAction
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-md hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isLoadingAction ? "Processing..." : "🏠 Buy Property"}
            </button>

            <button
              disabled={!isMyTurn}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                isMyTurn
                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              🏗️ Build House
            </button>

            <button
              onClick={() => setShowTradeModal(true)}
              disabled={!isMyTurn}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                isMyTurn
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              🤝 Trade
            </button>

            <button
              disabled={!isMyTurn}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                isMyTurn
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              💰 Mortgage
            </button>
          </div>

          {/* Current Player Info */}
          <div className="border-t pt-3 space-y-3">
            <h4 className="font-bold text-gray-700">Current Property</h4>
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p className="font-semibold">
                Position: {currentPlayer?.position}
              </p>
              <p className="text-gray-600 mt-1">
                {currentPlayer?.properties?.includes(currentPlayer?.position)
                  ? "✅ You own this!"
                  : currentGame.players.some((p) =>
                      p.properties?.includes(currentPlayer?.position)
                    )
                  ? "❌ Owned by another player"
                  : "Available for purchase"}
              </p>
            </div>
          </div>

          {/* Player Portfolio */}
          <div className="border-t pt-3 flex-1 overflow-y-auto">
            <h4 className="font-bold text-gray-700 mb-2">Your Properties</h4>
            <div className="space-y-2">
              {currentPlayer?.properties?.length > 0 ? (
                currentPlayer.properties.map((tile) => (
                  <div
                    key={tile}
                    className="bg-blue-50 p-2 rounded border border-blue-200 text-sm"
                  >
                    <span className="font-semibold">Property #{tile}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm italic">
                  No properties yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Trade with Players</h2>
              <button
                onClick={() => setShowTradeModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Your Offer */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2">Your Offer</h3>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Money amount"
                      className="w-full p-2 border rounded"
                    />
                    <div className="text-sm text-gray-600">
                      Select properties to trade
                    </div>
                  </div>
                </div>

                {/* Their Offer */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2">Request</h3>
                  <select className="w-full p-2 border rounded mb-2">
                    <option>Select player...</option>
                    {currentGame.players
                      .filter((p) => p.id !== currentPlayer?.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowTradeModal(false)}
                  className="px-6 py-2 bg-gray-300 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600">
                  Propose Trade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
