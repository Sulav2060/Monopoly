import React, { createContext, useContext, useState, useCallback } from "react";
import { wsClient } from "../services/wsClient";

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

  /**
   * Create a new room
   */
  const createRoom = useCallback(async () => {
    throw new Error("Room API disabled (WebSocket-only mode)");
  }, []);

  /**
   * List available rooms
   */
  const loadAvailableRooms = useCallback(async () => {
    throw new Error("Room API disabled (WebSocket-only mode)");
  }, []);

  /**
   * Join a room
   */
  const joinRoom = useCallback(async () => {
    throw new Error("Room API disabled (WebSocket-only mode)");
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
          setCurrentGame(newState);
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
  }, [currentGame]);

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
          setCurrentGame(newState);
          wsClient.off("gameStateUpdate", handleGameStateUpdate);
          // Convert die1/die2 to d1/d2 for compatibility
          const diceRoll = newState.lastDice
            ? { d1: newState.lastDice.die1, d2: newState.lastDice.die2 }
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
  }, [currentGame, currentPlayerId]);

  /**
   * Buy property
   */
  const buyProperty = useCallback(async () => {
    throw new Error("buyProperty not implemented over WebSocket yet");
  }, []);

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
          setCurrentGame(newState);
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
  }, [currentGame, currentPlayerId]);

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
  const syncGameFromSocket = useCallback((gameData) => {
    if (!gameData) return;
    setCurrentGame(gameData);
    // Keep room.game in sync so lobby views stay current
    setCurrentRoom((prev) => (prev ? { ...prev, game: gameData } : prev));
  }, []);

  const value = {
    // Room State & Actions
    currentRoom,
    availableRooms,
    roomError,
    createRoom,
    loadAvailableRooms,
    joinRoom,
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
