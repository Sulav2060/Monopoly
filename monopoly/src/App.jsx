import "./App.css";
import Game from "./components/Game";
import Lobby from "./components/Lobby";
import Landing from "./components/Landing";
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
      <Landing
        onCreateGame={handleCreateGame}
        onJoinGame={handleJoinGame}
        nameInput={nameInput}
        setNameInput={setNameInput}
        joinGameId={joinGameId}
        setJoinGameId={setJoinGameId}
        isProcessing={isProcessing}
      />
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
