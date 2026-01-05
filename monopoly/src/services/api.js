/**
 * API Client for Monopoly Game
 * Handles all communication with the backend
 * SIMULATED MODE - Returns fake responses for testing
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const USE_SIMULATED_RESPONSES = true; // Set to false to use real API

// Global singleton simulated data store - persists across all API calls
// Load from localStorage if available
const loadSimulatedData = () => {
  try {
    const stored = localStorage.getItem('monopoly_simulated_data');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('📦 Loaded simulated data from localStorage:', {
        rooms: parsed.rooms?.length || 0,
        games: Object.keys(parsed.games || {}).length
      });
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load simulated data:', e);
  }
  return {
    rooms: [],
    games: {},
    roomIdCounter: 1,
  };
};

const saveSimulatedData = () => {
  try {
    localStorage.setItem('monopoly_simulated_data', JSON.stringify(simulatedData));
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'monopoly_simulated_data',
      newValue: JSON.stringify(simulatedData),
      url: window.location.href,
      storageArea: localStorage
    }));
  } catch (e) {
    console.error('Failed to save simulated data:', e);
  }
};

const reloadSimulatedData = () => {
  try {
    const stored = localStorage.getItem('monopoly_simulated_data');
    if (stored) {
      const parsed = JSON.parse(stored);
      simulatedData.rooms = parsed.rooms || [];
      simulatedData.games = parsed.games || {};
      simulatedData.roomIdCounter = parsed.roomIdCounter || 1;
    }
  } catch (e) {
    console.error('Failed to reload simulated data:', e);
  }
};

const simulatedData = loadSimulatedData();

// Broadcast game updates to simulate WebSocket
const broadcastGameUpdate = (gameId, game) => {
  window.dispatchEvent(new CustomEvent('game-update', {
    detail: { gameId, game }
  }));
};

// Mock socket.io when in simulated mode
if (USE_SIMULATED_RESPONSES && typeof window !== 'undefined') {
  window.__mockSocketIO = true;
}

// Listen for storage changes from other tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'monopoly_simulated_data' && e.newValue) {
    console.log('🔄 Data updated from another tab/window');
    reloadSimulatedData();
  }
});

// Debug function to view current state (accessible from browser console)
window.__MONOPOLY_DEBUG__ = {
  getRooms: () => simulatedData.rooms,
  getGames: () => simulatedData.games,
  getAllData: () => simulatedData,
  clearAll: () => {
    simulatedData.rooms = [];
    simulatedData.games = {};
    simulatedData.roomIdCounter = 1;
    saveSimulatedData();
    console.log('Simulated data cleared');
  }
};

class ApiClient {
  async request(endpoint, options = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

    if (USE_SIMULATED_RESPONSES) {
      return this.simulatedRequest(endpoint, options);
    }

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

  simulatedRequest(endpoint, options = {}) {
    // Always reload from localStorage to get latest data from other tabs
    reloadSimulatedData();
    
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;

    console.log('🔵 API Request:', method, endpoint, body ? 'with body' : '');

    // Parse endpoint
    const [, resource, param1, param2, action] = endpoint.split('/');

    let result;
    if (resource === 'room') {
      result = this.handleRoomRequest(method, param1, param2, action, body);
    } else if (resource === 'game') {
      result = this.handleGameRequest(method, param1, param2, body);
    } else {
      throw new Error(`Unknown endpoint: ${endpoint}`);
    }

    console.log('🟢 API Response:', result ? (Array.isArray(result) ? `Array(${result.length})` : 'Object') : 'null');
    
    // Wrap in data property to match expected API response format
    return { data: result };
  }

  handleRoomRequest(method, param1, param2, action, body) {
    const PLAYER_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
    
    if (method === 'POST' && param1 === 'create') {
      const room = {
        id: `room-${simulatedData.roomIdCounter++}`,
        name: body.roomName,
        host: body.hostId,
        players: [{ id: body.hostId, name: body.hostName, color: PLAYER_COLORS[0] }],
        status: 'waiting',
        maxPlayers: 4,
        createdAt: new Date().toISOString(),
      };
      simulatedData.rooms.push(room);
      saveSimulatedData();
      console.log('✅ Room created:', room.id, 'Total rooms:', simulatedData.rooms.length);
      return room;
    }

    if (method === 'GET' && !param1) {
      const availableRooms = simulatedData.rooms.filter(r => r.status === 'waiting');
      console.log('📋 Available rooms:', availableRooms.length, 'of', simulatedData.rooms.length);
      return availableRooms;
    }

    if (method === 'GET' && param1 === 'all') {
      console.log('📋 All rooms:', simulatedData.rooms.length);
      return simulatedData.rooms;
    }

    if (method === 'GET' && param1) {
      const room = simulatedData.rooms.find(r => r.id === param1);
      if (!room) {
        console.error('❌ Room not found:', param1);
        throw new Error('Room not found');
      }
      
      // Include game if it exists for this room
      const gameId = `game-${param1}`;
      if (simulatedData.games[gameId]) {
        room.game = simulatedData.games[gameId];
        console.log('✅ Room fetched:', room.id, 'Players:', room.players.length, 'Game:', gameId);
      } else {
        console.log('✅ Room fetched:', room.id, 'Players:', room.players.length);
      }
      
      return room;
    }

    if (method === 'POST' && param2 === 'join') {
      const room = simulatedData.rooms.find(r => r.id === param1);
      if (!room) {
        console.error('❌ Room not found:', param1, 'Available rooms:', simulatedData.rooms.map(r => r.id));
        throw new Error('Room not found');
      }
      if (room.players.length >= room.maxPlayers) {
        console.error('❌ Room full:', param1);
        throw new Error('Room is full');
      }
      
      const playerExists = room.players.some(p => p.id === body.playerId);
      if (!playerExists) {
        const playerColor = PLAYER_COLORS[room.players.length % PLAYER_COLORS.length];
        room.players.push({ id: body.playerId, name: body.playerName, color: playerColor });
        console.log('✅ Player joined:', body.playerName, 'Room:', room.id, 'Total players:', room.players.length);
      } else {
        console.log('ℹ️ Player already in room:', body.playerName);
      }
      saveSimulatedData();
      return room;
    }

    if (method === 'POST' && param2 === 'leave') {
      const room = simulatedData.rooms.find(r => r.id === param1);
      if (!room) {
        console.error('❌ Room not found for leave:', param1);
        throw new Error('Room not found');
      }
      
      room.players = room.players.filter(p => p.id !== body.playerId);
      console.log('👋 Player left:', body.playerId, 'Remaining players:', room.players.length);
      
      if (room.players.length === 0) {
        simulatedData.rooms = simulatedData.rooms.filter(r => r.id !== param1);
        console.log('🗑️ Room deleted (empty):', param1);
      }
      saveSimulatedData();
      return { success: true };
    }

    if (method === 'POST' && param2 === 'start') {
      const room = simulatedData.rooms.find(r => r.id === param1);
      if (!room) {
        console.error('❌ Room not found for start:', param1);
        throw new Error('Room not found');
      }
      
      room.status = 'playing';
      const gameId = `game-${param1}`;
      
      const game = {
        id: gameId,
        roomId: param1,
        players: room.players.map((p, idx) => ({
          id: p.id,
          name: p.name,
          position: 0,
          money: 1500,
          properties: [],
          inJail: false,
          jailTurns: 0,
          isActive: idx === 0,
          color: p.color || ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'][idx] || 'bg-gray-500',
        })),
        currentPlayerIndex: 0,
        properties: [],
        turnNumber: 1,
        lastDiceRoll: null,
        gameOver: false,
      };
      
      simulatedData.games[gameId] = game;
      room.game = game;
      
      saveSimulatedData();
      console.log('🎮 Game started:', gameId, 'Players:', room.players.length);
      
      // Broadcast to all clients that game has started
      broadcastGameUpdate(gameId, game);
      
      return game;
    }

    throw new Error('Unknown room endpoint');
  }

  handleGameRequest(method, gameId, action, body) {
    if (!simulatedData.games[gameId]) {
      throw new Error('Game not found');
    }

    const game = simulatedData.games[gameId];

    if (method === 'GET') {
      return game;
    }

    if (method === 'POST' && action === 'roll') {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      game.lastDiceRoll = { d1, d2 };
      
      const playerIndex = game.players.findIndex(p => p.id === body.playerId);
      if (playerIndex !== -1) {
        const oldPosition = game.players[playerIndex].position;
        const newPosition = (oldPosition + d1 + d2) % 40;
        game.players[playerIndex].position = newPosition;
        
        // Passed GO
        if (newPosition < oldPosition) {
          game.players[playerIndex].money += 200;
        }
      }
      
      saveSimulatedData();
      broadcastGameUpdate(gameId, game);
      return game;
    }

    if (method === 'POST' && action === 'move') {
      const playerIndex = game.players.findIndex(p => p.id === body.playerId);
      if (playerIndex !== -1) {
        game.players[playerIndex].position = body.position;
      }
      saveSimulatedData();
      return game;
    }

    if (method === 'POST' && action === 'buy-property') {
      const playerIndex = game.players.findIndex(p => p.id === body.playerId);
      if (playerIndex !== -1) {
        const propertyCost = 200; // Simplified
        game.players[playerIndex].money -= propertyCost;
        game.players[playerIndex].properties.push(body.propertyId);
        
        // Add to properties array if not already there
        const existingProperty = game.properties.find(p => p.propertyId === body.propertyId);
        if (!existingProperty) {
          game.properties.push({
            propertyId: body.propertyId,
            ownerId: body.playerId,
          });
        }
      }
      saveSimulatedData();
      broadcastGameUpdate(gameId, game);
      return game;
    }

    if (method === 'POST' && action === 'pay-rent') {
      const playerIndex = game.players.findIndex(p => p.id === body.playerId);
      if (playerIndex !== -1) {
        const rent = 50; // Simplified
        game.players[playerIndex].money -= rent;
        
        const property = game.properties.find(p => p.propertyId === body.propertyId);
        if (property) {
          const ownerIndex = game.players.findIndex(p => p.id === property.ownerId);
          if (ownerIndex !== -1) {
            game.players[ownerIndex].money += rent;
          }
        }
      }
      saveSimulatedData();
      return game;
    }

    if (method === 'POST' && action === 'buy-house') {
      const property = game.properties[body.propertyId];
      if (property && property.houses < 4) {
        property.houses++;
        const playerIndex = game.players.findIndex(p => p.id === body.playerId);
        if (playerIndex !== -1) {
          game.players[playerIndex].money -= 100;
        }
      }
      saveSimulatedData();
      return game;
    }

    if (method === 'POST' && action === 'buy-hotel') {
      const property = game.properties[body.propertyId];
      if (property && property.houses === 4) {
        property.houses = 0;
        property.hotels = 1;
        const playerIndex = game.players.findIndex(p => p.id === body.playerId);
        if (playerIndex !== -1) {
          game.players[playerIndex].money -= 100;
        }
      }
      saveSimulatedData();
      return game;
    }

    if (method === 'POST' && action === 'end-turn') {
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
      game.turnNumber++;
      game.lastDiceRoll = null;
      
      game.players.forEach((p, idx) => {
        p.isActive = idx === game.currentPlayerIndex;
      });
      
      saveSimulatedData();
      return game;
    }

    throw new Error('Unknown game endpoint');
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

// Mock socket.io for simulated mode
if (USE_SIMULATED_RESPONSES) {
  // Create a mock socket.io implementation
  const createMockSocket = () => {
    const listeners = new Map();
    let connected = false;
    
    const mockSocket = {
      id: `mock-socket-${Date.now()}`,
      connected: false,
      
      on(event, callback) {
        if (!listeners.has(event)) {
          listeners.set(event, []);
        }
        listeners.get(event).push(callback);
        
        // Immediately trigger connect event
        if (event === 'connect' && !connected) {
          setTimeout(() => {
            connected = true;
            this.connected = true;
            callback();
          }, 100);
        }
        
        return this;
      },
      
      emit(event, ...args) {
        console.log('🔵 Mock Socket emit:', event, args);
        
        // Handle special events
        if (event === 'join-game') {
          const [gameId, playerId] = args;
          console.log('👋 Mock: Player joined game', gameId, playerId);
          
          // Simulate join response
          setTimeout(() => {
            this.trigger('player-joined', { gameId, playerId });
          }, 100);
        }
        
        return this;
      },
      
      off(event, callback) {
        if (listeners.has(event)) {
          const callbacks = listeners.get(event);
          const index = callbacks.indexOf(callback);
          if (index > -1) {
            callbacks.splice(index, 1);
          }
        }
        return this;
      },
      
      disconnect() {
        connected = false;
        this.connected = false;
        this.trigger('disconnect');
        console.log('👋 Mock Socket disconnected');
        return this;
      },
      
      // Internal method to trigger events
      trigger(event, data) {
        if (listeners.has(event)) {
          listeners.get(event).forEach(callback => callback(data));
        }
      }
    };
    
    // Listen for game updates from storage and broadcast to this socket
    window.addEventListener('game-update', (e) => {
      const { gameId, game } = e.detail;
      console.log('📡 Broadcasting game update via mock socket:', gameId);
      mockSocket.trigger('game-updated', game);
    });
    
    window.addEventListener('storage', (e) => {
      if (e.key === 'monopoly_simulated_data' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          // Notify about any game changes
          Object.values(data.games || {}).forEach(game => {
            mockSocket.trigger('game-updated', game);
          });
        } catch (err) {
          console.error('Error parsing storage update:', err);
        }
      }
    });
    
    return mockSocket;
  };
  
  // Export mock io function to replace socket.io-client
  window.__mockIO = (url, options) => {
    console.log('🔌 Creating mock socket connection to:', url);
    return createMockSocket();
  };
}

export default apiClient;








