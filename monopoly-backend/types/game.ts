// Game States FSM
export enum GameState {
  WAITING = "WAITING",
  INITIALIZED = "INITIALIZED",
  ROLLING = "ROLLING",
  MOVING = "MOVING",
  PROPERTY_TRANSACTION = "PROPERTY_TRANSACTION",
  JAIL = "JAIL",
  TURN_END = "TURN_END",
  GAME_OVER = "GAME_OVER",
}

// Player Status
export enum PlayerStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANKRUPT = "BANKRUPT",
}

// Property types
export enum PropertyType {
  STREET = "STREET",
  RAILROAD = "RAILROAD",
  UTILITY = "UTILITY",
  TAX = "TAX",
  CORNER = "CORNER",
}

// Player interface
export interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
  money: number;
  ownedProperties: number[];
  status: PlayerStatus;
  inJail: boolean;
  jailTurns: number;
  houses: number;
  hotels: number;
}

// Dice roll result
export interface DiceRoll {
  d1: number;
  d2: number;
  isDouble: boolean;
  total: number;
  timestamp: number;
}

// Property interface
export interface Property {
  id: number;
  name: string;
  type: PropertyType;
  position: number;
  price: number;
  owner: string | null;
  mortgaged: boolean;
  houses: number;
  hotels: number;
  basePricePerHouse: number;
  basePricePerHotel: number;
  baseRent: number[];
}

// Game interface
export interface Game {
  id: string;
  roomId: string;
  players: Player[];
  currentPlayerIndex: number;
  gameState: GameState;
  lastDiceRoll: DiceRoll | null;
  properties: Property[];
  turn: number;
  startedAt: number;
  endedAt: number | null;
}

// Room interface
export interface Room {
  id: string;
  name: string;
  host: string;
  players: Player[];
  maxPlayers: number;
  createdAt: number;
  game: Game | null;
  status: "WAITING" | "STARTED" | "FINISHED";
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
