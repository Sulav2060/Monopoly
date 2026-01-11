import "./App.css";
import Board from "./components/Board";
import Game from "./components/Game";
import { useGame } from "./context/GameContext";
import { useEffect } from "react";

function App() {
  const { currentGame, setCurrentGame, currentPlayerId, setCurrentPlayerId, setCurrentRoom } = useGame();

  // Initialize game on mount (skip lobby)
  useEffect(() => {
    if (currentGame) return;

    // Per-tab identity (sessionStorage) so each tab is a distinct player
    let storedId = sessionStorage.getItem("monopoly_player_id");
    let storedName = sessionStorage.getItem("monopoly_player_name");

    if (!storedId) {
      storedId = `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      sessionStorage.setItem("monopoly_player_id", storedId);
    }

    if (!storedName) {
      storedName = `Player ${storedId.split("-").pop()}`;
      sessionStorage.setItem("monopoly_player_name", storedName);
    }

    setCurrentPlayerId(storedId);

    // Set up mock room
    const mockRoom = {
      id: "room-1",
      name: "Game Room",
      players: [
        { id: storedId, name: storedName, color: "bg-red-500" },
        { id: "player-bot-1", name: "Player 2", color: "bg-blue-500" },
      ],
    };
    setCurrentRoom(mockRoom);

    // Initialize mock game with backend-compatible structure
    const mockGame = {
      id: "game-1",
      roomId: "room-1",
      players: [
        {
          id: storedId,
          name: storedName,
          position: 0,
          money: 1500,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          properties: [],
          color: "bg-red-500", // Frontend only
        },
        {
          id: "player-bot-1",
          name: "Player 2",
          position: 0,
          money: 1500,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
          properties: [],
          color: "bg-blue-500", // Frontend only
        },
      ],
      currentPlayerIndex: 0,
      properties: [],
      turnNumber: 1,
      lastDiceRoll: null,
      gameOver: false,
    };

    setCurrentGame(mockGame);
  }, [currentGame, setCurrentGame, setCurrentPlayerId, setCurrentRoom]);

  // Show Game component when a game is active
  if (!currentGame) {
    return <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white text-2xl">Initializing game...</div>;
  }

  return (
    <>
      <Game />
    </>
  );
}

export default App;
