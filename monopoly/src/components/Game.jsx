import React, { useState, useEffect, useCallback, useRef } from "react";
import Board from "./Board";
import { tiles } from "./tiles";

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

const Game = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState("idle");

  // Single source of truth for dice values
  const [currentDice, setCurrentDice] = useState({ d1: 1, d2: 1 });
  const [hasRolled, setHasRolled] = useState(false);

  // UI States
  const [showPropertyCard, setShowPropertyCard] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [gameLog, setGameLog] = useState([]);

  const botTimerRef = useRef(null);

  // -----------------------------
  // Helper Functions
  // -----------------------------
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

  // -----------------------------
  // Initialize Game
  // -----------------------------
  const startGame = () => {
    const initialPlayers = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      name: i === 0 ? "You" : `Bot ${i}`,
      position: 0,
      money: 1500,
      color: PLAYER_COLORS[i],
      properties: [],
      ownedTiles: [],
      isBot: i !== 0,
      inJail: false,
      jailTurns: 0,
    }));
    setPlayers(initialPlayers);
    setCurrentPlayerIndex(0);
    setGameStarted(true);
    addLog("Game started! Roll the dice to begin.");
  };

  // -----------------------------
  // Roll Dice + Start Animation
  // -----------------------------
  const rollDice = useCallback(() => {
    if (isAnimating || !gameStarted || hasRolled) return;

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;

    console.log("Rolling dice:", d1, "+", d2, "=", d1 + d2);
    addLog(
      `${players[currentPlayerIndex]?.name} rolled ${d1} + ${d2} = ${d1 + d2}`
    );

    setCurrentDice({ d1, d2 });
    setAnimationStep("rotating");
    setIsAnimating(true);
    setHasRolled(true);
  }, [isAnimating, gameStarted, hasRolled, players, currentPlayerIndex]);

  // -----------------------------
  // End Turn Function
  // -----------------------------
  const endTurn = useCallback(() => {
    if (isAnimating) return;

    addLog(`${players[currentPlayerIndex]?.name}'s turn ended.`);
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setHasRolled(false);
  }, [isAnimating, players, currentPlayerIndex]);

  // -----------------------------
  // Buy Property Function
  // -----------------------------
  const buyProperty = useCallback(() => {
    const player = players[currentPlayerIndex];
    const tileIndex = player.position;

    // Check if property is already owned
    const isOwned = players.some((p) => p.ownedTiles?.includes(tileIndex));

    if (isOwned) {
      showNotification("This property is already owned!", "error");
      return;
    }

    const price = 200; // Simplified pricing

    if (player.money < price) {
      showNotification("Not enough money!", "error");
      return;
    }

    setPlayers((prev) =>
      prev.map((p, i) =>
        i === currentPlayerIndex
          ? {
              ...p,
              money: p.money - price,
              ownedTiles: [...(p.ownedTiles || []), tileIndex],
            }
          : p
      )
    );

    addLog(
      `${player.name} bought property at position ${tileIndex} for $${price}`
    );
    showNotification(`Property purchased for $${price}!`, "success");
  }, [players, currentPlayerIndex]);

  // -----------------------------
  // Bot Auto-Play Logic
  // -----------------------------
  useEffect(() => {
    if (!gameStarted || !players.length) return;

    const currentPlayer = players[currentPlayerIndex];

    if (currentPlayer?.isBot && !isAnimating && !hasRolled) {
      botTimerRef.current = setTimeout(() => {
        rollDice();
      }, 1500);
    }

    // Bot auto-ends turn after rolling
    if (currentPlayer?.isBot && hasRolled && !isAnimating) {
      botTimerRef.current = setTimeout(() => {
        // Bot randomly buys properties 50% of the time
        if (Math.random() > 0.5) {
          buyProperty();
        }
        setTimeout(() => endTurn(), 1000);
      }, 2000);
    }

    return () => {
      if (botTimerRef.current) {
        clearTimeout(botTimerRef.current);
        botTimerRef.current = null;
      }
    };
  }, [
    currentPlayerIndex,
    gameStarted,
    players,
    isAnimating,
    hasRolled,
    rollDice,
    endTurn,
    buyProperty,
  ]);

  // -----------------------------
  // Handle Animation Steps
  // -----------------------------
  useEffect(() => {
    if (!isAnimating) return;

    let timeout;
    const currentPlayer = players[currentPlayerIndex];
    const isMyTurn = currentPlayer && !currentPlayer.isBot;
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
        // Move Player using dice sum
        setPlayers((prev) => {
          const updated = [...prev];
          const current = updated[currentPlayerIndex];
          const newPos = (current.position + diceSum) % TILES_ON_BOARD;

          const passedGo = newPos < current.position;

          console.log(
            `Moving player ${current.name} from ${current.position} to ${newPos} (rolled ${diceSum})`
          );

          updated[currentPlayerIndex] = {
            ...current,
            position: newPos,
            money: current.money + (passedGo ? 200 : 0),
          };

          if (passedGo) {
            addLog(`${current.name} passed GO! Collected $200`);
          }

          return updated;
        });

        setAnimationStep("zooming");
      }, waveDuration);
    }

    // 3. Camera zoom animation
    else if (animationStep === "zooming") {
      const zoomDuration = 1200;
      timeout = setTimeout(() => {
        setIsAnimating(false);
        setAnimationStep("idle");

        // Don't auto-advance turn - player must click "End Turn"
      }, zoomDuration);
    }

    return () => clearTimeout(timeout);
  }, [animationStep, currentDice, currentPlayerIndex, isAnimating, players]);

  // -----------------------------
  // Before Game Start Screen
  // -----------------------------
  if (!gameStarted) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
          <h1 className="text-4xl font-bold text-center mb-8 text-green-800">
            Monopoly Game
          </h1>

          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4 text-gray-700">
              Number of Players:
            </label>

            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumPlayers(num)}
                  className={`py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                    numPlayers === num
                      ? "bg-green-600 text-white shadow-lg scale-105"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-4 bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = currentPlayer && !currentPlayer.isBot;

  // -----------------------------
  // Main Game UI
  // -----------------------------
  return (
    <div className="w-screen h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
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

      <div className="w-full h-full  flex gap-4">
        {/* Left Sidebar - Players */}
        <div className="w-64 bg-white rounded-xl shadow-xl p-4 overflow-y-auto flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
            Players
          </h2>

          {players.map((p, index) => (
            <div
              key={p.id}
              className={`p-3 rounded-lg border-2 transition-all ${
                index === currentPlayerIndex
                  ? "bg-yellow-50 border-yellow-400 shadow-md scale-105"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-6 h-6 rounded-full ${p.color.color} border-2 ${p.color.borderColor}`}
                />
                <span className="font-bold text-lg">
                  {p.name}
                  {p.isBot && " 🤖"}
                </span>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold text-green-700">💰 ${p.money}</p>
                <p>📍 Position {p.position}</p>
                <p>🏠 Properties: {p.ownedTiles?.length || 0}</p>
              </div>
            </div>
          ))}

          {/* Game Log */}
          <div className="mt-4 border-t pt-3">
            <h3 className="font-bold text-sm text-gray-700 mb-2">Game Log</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto text-xs">
              {gameLog.map((log) => (
                <div key={log.id} className="text-gray-600">
                  <span className="text-gray-400">{log.time}</span> -{" "}
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 ">
          <Board
            isAnimating={isAnimating}
            animationStep={animationStep}
            players={players}
            currentPlayerIndex={currentPlayerIndex}
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
              disabled={!isMyTurn || !hasRolled || isAnimating}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                isMyTurn && hasRolled && !isAnimating
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-md hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              🏠 Buy Property
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
                {currentPlayer?.ownedTiles?.includes(currentPlayer?.position)
                  ? "✅ You own this!"
                  : players.some((p) =>
                      p.ownedTiles?.includes(currentPlayer?.position)
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
              {currentPlayer?.ownedTiles?.length > 0 ? (
                currentPlayer.ownedTiles.map((tile) => (
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
                    {players
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
