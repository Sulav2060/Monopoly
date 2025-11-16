import React, { useState, useEffect, useCallback } from "react";
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
  const [diceValue, setDiceValue] = useState(0);
  const [animationStep, setAnimationStep] = useState("idle");
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);

  // Initialize game with selected number of players
  const startGame = () => {
    const initialPlayers = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      position: 0,
      money: 1500,
      color: PLAYER_COLORS[i],
      properties: [],
    }));
    setPlayers(initialPlayers);
    setGameStarted(true);
    setCurrentPlayerIndex(0);
  };

  const rollDice = useCallback(() => {
    if (isAnimating || !gameStarted) return;

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;

    setDice1(die1);
    setDice2(die2);
    setDiceValue(total);
    setIsAnimating(true);
    setAnimationStep("rotating");
  }, [isAnimating, gameStarted]);

  // Effect to handle the animation sequence
  useEffect(() => {
    if (!isAnimating) return;

    let timeout;

    if (animationStep === "rotating") {
      timeout = setTimeout(() => setAnimationStep("waving"), 1000);
    } else if (animationStep === "waving") {
      const waveDuration = diceValue * 100 + 500;
      timeout = setTimeout(() => {
        setPlayers((prev) => {
          const updated = [...prev];
          const currentPlayer = updated[currentPlayerIndex];
          const newPosition =
            (currentPlayer.position + diceValue) % TILES_ON_BOARD;

          // Give $200 for passing GO
          if (newPosition < currentPlayer.position) {
            updated[currentPlayerIndex] = {
              ...currentPlayer,
              position: newPosition,
              money: currentPlayer.money + 200,
            };
          } else {
            updated[currentPlayerIndex] = {
              ...currentPlayer,
              position: newPosition,
            };
          }
          return updated;
        });
        setAnimationStep("zooming");
      }, waveDuration);
    } else if (animationStep === "zooming") {
      timeout = setTimeout(() => {
        setIsAnimating(false);
        setAnimationStep("idle");
        // Move to next player
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
      }, 1500);
    }

    return () => clearTimeout(timeout);
  }, [
    isAnimating,
    animationStep,
    currentPlayerIndex,
    diceValue,
    players.length,
  ]);

  if (!gameStarted) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center">
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

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center p-4">
      <div className="w-full h-full max-w-7xl flex gap-4">
        {/* Player Info Sidebar */}
        <div className="w-64 bg-white rounded-xl shadow-xl p-4 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Players</h2>
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`mb-3 p-3 rounded-lg border-2 transition-all ${
                index === currentPlayerIndex
                  ? "bg-yellow-50 border-yellow-400 shadow-md"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-6 h-6 rounded-full ${player.color.color} border-2 ${player.color.borderColor}`}
                />
                <span className="font-bold text-lg">{player.name}</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Position: {player.position}</p>
                <p className="font-semibold text-green-700">
                  Money: ${player.money}
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
          />

          {/* Dice and Controls */}
          <div className="bg-white rounded-xl shadow-xl p-6 flex items-center gap-6">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-white border-4 border-gray-800 rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg">
                {dice1}
              </div>
              <div className="w-16 h-16 bg-white border-4 border-gray-800 rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg">
                {dice2}
              </div>
            </div>

            <button
              onClick={rollDice}
              disabled={isAnimating}
              className={`px-8 py-4 font-bold text-lg rounded-lg shadow-lg transition-all ${
                isAnimating
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : `${currentPlayer.color.color} text-white hover:opacity-90 transform hover:scale-105`
              }`}
            >
              {isAnimating
                ? "Moving..."
                : `${currentPlayer.name}'s Turn - Roll Dice`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
