# Frontend-Backend Integration Guide

This document describes how the frontend and backend are integrated for the Monopoly game.

## Architecture Overview

```
Frontend (React + Vite)
    ↓
GameContext (State Management)
    ↓
API Client (services/api.js)
    ↓
Backend (Express + TypeScript)
    ↓
Game Engine (FSM, Room Manager, Services)
```

## Frontend Structure

### Components

#### Lobby.jsx

- Room creation and joining interface
- Player name and room selection
- Displays available rooms
- Host can start the game

**Usage:**

```jsx
<Lobby onGameStart={handleGameStart} />
```

#### Game.jsx

- Main game UI with board, dice, players
- Integrates with backend game state
- Handles player turns and actions

#### Board.jsx

- Visual representation of the Monopoly board
- Displays player tokens
- Handles tile click events
- Shows popover cards for property details

### Context

#### GameContext.jsx

Provides centralized state management for:

- Room management (create, join, leave)
- Game state (start, roll dice, buy property)
- Player information
- Error handling and loading states

**Usage:**

```jsx
const { currentGame, rollDice, buyProperty } = useGame();
```

### Services

#### api.js

RESTful API client with endpoints:

```javascript
// Room API
roomAPI.createRoom(name, hostId, hostName);
roomAPI.getAvailableRooms();
roomAPI.getRoom(roomId);
roomAPI.joinRoom(roomId, playerId, playerName);
roomAPI.leaveRoom(roomId, playerId);
roomAPI.startGame(roomId);

// Game API
gameAPI.rollDice(gameId);
gameAPI.movePlayer(gameId, playerId, position);
gameAPI.buyProperty(gameId, playerId, propertyId);
gameAPI.endTurn(gameId, playerId);
gameAPI.getGameState(gameId);
```

## Environment Configuration

### Development (.env.development)

```
VITE_API_URL=http://localhost:4000
```

### Production (.env.production)

```
VITE_API_URL=https://api.monopoly.app
```

Access via:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Game Flow Integration

### 1. Room Creation

```
User clicks "Create Room"
  ↓
GameContext.createRoom()
  ↓
POST /room/create
  ↓
Backend creates room
  ↓
Frontend updates currentRoom state
  ↓
Display room lobby with players
```

### 2. Game Start

```
Host clicks "Start Game"
  ↓
GameContext.startGame()
  ↓
POST /room/:roomId/start
  ↓
Backend initializes game with FSM
  ↓
Frontend receives Game object
  ↓
Display Game component with board
```

### 3. Dice Roll

```
Player clicks "Roll Dice"
  ↓
GameContext.rollDice()
  ↓
POST /game/:gameId/roll
  ↓
Backend: CryptoDice.rollTwoDice()
  ↓
Returns DiceRoll with d1, d2, isDouble, total
  ↓
Frontend animates dice and moves player
```

### 4. Property Transaction

```
Player lands on property
  ↓
Player clicks "Buy Property"
  ↓
GameContext.buyProperty(propertyId)
  ↓
POST /game/:gameId/buy-property
  ↓
Backend validates and updates game state
  ↓
Frontend updates player money and properties
```

## State Management Flow

### Game State Object

```typescript
{
  id: string,
  roomId: string,
  players: Player[],
  currentPlayerIndex: number,
  gameState: GameState,
  lastDiceRoll: DiceRoll,
  properties: Property[],
  turn: number,
  startedAt: number,
  endedAt: number | null
}
```

### Player State Object

```typescript
{
  id: string,
  name: string,
  color: string,
  position: number,
  money: number,
  ownedProperties: number[],
  status: PlayerStatus,
  inJail: boolean,
  jailTurns: number,
  houses: number,
  hotels: number
}
```

## Error Handling

All API calls wrap errors in try-catch blocks:

```javascript
try {
  await gameAPI.rollDice(gameId);
} catch (error) {
  setGameError(error.message);
  showNotification(error.message, "error");
}
```

Standard error response format:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Real-Time Updates

Currently implemented via polling in frontend. For production, consider:

### WebSocket Integration (Future)

```javascript
// Listen for game state changes
socket.on("game:state-updated", (game) => {
  setCurrentGame(game);
});

// Listen for player actions
socket.on("player:action", (action) => {
  handleRemotePlayerAction(action);
});
```

## Development Workflow

### Starting Both Services

**Terminal 1 - Backend:**

```bash
cd monopoly-backend
npm install
npm run dev
# Runs on http://localhost:4000
```

**Terminal 2 - Frontend:**

```bash
cd monopoly
npm install
npm run dev
# Runs on http://localhost:5173
```

### Testing Integration

1. Open frontend: http://localhost:5173
2. Backend API: http://localhost:4000
3. Health check: http://localhost:4000/health

## Common Integration Issues

### CORS Errors

- Ensure backend has CORS enabled
- Check API_URL matches backend port
- Verify `.env.development` has correct URL

### API Response Mismatches

- Ensure TypeScript types match backend schemas
- Update `api.js` endpoints if backend changes
- Check response data structure in console

### State Sync Issues

- Verify GameContext is wrapping App component
- Check useGame hook is called in correct component
- Ensure loading states prevent race conditions

## Future Enhancements

- [ ] WebSocket for real-time updates
- [ ] Game replay functionality
- [ ] Chat system integration
- [ ] Spectator mode
- [ ] Mobile responsive design
- [ ] Audio/sound effects
- [ ] Authentication system
- [ ] Leaderboard integration

## API Documentation

See [BACKEND_README.md](../monopoly-backend/BACKEND_README.md) for complete API documentation.

## TypeScript Support

Frontend services use JSDoc for type hints. Consider migrating to TypeScript for:

- Better IDE autocomplete
- Type safety across API calls
- Reduced runtime errors

## Performance Considerations

1. **State Updates**: Minimize re-renders with proper dependency arrays
2. **API Calls**: Implement debouncing for rapid actions
3. **Game Loop**: Consider game tick rate (turns/second)
4. **Memory**: Clear timers and listeners on component unmount

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### API Testing with curl

```bash
# Create room
curl -X POST http://localhost:4000/room/create \
  -H "Content-Type: application/json" \
  -d '{"roomName":"Test","hostId":"p1","hostName":"Host"}'

# Join room
curl -X POST http://localhost:4000/room/ROOM_ID/join \
  -H "Content-Type: application/json" \
  -d '{"playerId":"p2","playerName":"Player2"}'

# Start game
curl -X POST http://localhost:4000/room/ROOM_ID/start
```

## Deployment

### Frontend (Vite)

```bash
npm run build
# Output: dist/
# Deploy to: Netlify, Vercel, GitHub Pages
```

### Backend (Node.js)

```bash
npm run build
npm start
# Deploy to: Heroku, AWS, DigitalOcean, Railway
```

### Environment Variables

Update `.env.production` with production backend URL before building.
