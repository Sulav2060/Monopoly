import { Game } from "../types/game";

/**
 * Socket Service
 * Helper to emit game events to all connected players
 */
export class SocketService {
  /**
   * Emit game update to all players in a game room
   */
  static emitGameUpdate(gameId: string, game: Game) {
    const io = (global as any).io;
    if (!io) return;

    const roomKey = `game-${gameId}`;
    io.to(roomKey).emit("game-updated", {
      game,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit dice roll event
   */
  static emitDiceRoll(gameId: string, playerId: string, diceRoll: any) {
    const io = (global as any).io;
    if (!io) return;

    const roomKey = `game-${gameId}`;
    io.to(roomKey).emit("dice-rolled", {
      playerId,
      diceRoll,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit player moved event
   */
  static emitPlayerMoved(gameId: string, playerId: string, newPosition: number) {
    const io = (global as any).io;
    if (!io) return;

    const roomKey = `game-${gameId}`;
    io.to(roomKey).emit("player-moved", {
      playerId,
      newPosition,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit turn changed event
   */
  static emitTurnChanged(gameId: string, currentPlayerIndex: number) {
    const io = (global as any).io;
    if (!io) return;

    const roomKey = `game-${gameId}`;
    io.to(roomKey).emit("turn-changed", {
      currentPlayerIndex,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit property purchased event
   */
  static emitPropertyPurchased(
    gameId: string,
    playerId: string,
    propertyId: number
  ) {
    const io = (global as any).io;
    if (!io) return;

    const roomKey = `game-${gameId}`;
    io.to(roomKey).emit("property-purchased", {
      playerId,
      propertyId,
      timestamp: Date.now(),
    });
  }
}

export default SocketService;
