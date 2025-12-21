import { Room, Player, Game, GameState, PlayerStatus, PropertyType, Property } from "../types/game";
import GameStateMachine from "../engine/fsm";
import { v4 as uuidv4 } from "uuid";

/**
 * Room Manager
 * Handles multiple game rooms with max 4 players each
 */
export class RoomManager {
  private static instance: RoomManager;
  private rooms: Map<string, Room> = new Map();
  private gameInstances: Map<string, GameStateMachine> = new Map();

  /**
   * Get singleton instance
   */
  static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}

  /**
   * Create a new room
   * @param roomName Name of the room
   * @param hostId ID of the host player
   * @param hostName Name of the host player
   * @returns Created room
   */
  createRoom(roomName: string, hostId: string, hostName: string): Room {
    const roomId = uuidv4();
    const hostColor = this.getPlayerColor(0);

    const hostPlayer: Player = {
      id: hostId,
      name: hostName,
      color: hostColor,
      position: 0,
      money: 1500,
      ownedProperties: [],
      status: PlayerStatus.ACTIVE,
      inJail: false,
      jailTurns: 0,
      houses: 0,
      hotels: 0,
    };

    const room: Room = {
      id: roomId,
      name: roomName,
      host: hostId,
      players: [hostPlayer],
      maxPlayers: 4,
      createdAt: Date.now(),
      game: null,
      status: "WAITING",
    };

    this.rooms.set(roomId, room);
    return room;
  }

  /**
   * Get a room by ID
   */
  getRoom(roomId: string): Room | null {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Get all available rooms (not full and not started)
   */
  getAvailableRooms(): Room[] {
    return Array.from(this.rooms.values()).filter(
      (room) => room.status === "WAITING" && room.players.length < room.maxPlayers
    );
  }

  /**
   * Join a room
   * @throws Error if room is full or doesn't exist
   */
  joinRoom(roomId: string, playerId: string, playerName: string): Room {
    const room = this.getRoom(roomId);

    if (!room) {
      throw new Error("Room not found");
    }

    if (room.status !== "WAITING") {
      throw new Error("Room has already started or finished");
    }

    if (room.players.length >= room.maxPlayers) {
      throw new Error("Room is full");
    }

    // Check if player already in room
    if (room.players.some((p) => p.id === playerId)) {
      throw new Error("Player already in room");
    }

    const playerColor = this.getPlayerColor(room.players.length);
    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      color: playerColor,
      position: 0,
      money: 1500,
      ownedProperties: [],
      status: PlayerStatus.ACTIVE,
      inJail: false,
      jailTurns: 0,
      houses: 0,
      hotels: 0,
    };

    room.players.push(newPlayer);
    return room;
  }

  /**
   * Leave a room
   * @throws Error if room doesn't exist
   */
  leaveRoom(roomId: string, playerId: string): Room {
    const room = this.getRoom(roomId);

    if (!room) {
      throw new Error("Room not found");
    }

    room.players = room.players.filter((p) => p.id !== playerId);

    // If host left and room has players, assign new host
    if (room.host === playerId && room.players.length > 0) {
      const newHost = room.players[0];
      if (newHost) {
        room.host = newHost.id;
      }
    }

    // Delete room if empty
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
    }

    return room;
  }

  /**
   * Start game in room
   * @throws Error if not enough players or game already started
   */
  startGame(roomId: string): Game {
    const room = this.getRoom(roomId);

    if (!room) {
      throw new Error("Room not found");
    }

    if (room.status !== "WAITING") {
      throw new Error("Game already started or finished");
    }

    if (room.players.length < 2) {
      throw new Error("Need at least 2 players to start");
    }

    const gameId = uuidv4();
    const properties = this.initializeProperties();

    const game: Game = {
      id: gameId,
      roomId,
      players: room.players,
      currentPlayerIndex: 0,
      gameState: GameState.INITIALIZED,
      lastDiceRoll: null,
      properties,
      turn: 1,
      startedAt: Date.now(),
      endedAt: null,
    };

    const fsm = new GameStateMachine(game);
    this.gameInstances.set(gameId, fsm);

    room.game = game;
    room.status = "STARTED";

    // Return the full room so frontend gets room with attached game
    return game;
  }

  /**
   * Get game instance FSM
   */
  getGameFSM(gameId: string): GameStateMachine | null {
    return this.gameInstances.get(gameId) || null;
  }

  /**
   * End game
   */
  endGame(gameId: string): void {
    const game = Array.from(this.rooms.values()).find(
      (r) => r.game?.id === gameId
    )?.game;

    if (game) {
      game.endedAt = Date.now();
      const room = this.rooms.get(game.roomId);
      if (room) {
        room.status = "FINISHED";
      }
    }

    this.gameInstances.delete(gameId);
  }

  /**
   * Delete a room
   */
  deleteRoom(roomId: string): void {
    const room = this.getRoom(roomId);
    if (room?.game) {
      this.endGame(room.game.id);
    }
    this.rooms.delete(roomId);
  }

  /**
   * Get all rooms
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Get player color based on position
   */
  private getPlayerColor(position: number): string {
    const colors = ["red", "blue", "yellow", "green"];
    return colors[position % colors.length] ?? "red";
  }

  /**
   * Initialize Monopoly board properties
   */
  private initializeProperties(): Property[] {
    return [
      // GO
      {
        id: 0,
        name: "GO",
        type: PropertyType.CORNER,
        position: 0,
        price: 0,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 0,
        basePricePerHotel: 0,
        baseRent: [0],
      },
      // Properties: Dark Purple
      {
        id: 1,
        name: "Mediterranean Avenue",
        type: PropertyType.STREET,
        position: 1,
        price: 60,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 50,
        basePricePerHotel: 200,
        baseRent: [2, 10, 30, 90, 160, 250],
      },
      {
        id: 3,
        name: "Baltic Avenue",
        type: PropertyType.STREET,
        position: 3,
        price: 60,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 50,
        basePricePerHotel: 200,
        baseRent: [4, 20, 60, 180, 320, 450],
      },
      // Income Tax
      {
        id: 2,
        name: "Income Tax",
        type: PropertyType.TAX,
        position: 4,
        price: 0,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 0,
        basePricePerHotel: 0,
        baseRent: [200],
      },
      // Reading Railroad
      {
        id: 5,
        name: "Reading Railroad",
        type: PropertyType.RAILROAD,
        position: 5,
        price: 200,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 0,
        basePricePerHotel: 0,
        baseRent: [25, 50, 100, 200],
      },
      // Light Blue
      {
        id: 6,
        name: "Oriental Avenue",
        type: PropertyType.STREET,
        position: 6,
        price: 100,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 50,
        basePricePerHotel: 200,
        baseRent: [6, 30, 90, 270, 400, 550],
      },
      {
        id: 8,
        name: "Vermont Avenue",
        type: PropertyType.STREET,
        position: 8,
        price: 100,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 50,
        basePricePerHotel: 200,
        baseRent: [6, 30, 90, 270, 400, 550],
      },
      {
        id: 9,
        name: "Connecticut Avenue",
        type: PropertyType.STREET,
        position: 9,
        price: 120,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 50,
        basePricePerHotel: 200,
        baseRent: [8, 40, 120, 360, 640, 750],
      },
      // Just Visiting
      {
        id: 10,
        name: "Just Visiting",
        type: PropertyType.CORNER,
        position: 10,
        price: 0,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 0,
        basePricePerHotel: 0,
        baseRent: [0],
      },
      // Pink
      {
        id: 11,
        name: "St. Charles Place",
        type: PropertyType.STREET,
        position: 11,
        price: 140,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 100,
        basePricePerHotel: 300,
        baseRent: [10, 50, 150, 450, 625, 750],
      },
      {
        id: 13,
        name: "States Avenue",
        type: PropertyType.STREET,
        position: 13,
        price: 140,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 100,
        basePricePerHotel: 300,
        baseRent: [10, 50, 150, 450, 625, 750],
      },
      {
        id: 14,
        name: "Virginia Avenue",
        type: PropertyType.STREET,
        position: 14,
        price: 160,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 100,
        basePricePerHotel: 300,
        baseRent: [12, 60, 180, 500, 700, 900],
      },
      // Pennsylvania Railroad
      {
        id: 15,
        name: "Pennsylvania Railroad",
        type: PropertyType.RAILROAD,
        position: 15,
        price: 200,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 0,
        basePricePerHotel: 0,
        baseRent: [25, 50, 100, 200],
      },
      // Orange
      {
        id: 16,
        name: "St. James Place",
        type: PropertyType.STREET,
        position: 16,
        price: 180,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 100,
        basePricePerHotel: 300,
        baseRent: [14, 70, 200, 550, 750, 950],
      },
      {
        id: 18,
        name: "Tennessee Avenue",
        type: PropertyType.STREET,
        position: 18,
        price: 180,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 100,
        basePricePerHotel: 300,
        baseRent: [14, 70, 200, 550, 750, 950],
      },
      {
        id: 19,
        name: "New York Avenue",
        type: PropertyType.STREET,
        position: 19,
        price: 200,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 100,
        basePricePerHotel: 300,
        baseRent: [16, 80, 220, 600, 800, 1000],
      },
      // Free Parking
      {
        id: 20,
        name: "Free Parking",
        type: PropertyType.CORNER,
        position: 20,
        price: 0,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 0,
        basePricePerHotel: 0,
        baseRent: [0],
      },
      // Red
      {
        id: 21,
        name: "Kentucky Avenue",
        type: PropertyType.STREET,
        position: 21,
        price: 220,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 150,
        basePricePerHotel: 400,
        baseRent: [18, 90, 250, 700, 875, 1050],
      },
      {
        id: 23,
        name: "Indiana Avenue",
        type: PropertyType.STREET,
        position: 23,
        price: 220,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 150,
        basePricePerHotel: 400,
        baseRent: [18, 90, 250, 700, 875, 1050],
      },
      {
        id: 24,
        name: "Illinois Avenue",
        type: PropertyType.STREET,
        position: 24,
        price: 240,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 150,
        basePricePerHotel: 400,
        baseRent: [20, 100, 300, 750, 925, 1100],
      },
      // B&O Railroad
      {
        id: 25,
        name: "B&O Railroad",
        type: PropertyType.RAILROAD,
        position: 25,
        price: 200,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 0,
        basePricePerHotel: 0,
        baseRent: [25, 50, 100, 200],
      },
      // Yellow
      {
        id: 26,
        name: "Atlantic Avenue",
        type: PropertyType.STREET,
        position: 26,
        price: 260,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 150,
        basePricePerHotel: 400,
        baseRent: [22, 110, 330, 800, 975, 1150],
      },
      {
        id: 27,
        name: "Ventnor Avenue",
        type: PropertyType.STREET,
        position: 27,
        price: 260,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 150,
        basePricePerHotel: 400,
        baseRent: [22, 110, 330, 800, 975, 1150],
      },
      {
        id: 29,
        name: "Marvin Gardens",
        type: PropertyType.STREET,
        position: 29,
        price: 280,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 150,
        basePricePerHotel: 400,
        baseRent: [24, 120, 360, 850, 1025, 1200],
      },
      // Go to Jail
      {
        id: 30,
        name: "Go to Jail",
        type: PropertyType.CORNER,
        position: 30,
        price: 0,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 0,
        basePricePerHotel: 0,
        baseRent: [0],
      },
      // Green
      {
        id: 31,
        name: "Pacific Avenue",
        type: PropertyType.STREET,
        position: 31,
        price: 300,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 200,
        basePricePerHotel: 500,
        baseRent: [26, 130, 390, 900, 1100, 1275],
      },
      {
        id: 32,
        name: "North Carolina Avenue",
        type: PropertyType.STREET,
        position: 32,
        price: 300,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 200,
        basePricePerHotel: 500,
        baseRent: [26, 130, 390, 900, 1100, 1275],
      },
      {
        id: 34,
        name: "Pennsylvania Avenue",
        type: PropertyType.STREET,
        position: 34,
        price: 320,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 200,
        basePricePerHotel: 500,
        baseRent: [28, 150, 450, 1000, 1200, 1400],
      },
      // Short Line
      {
        id: 35,
        name: "Short Line",
        type: PropertyType.RAILROAD,
        position: 35,
        price: 200,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 0,
        basePricePerHotel: 0,
        baseRent: [25, 50, 100, 200],
      },
      // Blue
      {
        id: 37,
        name: "Park Place",
        type: PropertyType.STREET,
        position: 37,
        price: 350,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 200,
        basePricePerHotel: 500,
        baseRent: [35, 175, 500, 1100, 1300, 1500],
      },
      {
        id: 39,
        name: "Boardwalk",
        type: PropertyType.STREET,
        position: 39,
        price: 400,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 200,
        basePricePerHotel: 500,
        baseRent: [50, 200, 600, 1400, 1700, 2000],
      },
      // Luxury Tax
      {
        id: 36,
        name: "Luxury Tax",
        type: PropertyType.TAX,
        position: 38,
        price: 0,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotels: 0,
        basePricePerHouse: 0,
        basePricePerHotel: 0,
        baseRent: [100],
      },
    ];
  }
}

export default RoomManager;
