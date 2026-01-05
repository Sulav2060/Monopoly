import React, { createContext, useContext, useState, useCallback } from "react";
import { roomAPI, gameAPI } from "../services/api";

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
  const createRoom = useCallback(async (roomName, playerName) => {
    try {
      setLoading(true);
      setRoomError(null);
      const playerId = `player-${Date.now()}`;
      setCurrentPlayerId(playerId);
      setCurrentPlayerName(playerName);

      const response = await roomAPI.createRoom(roomName, playerId, playerName);
      setCurrentRoom(response.data);
      return response.data;
    } catch (error) {
      setRoomError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * List available rooms
   */
  const loadAvailableRooms = useCallback(async () => {
    try {
      setLoading(true);
      setRoomError(null);
      const response = await roomAPI.getAvailableRooms();
      setAvailableRooms(response.data);
      return response.data;
    } catch (error) {
      setRoomError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Join a room
   */
  const joinRoom = useCallback(async (roomId, playerName) => {
    try {
      setLoading(true);
      setRoomError(null);
      const playerId = `player-${Date.now()}`;
      setCurrentPlayerId(playerId);
      setCurrentPlayerName(playerName);

      const response = await roomAPI.joinRoom(roomId, playerId, playerName);
      setCurrentRoom(response.data);
      return response.data;
    } catch (error) {
      setRoomError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Leave current room
   */
  const leaveRoom = useCallback(async () => {
    try {
      setLoading(true);
      setRoomError(null);

      if (!currentRoom || !currentPlayerId) {
        throw new Error("Not in a room");
      }

      await roomAPI.leaveRoom(currentRoom.id, currentPlayerId);
      setCurrentRoom(null);
      setCurrentGame(null);
      setCurrentPlayerId(null);
      setCurrentPlayerName(null);
    } catch (error) {
      setRoomError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentRoom, currentPlayerId]);

  /**
   * Start game in current room
   */
  const startGame = useCallback(async () => {
    try {
      setLoading(true);
      setGameError(null);

      if (!currentRoom) {
        throw new Error("Not in a room");
      }

      const response = await roomAPI.startGame(currentRoom.id);
      setCurrentGame(response.data);
      return response.data;
    } catch (error) {
      setGameError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentRoom]);

  /**
   * Roll dice in current game
   */
  const rollDice = useCallback(async () => {
    try {
      setGameError(null);

      if (!currentGame || !currentPlayerId) {
        throw new Error("Game not started or player not found");
      }

      const response = await gameAPI.rollDice(currentGame.id, currentPlayerId);
      console.log(response);
      setCurrentGame(response.data);
      return response.data.lastDiceRoll;
    } catch (error) {
      setGameError(error.message);
      throw error;
    }
  }, [currentGame, currentPlayerId]);

  /**
   * Buy property
   */
  const buyProperty = useCallback(
    async (propertyId) => {
      try {
        setGameError(null);

        if (!currentGame || !currentPlayerId) {
          throw new Error("Game not started or player not found");
        }

        const response = await gameAPI.buyProperty(
          currentGame.id,
          currentPlayerId,
          propertyId
        );
        setCurrentGame(response.data);
        return response.data;
      } catch (error) {
        setGameError(error.message);
        throw error;
      }
    },
    [currentGame, currentPlayerId]
  );

  /**
   * Pay rent
   */
  const payRent = useCallback(
    async (propertyId) => {
      try {
        setGameError(null);

        if (!currentGame || !currentPlayerId) {
          throw new Error("Game not started or player not found");
        }

        const response = await gameAPI.payRent(
          currentGame.id,
          currentPlayerId,
          propertyId
        );
        setCurrentGame(response.data);
        return response.data.lastRentPaid;
      } catch (error) {
        setGameError(error.message);
        throw error;
      }
    },
    [currentGame, currentPlayerId]
  );

  /**
   * Buy house
   */
  const buyHouse = useCallback(
    async (propertyId) => {
      try {
        setGameError(null);

        if (!currentGame || !currentPlayerId) {
          throw new Error("Game not started or player not found");
        }

        const response = await gameAPI.buyHouse(
          currentGame.id,
          currentPlayerId,
          propertyId
        );
        setCurrentGame(response.data);
        return response.data;
      } catch (error) {
        setGameError(error.message);
        throw error;
      }
    },
    [currentGame, currentPlayerId]
  );

  /**
   * Buy hotel
   */
  const buyHotel = useCallback(
    async (propertyId) => {
      try {
        setGameError(null);

        if (!currentGame || !currentPlayerId) {
          throw new Error("Game not started or player not found");
        }

        const response = await gameAPI.buyHotel(
          currentGame.id,
          currentPlayerId,
          propertyId
        );
        setCurrentGame(response.data);
        return response.data;
      } catch (error) {
        setGameError(error.message);
        throw error;
      }
    },
    [currentGame, currentPlayerId]
  );

  /**
   * End turn
   */
  const endTurn = useCallback(async () => {
    try {
      setGameError(null);

      if (!currentGame || !currentPlayerId) {
        throw new Error("Game not started or player not found");
      }

      const response = await gameAPI.endTurn(currentGame.id, currentPlayerId);
      setCurrentGame(response.data);
      return response.data;
    } catch (error) {
      setGameError(error.message);
      throw error;
    }
  }, [currentGame, currentPlayerId]);

  /**
   * Refresh current room data
   */
  const refreshRoom = useCallback(async () => {
    try {
      if (!currentRoom) {
        return null;
      }

      const response = await roomAPI.getRoom(currentRoom.id);
      setCurrentRoom(response.data);

      // If game exists, always update currentGame (for host and joining players)
      if (response.data.game) {
        setCurrentGame(response.data.game);
      }

      return response.data;
    } catch (error) {
      console.error("Failed to refresh room:", error);
      return null;
    }
  }, [currentRoom]);

  /**
   * Get current game state
   */
  const getGameState = useCallback(async () => {
    try {
      setGameError(null);

      if (!currentGame) {
        throw new Error("Game not started");
      }

      const response = await gameAPI.getGameState(currentGame.id);
      setCurrentGame(response.data);
      return response.data;
    } catch (error) {
      setGameError(error.message);
      throw error;
    }
  }, [currentGame]);

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

    // Game State & Actions
    currentGame,
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
    currentPlayerName,

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
