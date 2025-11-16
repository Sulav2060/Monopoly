import React, { useState, useEffect, useCallback, useRef } from "react";
import Board from "./Board";

const TILES_ON_BOARD = 24;

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

  const [diceValue, setDiceValue] = useState(0);
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);

  const botTimerRef = useRef(null);

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
      isBot: i !== 0, // Player 1 (index 0) is human
    }));
    setPlayers(initialPlayers);
    setCurrentPlayerIndex(0);
    setGameStarted(true);
  };

  // -----------------------------
  // Roll Dice + Start Animation
  // -----------------------------
  const rollDice = useCallback(() => {
    if (isAnimating || !gameStarted) return;

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;

    setDice1(d1);
    setDice2(d2);
    setDiceValue(d1 + d2);

    setAnimationStep("rotating");
    setIsAnimating(true);
  }, [isAnimating, gameStarted]);

  // -----------------------------
  // Bot Auto-Play Logic
  // -----------------------------
  useEffect(() => {
    if (!gameStarted || !players.length) return;

    const currentPlayer = players[currentPlayerIndex];

    // If it's a bot's turn and not animating, schedule auto-roll
    if (currentPlayer?.isBot && !isAnimating) {
      botTimerRef.current = setTimeout(() => {
        rollDice();
      }, 5000); // 5 seconds delay for bots
    }

    return () => {
      if (botTimerRef.current) {
        clearTimeout(botTimerRef.current);
        botTimerRef.current = null;
      }
    };
  }, [currentPlayerIndex, gameStarted, players, isAnimating, rollDice]);

  // -----------------------------
  // Handle Animation Steps
  // -----------------------------
  useEffect(() => {
    if (!isAnimating) return;

    let timeout;
    const currentPlayer = players[currentPlayerIndex];
    const isMyTurn = currentPlayer && !currentPlayer.isBot;

    // 1. Dice Rotate Stage (only for human player)
    if (animationStep === "rotating") {
      const rotationDuration = isMyTurn ? 1000 : 0; // Skip rotation for bots
      timeout = setTimeout(() => setAnimationStep("waving"), rotationDuration);
    }

    // 2. Token "waving" animation (shake) before moving
    else if (animationStep === "waving") {
      const waveDuration = diceValue * 100 + 500;

      timeout = setTimeout(() => {
        // Move Player
        setPlayers((prev) => {
          const updated = [...prev];
          const current = updated[currentPlayerIndex];
          const newPos = (current.position + diceValue) % TILES_ON_BOARD;

          const passedGo = newPos < current.position;

          updated[currentPlayerIndex] = {
            ...current,
            position: newPos,
            money: current.money + (passedGo ? 200 : 0),
          };

          return updated;
        });

        setAnimationStep("zooming");
      }, waveDuration);
    }

    // 3. Camera zoom animation (only for human player)
    else if (animationStep === "zooming") {
      const zoomDuration = isMyTurn ? 1200 : 0; // Skip zoom for bots
      timeout = setTimeout(() => {
        setIsAnimating(false);
        setAnimationStep("idle");

        // Advance turn safely
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
      }, zoomDuration);
    }

    return () => clearTimeout(timeout);
  }, [animationStep, diceValue, currentPlayerIndex, isAnimating, players]);

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
      <div className="w-full h-full max-w-7xl flex gap-4">
        {/* Player Sidebar */}
        <div className="w-64 bg-white rounded-xl shadow-xl p-4 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Players</h2>

          {players.map((p, index) => (
            <div
              key={p.id}
              className={`mb-3 p-3 rounded-lg border-2 transition-all ${
                index === currentPlayerIndex
                  ? "bg-yellow-50 border-yellow-400 shadow-md"
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

              <div className="text-sm text-gray-600">
                <p>Position: {p.position}</p>
                <p className="font-semibold text-green-700">
                  Money: ${p.money}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Game Board */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Board
            isAnimating={isAnimating}
            animationStep={animationStep}
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            diceValue={diceValue}
            isMyTurn={isMyTurn}
          />

          {/* Dice + Turn Button */}
          <div className="bg-white rounded-xl shadow-xl p-6 flex items-center gap-6">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-white border-4 border-gray-800 rounded-lg flex items-center justify-center text-3xl font-bold">
                {dice1}
              </div>
              <div className="w-16 h-16 bg-white border-4 border-gray-800 rounded-lg flex items-center justify-center text-3xl font-bold">
                {dice2}
              </div>
            </div>

            <button
              onClick={rollDice}
              disabled={isAnimating || !isMyTurn}
              className={`px-8 py-4 font-bold text-lg rounded-lg shadow-lg transition-all ${
                isAnimating || !isMyTurn
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : `${currentPlayer.color.color} text-white hover:opacity-90 transform hover:scale-105`
              }`}
            >
              {isAnimating
                ? "Moving..."
                : isMyTurn
                ? "Roll Dice"
                : `${currentPlayer.name} is thinking...`}
            </button>
          </div>
        </div>

        {/* Future Controls */}
        <div className="w-32 bg-white rounded-xl shadow-xl p-4">
          <div className="text-center font-bold mb-4 text-gray-800">
            Actions
          </div>
          <button
            disabled={!isMyTurn}
            className={`w-full py-2 mb-2 rounded text-white font-semibold ${
              isMyTurn
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Buy
          </button>
          <button
            disabled={!isMyTurn}
            className={`w-full py-2 rounded text-white font-semibold ${
              isMyTurn
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Sell
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game;
