import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { wsClient } from "../services/wsClient";

const JoinPage = () => {
  const { gameId: urlGameId } = useParams();
  const navigate = useNavigate();
  const {
    currentPlayerId,
    setCurrentPlayerId,
    setCurrentPlayerName,
    joinGame,
  } = useGame();

  const [gameId, setGameId] = useState(urlGameId || "");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (urlGameId) setGameId(urlGameId);
  }, [urlGameId]);

  // Initialize player ID
  useEffect(() => {
    if (currentPlayerId) return;
    let storedId = sessionStorage.getItem("monopoly_player_id");
    if (!storedId) {
      storedId = `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      sessionStorage.setItem("monopoly_player_id", storedId);
    }
    setCurrentPlayerId(storedId);
  }, [currentPlayerId, setCurrentPlayerId]);

  const handleJoin = async () => {
    if (!gameId || !name) return;
    setIsLoading(true);
    setError(null);

    try {
      // Verify game exists
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/game/${gameId}`);
      if (!res.ok) {
        setError("Game not found. Check the code and try again.");
        return;
      }

      const playerId = sessionStorage.getItem("monopoly_player_id");
      setCurrentPlayerName(name.trim());
      await joinGame(gameId);

      const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:4000";
      await wsClient.connect(wsUrl, gameId, playerId, name.trim());

      navigate(`/game/${gameId}/play`);
    } catch (err) {
      setError("Failed to join. Please try again.");
      console.error("Join failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] font-mono">
      <div className="w-full max-w-sm flex flex-col gap-0">
        <div className="bg-[#121214] border border-white/10 p-6 border-b-0">
          <div className="text-[10px] font-black text-[#d4ff00] tracking-widest uppercase mb-1">
            Join_Game
          </div>
          <div className="text-white font-black text-2xl italic uppercase tracking-widest">
            Enter_Room
          </div>
        </div>

        <div className="bg-[#121214] border-x border-white/10 p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-[#d4ff00] tracking-widest uppercase">
              Room_Code
            </label>
            <input
              value={gameId}
              onChange={e => setGameId(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              className="bg-black border border-white/10 px-4 py-3 text-white font-black tracking-[0.3em] text-lg uppercase placeholder-white/20 focus:outline-none focus:border-[#d4ff00] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-[#d4ff00] tracking-widest uppercase">
              Your_Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              autoFocus={!!urlGameId}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              className="bg-black border border-white/10 px-4 py-3 text-white font-mono placeholder-white/20 focus:outline-none focus:border-[#d4ff00] transition-colors"
            />
          </div>

          {error && (
            <div className="text-red-400 text-[11px] font-bold uppercase tracking-wider">
              ⚠ {error}
            </div>
          )}
        </div>

        <button
          onClick={handleJoin}
          disabled={!gameId || !name || isLoading}
          className="h-16 bg-[#d4ff00] disabled:bg-[#1a1a1c] disabled:text-[#444] text-black font-black italic text-xl tracking-[0.2em] uppercase transition-all hover:brightness-110"
        >
          {isLoading ? "CONNECTING..." : "JOIN_GAME →"}
        </button>

        <button
          onClick={() => navigate("/")}
          className="mt-4 text-[10px] text-[#444] hover:text-white uppercase tracking-widest font-bold transition-colors text-center"
        >
          ← Back_to_Home
        </button>
      </div>
    </div>
  );
};

export default JoinPage;