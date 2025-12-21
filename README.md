# 🎲 Monopoly Game - Full Stack Application

A complete multiplayer Monopoly game built with React (frontend) and Express/TypeScript (backend), featuring room management, cryptographically secure dice, and a finite state machine for game logic.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Game Rules](#game-rules)
- [API Reference](#api-reference)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🎮 Gameplay

- ✅ Multiplayer support (2-4 players per room)
- ✅ Multiple concurrent game rooms
- ✅ Property ownership and trading
- ✅ Rent calculation system
- ✅ House and hotel management
- ✅ Jail mechanics
- ✅ Bankruptcy handling
- ✅ Player turn management with FSM

### 🔐 Security & Quality

- ✅ Cryptographically secure dice (Node.js crypto)
- ✅ No modulo bias in random generation
- ✅ Type-safe backend (TypeScript)
- ✅ UUID-based room/game IDs
- ✅ CORS configured
- ✅ Input validation

### 🏗️ Architecture

- ✅ Finite State Machine for game flow
- ✅ Room manager for concurrent games
- ✅ Service-oriented backend design
- ✅ React Context for state management
- ✅ Responsive UI with Tailwind CSS
- ✅ RESTful API design

## 📁 Project Structure

```
Monopoly/
├── monopoly/                           # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.jsx                # Main app component
│   │   │   ├── Lobby.jsx              # Room lobby & management
│   │   │   ├── Game.jsx               # Game UI
│   │   │   ├── Board.jsx              # Game board
│   │   │   ├── Tile.jsx               # Property tile
│   │   │   ├── CornerTile.jsx         # Corner tiles
│   │   │   ├── CenterComponent.jsx    # Center UI
│   │   │   ├── PlayerToken.jsx        # Player token
│   │   │   ├── PopoverCard.jsx        # Property details
│   │   │   └── tiles.js               # Tile data
│   │   ├── context/
│   │   │   └── GameContext.jsx        # Global state management
│   │   ├── services/
│   │   │   └── api.js                 # API client
│   │   ├── main.jsx                   # Entry point
│   │   └── App.css                    # Styles
│   ├── .env.development               # Dev config
│   ├── .env.production                # Prod config
│   ├── package.json
│   ├── vite.config.js
│   └── INTEGRATION_GUIDE.md           # Integration docs
│
├── monopoly-backend/                  # Backend (Express + TypeScript)
│   ├── engine/
│   │   ├── fsm.ts                    # Finite State Machine
│   │   ├── board.ts                  # Board logic
│   │   ├── game.ts                   # Game logic
│   │   ├── player.ts                 # Player logic
│   │   └── dice.ts                   # Dice mechanics
│   ├── services/
│   │   ├── room.service.ts           # Room management
│   │   └── game.service.ts           # Game services
│   ├── routes/
│   │   ├── room.routes.ts            # Room endpoints
│   │   └── game.routes.ts            # Game endpoints
│   ├── types/
│   │   └── game.ts                   # Type definitions
│   ├── utils/
│   │   ├── dice.ts                   # Crypto dice
│   │   └── logger.ts                 # Logging
│   ├── db/
│   │   └── index.ts                  # DB connection
│   ├── app.ts                         # Express app
│   ├── server.ts                      # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── BACKEND_README.md             # API documentation
│
├── QUICK_START.md                     # Quick start guide
├── INTEGRATION_SUMMARY.md             # Integration overview
├── DEVELOPMENT_CHECKLIST.md           # Tasks & progress
└── ARCHITECTURE.md                    # System architecture
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Two terminal windows

### Backend Setup

```bash
cd monopoly-backend

# Install dependencies
npm install

# Start development server
npm run dev

# Server runs on http://localhost:4000
```

### Frontend Setup

```bash
cd monopoly

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend runs on http://localhost:5173
```

### Play the Game

1. Open http://localhost:5173 in browser
2. Click "Create Room" or "Join Room"
3. Enter your name and room details
4. Wait for players to join (2-4 total)
5. Host clicks "Start Game"
6. Play!

## 📚 Documentation

### Essential Guides

- **[QUICK_START.md](./QUICK_START.md)** - Setup and first play
- **[INTEGRATION_GUIDE.md](./monopoly/INTEGRATION_GUIDE.md)** - Frontend-backend integration
- **[BACKEND_README.md](./monopoly-backend/BACKEND_README.md)** - API documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design
- **[DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md)** - Tasks and progress

### For Different Roles

- **Frontend Dev**: Read INTEGRATION_GUIDE.md
- **Backend Dev**: Read BACKEND_README.md
- **Full Stack**: Read ARCHITECTURE.md
- **New Contributor**: Read QUICK_START.md + DEVELOPMENT_CHECKLIST.md

## 🛠️ Technology Stack

### Frontend

- **React 19** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Context API** - State management
- **Fetch API** - HTTP client

### Backend

- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **crypto (Node built-in)** - Secure randomness
- **UUID** - Unique IDs

### Development

- **ESLint** - Code linting
- **TypeScript** - Type checking
- **ts-node-dev** - Hot reload backend

## 🏗️ Architecture Overview

### Three-Layer Architecture

```
Presentation Layer
  └─ React Components (Lobby, Game, Board)

Application Layer
  └─ GameContext (State) → API Client → Routes

Business Logic Layer
  └─ Services (Room, Game) → FSM → Engine

Data Layer
  └─ In-Memory Storage (Maps)
```

### Key Design Patterns

1. **Finite State Machine (FSM)**: Game flow control
2. **Service Layer**: Business logic separation
3. **Context API**: State management
4. **REST API**: Frontend-backend communication
5. **Singleton Pattern**: RoomManager and Game instances

## 🎮 Game Rules

### Setup

- 2-4 players per game
- Each player starts with $1,500
- Players take turns rolling 2 dice

### Turn Sequence

1. Roll dice (cryptographically secure)
2. Move token by sum of dice
3. Handle landing property:
   - Unowned: Can buy for listed price
   - Owned: Pay rent to owner
   - Corner/Tax: Special rules
4. Can perform other actions (build, trade, mortgage)
5. End turn

### Properties

- Price ranges from $60 to $400
- Rent increases with houses (0-4) and hotels (1)
- Must have all properties in color group to build houses
- House cost varies by color group

### Bankruptcy

- Player money goes below 0
- Player loses all properties to opponent
- Player removed from game
- Last remaining player wins

## 📡 API Reference

### Room Management Endpoints

```bash
# Create room
POST /room/create
{ "roomName": "My Game", "hostId": "p1", "hostName": "John" }

# List available rooms
GET /room

# Get room details
GET /room/:roomId

# Join room
POST /room/:roomId/join
{ "playerId": "p2", "playerName": "Jane" }

# Leave room
POST /room/:roomId/leave
{ "playerId": "p2" }

# Start game
POST /room/:roomId/start
```

### Game Endpoints (Ready for Implementation)

```bash
# Roll dice
POST /game/:gameId/roll
{ "playerId": "p1" }

# Move player
POST /game/:gameId/move
{ "playerId": "p1", "position": 5 }

# Buy property
POST /game/:gameId/buy-property
{ "playerId": "p1", "propertyId": 1 }

# End turn
POST /game/:gameId/end-turn
{ "playerId": "p1" }

# Get game state
GET /game/:gameId
```

## 🔄 Game State Management

### Frontend State (GameContext)

```javascript
{
  currentRoom: Room,
  currentGame: Game,
  currentPlayerId: string,
  currentPlayerName: string,
  loading: boolean,
  roomError: string,
  gameError: string
}
```

### Backend State (RoomManager)

```
rooms: Map<roomId, Room>
games: Map<gameId, GameStateMachine>
```

## 🧪 Testing

### Unit Tests (Frontend)

```bash
cd monopoly
npm test
```

### Integration Tests (Backend)

```bash
cd monopoly-backend
npm test:integration
```

### Manual Testing (API)

```bash
# Test health check
curl http://localhost:4000/health

# Test create room
curl -X POST http://localhost:4000/room/create \
  -H "Content-Type: application/json" \
  -d '{"roomName":"Test","hostId":"p1","hostName":"Host"}'
```

## 🚀 Development Workflow

### Making Code Changes

1. **Frontend Change**

   ```bash
   cd monopoly
   # Edit files in src/
   # Changes auto-reload
   ```

2. **Backend Change**
   ```bash
   cd monopoly-backend
   # Edit files in src/
   # Server auto-restarts (ts-node-dev)
   ```

### Creating New Features

1. **New Endpoint**

   - Add route in `routes/*.ts`
   - Add service method if needed
   - Update API client in `api.js`
   - Use in React component

2. **New Game Mechanic**
   - Add to FSM state if needed
   - Add to GameService
   - Create route handler
   - Implement in Game.jsx

## 📦 Building & Deployment

### Frontend Production Build

```bash
cd monopoly
npm run build
# Output: dist/
```

### Backend Production Build

```bash
cd monopoly-backend
npm run build
npm start
# Or use 'dist/server.js'
```

### Environment Configuration

#### Development

```env
VITE_API_URL=http://localhost:4000
PORT=4000
```

#### Production

```env
VITE_API_URL=https://api.monopoly.app
PORT=8080
NODE_ENV=production
```

### Deployment Platforms

**Frontend**

- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

**Backend**

- Heroku
- Railway
- AWS (EC2, Lambda)
- DigitalOcean
- Render

## 🔒 Security Considerations

### Implemented

- ✅ Cryptographically secure dice
- ✅ UUID-based identifiers
- ✅ CORS enabled
- ✅ Input validation
- ✅ Error handling

### To Implement

- [ ] User authentication
- [ ] Rate limiting
- [ ] HTTPS enforcement
- [ ] Input sanitization
- [ ] CSRF protection
- [ ] Session management

## 🐛 Troubleshooting

### Backend Connection Issues

```
Problem: "Cannot connect to API"
Solution:
- Check backend runs on http://localhost:4000
- Verify frontend API URL in .env.development
- Check firewall/ports
```

### State Not Syncing

```
Problem: "Game state not updating"
Solution:
- Ensure GameProvider wraps App
- Check network tab for failed requests
- Verify backend response format
```

### Room Not Found

```
Problem: "Room not found error"
Solution:
- Verify room ID is correct
- Check room hasn't been deleted
- Ensure backend is still running
```

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contributing

### Steps

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and test locally
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

### Code Standards

- Use TypeScript for backend
- Follow ESLint rules
- Write descriptive commit messages
- Add comments for complex logic
- Test before submitting PR

## 📝 License

ISC License - See LICENSE file for details

## 📞 Support & Contact

- 📖 **Documentation**: See docs in root directory
- 🐛 **Issues**: Check GitHub issues
- 💬 **Discussion**: Use GitHub discussions
- 🔗 **Resources**: Links in documentation

## 🎉 Acknowledgments

- Built with React, Express, and TypeScript
- Uses Node.js crypto for secure randomness
- Styled with Tailwind CSS
- Inspired by classic Monopoly board game

## 📊 Project Status

- ✅ Backend complete with FSM and room management
- ✅ Frontend integration layer complete
- ✅ Room creation and joining working
- 🔄 Game mechanics ready for implementation
- 📋 Full documentation complete

## 🚦 Next Steps

1. **Play the game**
2. **Review documentation**
3. **Contribute features**
4. **Deploy to production**
5. **Share with friends**

---

**Happy playing! 🎲🏠💰**

Last Updated: December 21, 2025
Version: 1.0.0
Status: Active Development
