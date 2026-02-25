import { GameState } from "../types/game";

type Game = {
  id: string;
  state: GameState;
  lastActive: number;
};

const games = new Map<string, Game>();
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Check every 1 hour
const MAX_INACTIVE_TIME_MS = 24 * 60 * 60 * 1000; // Delete after 24 hours of inactivity

export function getGame(gameId: string): Game | undefined {
  const game = games.get(gameId);
  if (game) {
    game.lastActive = Date.now();
    console.log(`✅ Game found: ${gameId}`);
  } else {
    console.log(`❌ Game NOT found: ${gameId} (Total games: ${games.size}, Available: ${Array.from(games.keys()).join(', ') || 'none'})`);
  }
  return game;
}

export function createGame(gameId: string, state: GameState) {
  games.set(gameId, { 
    id: gameId, 
    state, 
    lastActive: Date.now() 
  });
  console.log(`📝 Game created: ${gameId} (Total games: ${games.size})`);
}

export function getAllGameIds(): string[] {
  return Array.from(games.keys());
}

export function getGameCount(): number {
  return games.size;
}

export function updateGame(gameId: string, state: GameState) {
  const game = games.get(gameId);
  if (game) {
    game.state = state;
    game.lastActive = Date.now();
  }
}

export function startGameCleanup() {
  setInterval(() => {
    const now = Date.now();
    let deletedCount = 0;
    
    for (const [id, game] of games.entries()) {
      if (now - game.lastActive > MAX_INACTIVE_TIME_MS) {
        games.delete(id);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      console.log(`🧹 Cleanup: Removed ${deletedCount} inactive games`);
    }
  }, CLEANUP_INTERVAL_MS);
}
