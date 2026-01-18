import React, { createContext, useContext, useState, useCallback } from "react";
import { wsClient } from "../services/wsClient";

const PLAYER_COLORS = [
  {
    name: "Red",
    color: "bg-red-500",
    borderColor: "border-red-700",
    glow: "rgba(239,68,68,0.6)",
  },
  {
    name: "Blue",
    color: "bg-blue-500",
    borderColor: "border-blue-700",
    glow: "rgba(59,130,246,0.6)",
  },
  {
    name: "Green",
    color: "bg-green-500",
    borderColor: "border-green-700",
    glow: "rgba(34,197,94,0.6)",
  },
  {
    name: "Yellow",
    color: "bg-yellow-400",
    borderColor: "border-yellow-600",
    glow: "rgba(245,158,11,0.65)",
  },
];

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  // Room State
  const [currentRoom, setCurrentRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomError, setRoomError] = useState(null);

  // Game State
  const [currentGame, setCurrentGame] = useState(null);
  const [gameError, setGameError] = useState(null);

  // Player State
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [currentPlayerName, setCurrentPlayerName] = useState(null);

  // UI State
  const [loading, setLoading] = useState(false);

  const decorateGameState = useCallback((gameData) => {
    if (!gameData) return gameData;

    const properties = Array.isArray(gameData.properties)
      ? gameData.properties
      : [];

    const playersWithMeta = Array.isArray(gameData.players)
      ? gameData.players.map((player, index) => {
          // Always assign color from palette based on index
          const palette = PLAYER_COLORS[index % PLAYER_COLORS.length];

          const ownedTiles = properties
            .filter((prop) => {
              const ownerIds = [prop.ownerId, prop.owner, prop.playerId].filter(
                Boolean
              );
              return ownerIds.includes(player.id);
            })
            .map((prop) => {
              const idx = [prop.tileIndex, prop.propertyId, prop.tile].find(
                (v) => Number.isFinite(v)
              );
              return idx;
            })
            .filter((v) => Number.isFinite(v));

          return { ...player, color: palette, ownedTiles };
        })
      : [];

    const decorated = { ...gameData, players: playersWithMeta };
    return decorated;
  }, []);

  /**
   * Create a new game via API
   */
  const createGame = useCallback(async (playerName) => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/game/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to create game");
      }

      const data = await response.json();
      setCurrentGame({ id: data.gameId, players: [] });
      setCurrentRoom(data.gameId); // Keep room state for compatibility
      return data.gameId;
    } catch (error) {
      console.error("Error creating game:", error);
      setGameError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Join an existing game
   */
  const joinGame = useCallback(async (gameId) => {
    if (!gameId) throw new Error("Game ID is required");
    setCurrentGame({ id: gameId, players: [] });
    setCurrentRoom(gameId);
  }, []);

  /**
   * Leave current room
   */
  const leaveRoom = useCallback(async () => {
    throw new Error("Room API disabled (WebSocket-only mode)");
  }, []);

  /**
   * Start game in current room
   */
  const startGame = useCallback(async () => {
    try {
      setGameError(null);

      if (!currentGame) {
        throw new Error("Game not found");
      }

      // WebSocket-only path
      if (!wsClient.isConnected()) {
        throw new Error("WebSocket not connected");
      }

      return new Promise((resolve, reject) => {
        const handleGameStateUpdate = (newState) => {
          //console.log("🎮 Game started via WebSocket");
          setCurrentGame(decorateGameState(newState));
          wsClient.off("gameStateUpdate", handleGameStateUpdate);
          resolve(newState);
        };

        wsClient.on("gameStateUpdate", handleGameStateUpdate);

        try {
          wsClient.startGame();
        } catch (error) {
          wsClient.off("gameStateUpdate", handleGameStateUpdate);
          reject(error);
        }

        // Timeout after 10 seconds
        setTimeout(() => {
          wsClient.off("gameStateUpdate", handleGameStateUpdate);
          reject(new Error("Start game request timeout"));
        }, 10000);
      });
    } catch (error) {
      setGameError(error.message);
      throw error;
    }
  }, [currentGame, decorateGameState]);

  /**
   * Roll dice in current game
   */
  const rollDice = useCallback(async () => {
    try {
      setGameError(null);

      if (!currentGame || !currentPlayerId) {
        throw new Error("Game not started or player not found");
      }

      // WebSocket-only path
      if (!wsClient.isConnected()) {
        throw new Error("WebSocket not connected");
      }

      return new Promise((resolve, reject) => {
        const handleGameStateUpdate = (newState) => {
          //console.log("🎲 Game state updated via WebSocket");
          const decorated = decorateGameState(newState);
          setCurrentGame(decorated);
          wsClient.off("gameStateUpdate", handleGameStateUpdate);
          // Convert die1/die2 to d1/d2 for compatibility
          const diceRoll = decorated.lastDice
            ? { d1: decorated.lastDice.die1, d2: decorated.lastDice.die2 }
            : null;
          resolve(diceRoll);
        };

        wsClient.on("gameStateUpdate", handleGameStateUpdate);

        try {
          wsClient.rollDice();
        } catch (error) {
          wsClient.off("gameStateUpdate", handleGameStateUpdate);
          reject(error);
        }

        // Timeout after 10 seconds
        setTimeout(() => {
          wsClient.off("gameStateUpdate", handleGameStateUpdate);
          reject(new Error("Roll dice request timeout"));
        }, 10000);
      });
    } catch (error) {
      setGameError(error.message);
      throw error;
    }
  }, [currentGame, currentPlayerId, decorateGameState]);

  /**
   * Buy property
   */
  const buyProperty = useCallback(
    async (propertyIndex) => {
      try {
        setGameError(null);

        if (!currentGame || !currentPlayerId) {
          throw new Error("Game not started or player not found");
        }

        // WebSocket-only path
        if (!wsClient.isConnected()) {
          throw new Error("WebSocket not connected");
        }

        return new Promise((resolve, reject) => {
          const handleGameStateUpdate = (newState) => {
            console.log("🏠 Property bought via WebSocket");
            const decorated = decorateGameState(newState);
            setCurrentGame(decorated);
            wsClient.off("gameStateUpdate", handleGameStateUpdate);
            resolve(decorated);
          };

          wsClient.on("gameStateUpdate", handleGameStateUpdate);

          try {
            wsClient.buyProperty(propertyIndex);
          } catch (error) {
            wsClient.off("gameStateUpdate", handleGameStateUpdate);
            reject(error);
          }

          // Timeout after 10 seconds
          setTimeout(() => {
            wsClient.off("gameStateUpdate", handleGameStateUpdate);
            reject(new Error("Buy property request timeout"));
          }, 10000);
        });
      } catch (error) {
        setGameError(error.message);
        throw error;
      }
    },
    [currentGame, currentPlayerId, decorateGameState]
  );

  /**
   * Pay rent
   */
  const payRent = useCallback(async () => {
    throw new Error("payRent not implemented over WebSocket yet");
  }, []);

  /**
   * Buy house
   */
  const buyHouse = useCallback(async () => {
    throw new Error("buyHouse not implemented over WebSocket yet");
  }, []);

  /**
   * Buy hotel
   */
  const buyHotel = useCallback(async () => {
    throw new Error("buyHotel not implemented over WebSocket yet");
  }, []);

  /**
   * End turn
   */
  const endTurn = useCallback(async () => {
    try {
      setGameError(null);

      if (!currentGame || !currentPlayerId) {
        throw new Error("Game not started or player not found");
      }

      // WebSocket-only path
      if (!wsClient.isConnected()) {
        throw new Error("WebSocket not connected");
      }

      return new Promise((resolve, reject) => {
        const handleGameStateUpdate = (newState) => {
          //console.log("⏭️ Turn ended via WebSocket");
          setCurrentGame(decorateGameState(newState));
          wsClient.off("gameStateUpdate", handleGameStateUpdate);
          resolve(newState);
        };

        wsClient.on("gameStateUpdate", handleGameStateUpdate);

        try {
          wsClient.endTurn();
        } catch (error) {
          wsClient.off("gameStateUpdate", handleGameStateUpdate);
          reject(error);
        }

        // Timeout after 10 seconds
        setTimeout(() => {
          wsClient.off("gameStateUpdate", handleGameStateUpdate);
          reject(new Error("End turn request timeout"));
        }, 10000);
      });
    } catch (error) {
      setGameError(error.message);
      throw error;
    }
  }, [currentGame, currentPlayerId, decorateGameState]);

  /**
   * Refresh current room data
   */
  const refreshRoom = useCallback(async () => {
    throw new Error("Room API disabled (WebSocket-only mode)");
  }, []);

  /**
   * Get current game state
   */
  const getGameState = useCallback(async () => {
    throw new Error("getGameState not implemented over WebSocket yet");
  }, []);

  /**
   * Sync game state from realtime events (sockets)
   */
  const syncGameFromSocket = useCallback(
    (gameData) => {
      if (!gameData) return;
      const decorated = decorateGameState(gameData);
      // Determine Game ID using a safe fallback strategy
      setCurrentGame((prev) => {
        // Use prev.id as the primary source of truth for the ID once established
        const gameId = prev?.id || gameData.gameId || currentRoom;
        return { ...decorated, id: gameId };
      });
      // Keep room.game in sync so lobby views stay current
      setCurrentRoom((prev) => (prev ? { ...prev, game: decorated } : prev));
    },
    [decorateGameState] // Removed currentRoom from dependency to prevent infinite loops
  );

  const value = {
    // Room State & Actions
    currentRoom,
    availableRooms,
    roomError,
    createGame, // Replaced createRoom
    createRoom: createGame, // Alias for backward compatibility
    joinGame,   // Replaced joinRoom
    joinRoom: joinGame, // Alias for backward compatibility
    leaveRoom,
    refreshRoom,
    setCurrentRoom,

    // Game State & Actions
    currentGame,
    setCurrentGame,
    gameError,
    startGame,
    rollDice,
    buyProperty,
    payRent,
    buyHouse,
    buyHotel,
    endTurn,
    getGameState,
    syncGameFromSocket,

    // Player State
    currentPlayerId,
    setCurrentPlayerId,
    currentPlayerName,
    setCurrentPlayerName,

    // UI State
    loading,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
};

export default GameContext;
