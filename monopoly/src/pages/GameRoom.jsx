import { useEffect, useState } from "react";
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

  // Redirect to home if no player context (e.g. hard refresh)
  useEffect(() => {
    if (!currentPlayerId || !currentPlayerName) {
      navigate(`/game/${gameId}`);
    }
  }, [currentPlayerId, currentPlayerName]);

  // Set up WebSocket game state listener
  useEffect(() => {
    if (!currentGame || !currentPlayerId || !currentPlayerName) return;

    wsClient.on("gameStateUpdate", (newState) => {
      if (newState.hasStarted && !gameStarted) {
        setGameStarted(true);
      }
      syncGameFromSocket(newState);
    });

    return () => {
      // Don't disconnect here — wsClient persists across renders
    };
  }, [currentGame?.id, currentPlayerId, currentPlayerName, gameStarted]);

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