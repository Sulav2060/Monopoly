import React, { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";

const Lobby = ({ onGameStart }) => {
  const {
    createRoom,
    loadAvailableRooms,
    joinRoom,
    leaveRoom,
    startGame,
    refreshRoom,
    currentRoom,
    availableRooms,
    _currentPlayerName,
    currentPlayerId,
    roomError,
    loading,
  } = useGame();

  const [view, setView] = useState("menu"); // "menu" | "create" | "join" | "room"
  const [roomName, setRoomName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (currentRoom) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView("room");
    }
  }, [currentRoom]);

  // Auto-refresh room data every second when in room view
  useEffect(() => {
    if (view !== "room" || !currentRoom) return;

    const interval = setInterval(async () => {
      await refreshRoom();
    }, 1000);

    return () => clearInterval(interval);
  }, [view, currentRoom, refreshRoom]);

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !playerName.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await createRoom(roomName, playerName);
      setRoomName("");
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !selectedRoomId) {
      alert("Please select a room and enter your name");
      return;
    }

    try {
      await joinRoom(selectedRoomId, playerName);
      setPlayerName("");
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  const handleStartGame = async () => {
    try {
      const game = await startGame();
      onGameStart(game);
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom();
      setView("menu");
    } catch (error) {
      console.error("Failed to leave room:", error);
    }
  };

  const loadRooms = async () => {
    try {
      await loadAvailableRooms();
      setView("join");
    } catch (error) {
      console.error("Failed to load rooms:", error);
    }
  };

  // Main Menu View
  if (view === "menu") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
          <h1 className="text-4xl font-bold text-center mb-8 text-green-800">
            🎲 Monopoly Game
          </h1>

          <div className="space-y-4">
            <button
              onClick={() => setView("create")}
              className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105"
            >
              ➕ Create Room
            </button>

            <button
              onClick={loadRooms}
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? "Loading..." : "🔗 Join Room"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create Room View
  if (view === "create") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-8 text-green-800">
            Create Room
          </h1>

          {roomError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {roomError}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Room Name:
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g., Epic Game Session"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Your Name:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Room"}
            </button>

            <button
              onClick={() => setView("menu")}
              className="w-full py-3 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition-all"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Join Room View
  if (view === "join") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">
            Join Room
          </h1>

          {roomError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {roomError}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Your Name:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Select Room:
              </label>
              <select
                value={selectedRoomId || ""}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              >
                <option value="">Choose a room...</option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} ({room.players.length}/{room.maxPlayers})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleJoinRoom}
              disabled={loading || !selectedRoomId}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join Room"}
            </button>

            <button
              onClick={() => setView("menu")}
              className="w-full py-3 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition-all"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Room Lobby View
  if (view === "room" && currentRoom) {
    const isHost = currentRoom.host === currentPlayerId;
    const canStart = currentRoom.players.length >= 2;

    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
            {currentRoom.name}
          </h1>

          <div className="text-center mb-6">
            <p className="text-gray-600">
              Room ID:{" "}
              <span className="font-mono text-sm">{currentRoom.id}</span>
            </p>
            <p className="text-gray-600">
              Players: {currentRoom.players.length}/{currentRoom.maxPlayers}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto">
            <h3 className="font-bold mb-3 text-gray-800">Players:</h3>
            <div className="space-y-2">
              {currentRoom.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200"
                >
                  <div
                    className={`w-4 h-4 rounded-full ${
                      player.color.startsWith("bg-")
                        ? player.color
                        : "bg-gray-400"
                    }`}
                  />
                  <span className="font-semibold">{player.name}</span>
                  {currentRoom.host === player.id && (
                    <span className="text-xs bg-yellow-200 px-2 py-1 rounded">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {roomError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {roomError}
            </div>
          )}

          <div className="space-y-2">
            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={loading || !canStart}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
              >
                {loading ? "Starting..." : "🎮 Start Game"}
              </button>
            )}

            <button
              onClick={handleLeaveRoom}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all"
            >
              Leave Room
            </button>
          </div>

          {!isHost && (
            <p className="text-center text-sm text-gray-600 mt-4">
              Waiting for host to start the game...
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default Lobby;
