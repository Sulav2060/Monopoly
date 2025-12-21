# Monopoly Backend API

A robust backend implementation for a multiplayer Monopoly game with Finite State Machine (FSM) architecture, room management system, and cryptographically secure random number generation.

## Features

### 🎮 Game State Machine (FSM)

- **State Management**: Implements a proper FSM with validated state transitions
- **Valid States**: WAITING → INITIALIZED → ROLLING → MOVING → PROPERTY_TRANSACTION → TURN_END → GAME_OVER
- **State Transitions**: Enforces game flow rules

### 🏠 Room Management

- **Multiple Rooms**: Support unlimited concurrent game rooms
- **Player Capacity**: Each room supports up to 4 players
- **Room Status**: Tracks WAITING, STARTED, and FINISHED states
- **Dynamic Host Assignment**: If host leaves, another player becomes host

### 🎲 Cryptographic Dice

- **Secure RNG**: Uses Node.js `crypto` module for true randomness
- **Rejection Sampling**: Ensures uniform distribution for dice rolls
- **No Bias**: Eliminates modulo bias in random number generation

### 🎯 Game Features

- **Player Management**: Track player positions, money, properties, houses, and hotels
- **Property System**: Full Monopoly board with all properties, railroads, and utilities
- **Bankruptcy Tracking**: Automatic player removal when bankrupt
- **Turn Management**: Sequential player turns with proper turn tracking

## Project Structure

```
monopoly-backend/
├── engine/
│   ├── fsm.ts              # Game State Machine implementation
│   ├── board.ts            # Board management
│   ├── game.ts             # Game logic
│   ├── player.ts           # Player management
│   └── dice.ts             # Dice mechanics
├── services/
│   ├── game.service.ts     # Game service logic
│   └── room.service.ts     # Room management service
├── routes/
│   ├── game.routes.ts      # Game endpoints
│   └── room.routes.ts      # Room endpoints
├── types/
│   └── game.ts             # TypeScript type definitions
├── utils/
│   ├── dice.ts             # Crypto dice implementation
│   └── logger.ts           # Logging utility
├── db/
│   └── index.ts            # Database connections (placeholder)
├── app.ts                  # Express app setup
├── server.ts               # Server entry point
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript config
```

## API Endpoints

### Room Management

#### Create Room

```
POST /room/create
Content-Type: application/json

{
  "roomName": "My Game Room",
  "hostId": "player-123",
  "hostName": "John Doe"
}

Response:
{
  "success": true,
  "data": {
    "id": "room-uuid",
    "name": "My Game Room",
    "host": "player-123",
    "players": [...],
    "maxPlayers": 4,
    "createdAt": 1703107200000,
    "game": null,
    "status": "WAITING"
  }
}
```

#### Get Room Details

```
GET /room/:roomId

Response:
{
  "success": true,
  "data": { /* room object */ }
}
```

#### List Available Rooms

```
GET /room

Response:
{
  "success": true,
  "data": [/* available rooms */]
}
```

#### Join Room

```
POST /room/:roomId/join
Content-Type: application/json

{
  "playerId": "player-456",
  "playerName": "Jane Doe"
}

Response:
{
  "success": true,
  "data": { /* updated room object */ }
}
```

#### Leave Room

```
POST /room/:roomId/leave
Content-Type: application/json

{
  "playerId": "player-456"
}

Response:
{
  "success": true,
  "data": { /* updated room object */ }
}
```

#### Start Game

```
POST /room/:roomId/start

Response:
{
  "success": true,
  "data": {
    "id": "game-uuid",
    "roomId": "room-uuid",
    "players": [...],
    "currentPlayerIndex": 0,
    "gameState": "INITIALIZED",
    "lastDiceRoll": null,
    "properties": [...],
    "turn": 1,
    "startedAt": 1703107200000,
    "endedAt": null
  }
}
```

## Type Definitions

### GameState

```typescript
enum GameState {
  WAITING = "WAITING",
  INITIALIZED = "INITIALIZED",
  ROLLING = "ROLLING",
  MOVING = "MOVING",
  PROPERTY_TRANSACTION = "PROPERTY_TRANSACTION",
  JAIL = "JAIL",
  TURN_END = "TURN_END",
  GAME_OVER = "GAME_OVER",
}
```

### Player

```typescript
interface Player {
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
```

### Room

```typescript
interface Room {
  id: string;
  name: string;
  host: string;
  players: Player[];
  maxPlayers: number;
  createdAt: number;
  game: Game | null;
  status: "WAITING" | "STARTED" | "FINISHED";
}
```

### Game

```typescript
interface Game {
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
```

## Dice Implementation

The dice system uses Node.js `crypto` for cryptographically secure random number generation:

```typescript
// Roll a single die (1-6)
const value = CryptoDice.rollSingleDie();

// Roll two dice
const { d1, d2, isDouble, total } = CryptoDice.rollTwoDice();

// Random number in range
const random = CryptoDice.randomInRange(1, 10);
```

### How it Works

- Uses `crypto.randomBytes()` for secure entropy
- Implements rejection sampling to eliminate modulo bias
- Each roll is unpredictable and cannot be manipulated

## State Machine FSM

### State Transitions

```
WAITING
  ↓
INITIALIZED
  ↓
ROLLING
  ↓
MOVING
  ↙    ↓    ↘
   ↓   ↓    JAIL
   ↓   ↓
   ↓  PROPERTY_TRANSACTION
   ↓           ↓
TURN_END ←─────┘
  ↙ ↘
ROLLING  GAME_OVER
```

### Validation

```typescript
// Check if transition is valid
fsm.canTransitionTo(GameState.ROLLING);

// Get valid next states
const validStates = fsm.getValidNextStates();

// Transition to new state
fsm.transitionTo(GameState.MOVING);
```

## Game Flow

1. **Room Creation**: Host creates a room
2. **Player Join**: Players join the room (max 4)
3. **Game Start**: Host starts the game
4. **Initialization**: Game initializes with all properties
5. **Turn Loop**:
   - Player rolls dice (cryptographic)
   - Player moves token
   - Property transaction (buy, pay rent, etc.)
   - Turn ends, next player's turn
6. **Game End**: When only 1 player remains

## Running the Server

### Development

```bash
npm install
npm run dev
```

### Production

```bash
npm install
npm run build
npm start
```

The server runs on port 4000 by default (configurable via `PORT` env variable).

## Environment Variables

```env
PORT=4000
NODE_ENV=development
```

## Technologies Used

- **Express.js**: Web framework
- **TypeScript**: Type-safe JavaScript
- **Node.js Crypto**: Secure random number generation
- **CORS**: Cross-origin resource sharing
- **UUID**: Unique identifiers

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Database persistence (MongoDB/PostgreSQL)
- [ ] Authentication & Authorization
- [ ] Game replay/history
- [ ] Chat system
- [ ] Spectator mode
- [ ] Tournament system
- [ ] Leaderboard
- [ ] AI players

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

## Error Handling

All endpoints return standardized responses:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

## Security

- Cryptographically secure dice rolls prevent manipulation
- UUID for game and room IDs
- CORS configured for cross-origin requests
- Input validation on all endpoints

## License

ISC

## Support

For issues and feature requests, please open an issue on GitHub.
