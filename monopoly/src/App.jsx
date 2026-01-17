import "./App.css";
import Game from "./components/Game";
import Lobby from "./components/Lobby";
import { useGame } from "./context/GameContext";
import { useEffect, useState } from "react";
import { wsClient } from "./services/wsClient";

function App() {
  const {
    currentGame,
    setCurrentGame,
    currentPlayerId,
    setCurrentPlayerId,
    currentPlayerName,
    setCurrentPlayerName,
    setCurrentRoom,
  } = useGame();

  const [nameInput, setNameInput] = useState("");
  const [gameStarted, setGameStarted] = useState(false);

  // Step 1: Initialize player ID on mount
  useEffect(() => {
    if (currentPlayerId) return;

    let storedId = sessionStorage.getItem("monopoly_player_id");
    if (!storedId) {
      storedId = `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      sessionStorage.setItem("monopoly_player_id", storedId);
    }
    console.log("✅ Player ID set:", storedId);
    setCurrentPlayerId(storedId);
  }, [currentPlayerId, setCurrentPlayerId]);

  // Step 2: Set up WebSocket and listen for game state updates
  useEffect(() => {
    if (!currentGame || !currentPlayerId || !currentPlayerName) return;

    const setupWebSocket = async () => {
      try {
        const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:4000";

        // Connect to WebSocket
        await wsClient.connect(
          wsUrl,
          currentGame.id,
          currentPlayerId,
          currentPlayerName
        );

        // Listen for game state updates
        wsClient.on("gameStateUpdate", (newState) => {
          console.log("📨 Game state update received:", newState);

          // Check if game has started
          if (newState.hasStarted && !gameStarted) {
            console.log("✅ Game has started! Showing board...");
            setGameStarted(true);
          }

          // Update game state directly from server payload
          // Server already provides the authoritative shape (currentTurnIndex, lastDice, etc.)
          setCurrentGame(newState);
        });

        console.log("✅ WebSocket connected");
      } catch (error) {
        console.error("❌ Failed to connect WebSocket:", error);
      }
    };

    setupWebSocket();

    return () => {
      wsClient.disconnect();
    };
  }, [currentGame?.id, currentPlayerId, currentPlayerName, gameStarted]);

  // Step 3: Create initial game after player enters name
  useEffect(() => {
    if (currentGame || !currentPlayerName || !currentPlayerId) {
      console.log("Game init check:", {
        currentGame: !!currentGame,
        currentPlayerName,
        currentPlayerId,
      });
      return;
    }

    console.log("🎮 Creating initial game for:", currentPlayerName);

    // Initialize game with current player
    const initialGame = {
      id: "game-1",
      roomId: "room-1",
      players: [
        {
          id: currentPlayerId,
          name: currentPlayerName,
          position: 0,
          money: 1500,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          properties: [],
          color: "bg-red-500",
        },
      ],
      currentTurnIndex: 0,
      properties: [],
      turnNumber: 1,
      lastDiceRoll: null,
      gameOver: false,
      hasStarted: false,
    };

    setCurrentGame(initialGame);
    setGameStarted(false);
  }, [currentPlayerName, currentPlayerId, currentGame, setCurrentGame]);

  // Show name input screen
  if (!currentPlayerName) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-linear-to-br from-green-100 to-blue-100 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🎲 Monopoly
            </h1>
            <p className="text-gray-600">Enter your name to join</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (nameInput.trim()) {
                setCurrentPlayerName(nameInput.trim());
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your player name..."
                maxLength="30"
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <button
              type="submit"
              disabled={!nameInput.trim()}
              className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                nameInput.trim()
                  ? "bg-green-600 hover:bg-green-700 shadow-lg hover:scale-105"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show loading state
  if (!currentGame) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white text-2xl">
        Initializing game...
      </div>
    );
  }

  // Determine if current player is host (first player)
  const isHost =
    currentGame.players?.length > 0 &&
    currentGame.players[0]?.id === currentPlayerId;

  // Show Lobby until game is started
  if (!gameStarted) {
    return (
      <Lobby
        currentGame={currentGame}
        currentPlayerId={currentPlayerId}
        isHost={isHost}
        onStartGame={async () => {
          try {
            console.log("🎮 Host starting game...");
            await wsClient.startGame();
            console.log("✅ START_GAME message sent");
          } catch (error) {
            console.error("❌ Failed to start game:", error);
            alert("Failed to start game: " + error.message);
          }
        }}
      />
    );
  }

  // Show Game Board
  return (
    <>
      <Game />
    </>
  );
}

export default App;
