import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { wsClient } from "../services/wsClient";
import Landing from "../components/Landing";

const Home = () => {
  const navigate = useNavigate();
  const {
    currentGame,
    setCurrentGame,
    currentPlayerId,
    setCurrentPlayerId,
    currentPlayerName,
    setCurrentPlayerName,
    createGame,
  } = useGame();

  const [nameInput, setNameInput] = useState("");
  const [joinGameId, setJoinGameId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize player ID on mount
  useEffect(() => {
    if (currentPlayerId) return;
    let storedId = sessionStorage.getItem("monopoly_player_id");
    if (!storedId) {
      storedId = `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      sessionStorage.setItem("monopoly_player_id", storedId);
    }
    setCurrentPlayerId(storedId);
  }, [currentPlayerId, setCurrentPlayerId]);

  const handleCreateGame = async () => {
    if (!nameInput.trim()) return;
    try {
      setIsProcessing(true);
      const playerId = sessionStorage.getItem("monopoly_player_id");
      setCurrentPlayerName(nameInput.trim());

      const gameId = await createGame(nameInput.trim());

      const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:4000";
      await wsClient.connect(wsUrl, gameId, playerId, nameInput.trim());

      navigate(`/game/${gameId}/play`);
    } catch (err) {
      alert("Failed to create game");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (!joinGameId.trim() || !nameInput.trim()) return;
    navigate(`/game/${joinGameId.trim()}`);
  };

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
};

export default Home;