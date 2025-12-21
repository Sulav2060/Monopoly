/**
 * API Client for Monopoly Game
 * Handles all communication with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return await response.json();
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: "GET",
      ...options,
    });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  }
}

export const apiClient = new ApiClient();

/**
 * Room API methods
 */
export const roomAPI = {
  /**
   * Create a new room
   */
  createRoom: (roomName, hostId, hostName) =>
    apiClient.post("/room/create", {
      roomName,
      hostId,
      hostName,
    }),

  /**
   * Get all available rooms
   */
  getAvailableRooms: () => apiClient.get("/room"),

  /**
   * Get a specific room by ID
   */
  getRoom: (roomId) => apiClient.get(`/room/${roomId}`),

  /**
   * Join a room
   */
  joinRoom: (roomId, playerId, playerName) =>
    apiClient.post(`/room/${roomId}/join`, {
      playerId,
      playerName,
    }),

  /**
   * Leave a room
   */
  leaveRoom: (roomId, playerId) =>
    apiClient.post(`/room/${roomId}/leave`, {
      playerId,
    }),

  /**
   * Start a game in a room
   */
  startGame: (roomId) => apiClient.post(`/room/${roomId}/start`, {}),

  /**
   * Get all rooms (admin)
   */
  getAllRooms: () => apiClient.get("/room/all/list"),
};

/**
 * Game API methods
 */
export const gameAPI = {
  /**
   * Roll dice for a game
   */
  rollDice: (gameId, playerId) => apiClient.post(`/game/${gameId}/roll`, { playerId }),

  /**
   * Move player
   */
  movePlayer: (gameId, playerId, position) =>
    apiClient.post(`/game/${gameId}/move`, {
      playerId,
      position,
    }),

  /**
   * Buy property
   */
  buyProperty: (gameId, playerId, propertyId) =>
    apiClient.post(`/game/${gameId}/buy-property`, {
      playerId,
      propertyId,
    }),

  /**
   * Pay rent on a property
   */
  payRent: (gameId, playerId, propertyId) =>
    apiClient.post(`/game/${gameId}/pay-rent`, {
      playerId,
      propertyId,
    }),

  /**
   * Buy a house for a property
   */
  buyHouse: (gameId, playerId, propertyId) =>
    apiClient.post(`/game/${gameId}/buy-house`, {
      playerId,
      propertyId,
    }),

  /**
   * Buy a hotel for a property
   */
  buyHotel: (gameId, playerId, propertyId) =>
    apiClient.post(`/game/${gameId}/buy-hotel`, {
      playerId,
      propertyId,
    }),

  /**
   * End turn
   */
  endTurn: (gameId, playerId) =>
    apiClient.post(`/game/${gameId}/end-turn`, {
      playerId,
    }),

  /**
   * Get game state
   */
  getGameState: (gameId) => apiClient.get(`/game/${gameId}`),
};

export default apiClient;
