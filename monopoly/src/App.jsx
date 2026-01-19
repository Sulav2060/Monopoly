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
    createGame,
    joinGame,
    syncGameFromSocket,
  } = useGame();

  const [nameInput, setNameInput] = useState("");
  const [joinGameId, setJoinGameId] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
          // Check if game has started
          if (newState.hasStarted && !gameStarted) {
            setGameStarted(true);
          }
          // Use syncGameFromSocket to ensure state is decorated and IDs are preserved
          syncGameFromSocket(newState);
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

  const handleCreateGame = async () => {
    if (!nameInput.trim()) return;
    try {
      setIsProcessing(true);
      setCurrentPlayerName(nameInput.trim());
      await createGame(nameInput.trim());
    } catch (err) {
      alert("Failed to create game");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (!joinGameId.trim() || !nameInput.trim()) return;
    try {
      setCurrentPlayerName(nameInput.trim());
      await joinGame(joinGameId.trim());
    } catch (err) {
      alert("Failed to join game");
    }
  };

  // Show unified login and game selection screen
  if (!currentGame) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-linear-to-br from-green-100 to-blue-100 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🎲 Monopoly
            </h1>
            <p className="text-gray-600">Enter your details to get started</p>
          </div>

          <div className="space-y-6">
            {/* Name Input */}
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

            {/* Create Game Button */}
            <button
              onClick={handleCreateGame}
              disabled={isProcessing || !nameInput.trim()}
              className={`w-full py-4 text-lg rounded-xl shadow-lg font-bold transition-all flex items-center justify-center gap-2 ${
                nameInput.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`}
            >
              {isProcessing ? "Creating..." : "✨ Create New Game"}
            </button>

            <div className="relative flex items-center">
              <div className="grow border-t border-gray-300"></div>
              <span className="shrink-0 mx-4 text-gray-400 text-sm">Or join existing</span>
              <div className="grow border-t border-gray-300"></div>
            </div>

            {/* Join Game Form */}
            <form onSubmit={handleJoinGame} className="flex gap-2">
              <input
                type="text"
                value={joinGameId}
                onChange={(e) => setJoinGameId(e.target.value)}
                placeholder="Enter Game ID"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                disabled={!joinGameId.trim()}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-bold shadow-md transition-all"
              >
                Join
              </button>
            </form>
          </div>
        </div>
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
