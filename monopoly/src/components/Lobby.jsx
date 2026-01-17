import React, { useState } from "react";

const Lobby = ({ currentGame, currentPlayerId, isHost, onStartGame }) => {
  const [loading, setLoading] = useState(false);

  const handleStartGame = async () => {
    setLoading(true);
    try {
      await onStartGame();
    } catch (error) {
      console.error("Failed to start game:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-linear-to-br from-green-100 to-blue-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎲 Monopoly</h1>
          <p className="text-gray-600">Game Lobby</p>
        </div>

        {/* Player Count */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-gray-600 mb-1">Players Joined</p>
          <p className="text-3xl font-bold text-blue-600">
            {currentGame?.players?.length || 0}/4
          </p>
        </div>

        {/* Player List */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Players</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {currentGame?.players && currentGame.players.length > 0 ? (
              currentGame.players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div
                    className={`w-4 h-4 rounded-full ${
                      player.color || "bg-gray-400"
                    }`}
                  />
                  <span className="flex-1 font-semibold text-gray-800">
                    {player.name}
                    {index === 0 && (
                      <span className="text-xs text-blue-600 ml-2">(Host)</span>
                    )}
                    {player.id === currentPlayerId && (
                      <span className="text-xs text-green-600 ml-2">(You)</span>
                    )}
                  </span>
                  <span className="text-sm text-gray-500">#{index + 1}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Waiting for players...
              </p>
            )}
          </div>
        </div>

        {/* Waiting for more players message */}
        {currentGame?.players?.length < 2 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-center">
            <p className="text-sm text-yellow-800">
              Waiting for at least 2 players to start...
            </p>
          </div>
        )}

        {/* Start Game Button (only for host) */}
        {isHost && (
          <button
            onClick={handleStartGame}
            disabled={
              !currentGame?.players || currentGame.players.length < 2 || loading
            }
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              !currentGame?.players || currentGame.players.length < 2 || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 shadow-lg hover:scale-105"
            }`}
          >
            {loading ? "Starting..." : "🎮 Start Game"}
          </button>
        )}

        {/* Waiting message (for non-host) */}
        {!isHost && (
          <div className="text-center py-3">
            <p className="text-gray-600">
              Waiting for host to start the game...
            </p>
            <div className="mt-3 flex justify-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
