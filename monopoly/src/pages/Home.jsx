import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { wsClient } from "../services/wsClient";
import Landing from "../components/Landing";

const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    currentPlayerId,
    setCurrentPlayerId,
    setCurrentPlayerName,
    createGame,
    joinGame,
  } = useGame();

  const [nameInput, setNameInput] = useState("");
  const [joinGameId, setJoinGameId] = useState(searchParams.get("join") || ""); // 👈 pre-fill from URL
  const [isProcessing, setIsProcessing] = useState(false);

  // Keep in sync if query param changes
  useEffect(() => {
    const joinId = searchParams.get("join");
    if (joinId) setJoinGameId(joinId);
  }, [searchParams]);

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
    try {
      setIsProcessing(true);
      const playerId = sessionStorage.getItem("monopoly_player_id");
      setCurrentPlayerName(nameInput.trim());

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/game/${joinGameId.trim()}`);
      if (!res.ok) { alert("Game not found"); return; }

      await joinGame(joinGameId.trim());
      const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:4000";
      await wsClient.connect(wsUrl, joinGameId.trim(), playerId, nameInput.trim());
      navigate(`/game/${joinGameId.trim()}/play`);
    } catch (err) {
      alert("Failed to join game");
    } finally {
      setIsProcessing(false);
    }
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