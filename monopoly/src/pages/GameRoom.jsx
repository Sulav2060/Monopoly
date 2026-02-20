import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { wsClient } from "../services/wsClient";
import Lobby from "../components/Lobby";
import Game from "../components/Game";

const GameRoom = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const {
    currentGame,
    currentPlayerId,
    currentPlayerName,
    syncGameFromSocket,
  } = useGame();

  const [gameStarted, setGameStarted] = useState(false);
  // Use a ref so the listener closure always has the latest value
  // without needing to be re-registered every time gameStarted changes
  const gameStartedRef = useRef(false);

  // Redirect to home if no player context (e.g. hard refresh)
  useEffect(() => {
    if (!currentPlayerId || !currentPlayerName) {
      navigate(`/game/${gameId}`);
    }
  }, [currentPlayerId, currentPlayerName]);

  // Set up WebSocket game state listener ONCE — ref keeps it fresh
  useEffect(() => {
    if (!currentPlayerId || !currentPlayerName) return;

    const handleGameStateUpdate = (newState) => {
      // Sync player list + all state for ALL players, not just host
      syncGameFromSocket(newState);

      if (newState.hasStarted && !gameStartedRef.current) {
        gameStartedRef.current = true;
        setGameStarted(true);
      }
    };

    wsClient.on("gameStateUpdate", handleGameStateUpdate);

    return () => {
      // Clean up the specific handler so it doesn't stack on re-renders
      wsClient.off("gameStateUpdate", handleGameStateUpdate);
    };
  // Only depends on player identity — NOT on currentGame or gameStarted
  }, [currentPlayerId, currentPlayerName]);

  if (!currentGame) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#0a0a0b] text-white font-mono">
        Connecting...
      </div>
    );
  }

  const isHost =
    currentGame.players?.length > 0 &&
    currentGame.players[0]?.id === currentPlayerId;

  if (!gameStarted) {
    return (
      <Lobby
        currentGame={currentGame}
        currentPlayerId={currentPlayerId}
        isHost={isHost}
        onStartGame={async () => {
          try {
            await wsClient.startGame();
          } catch (error) {
            console.error("Failed to start game:", error);
            alert("Failed to start game: " + error.message);
          }
        }}
      />
    );
  }

  return <Game />;
};

export default GameRoom;