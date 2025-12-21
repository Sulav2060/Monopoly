import { GameState, Game, Player, PlayerStatus, DiceRoll } from "../types/game";
import CryptoDice from "../utils/dice";

/**
 * Game State Machine Manager
 * Handles state transitions and game flow
 */
export class GameStateMachine {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  /**
   * Get current game state
   */
  getCurrentState(): GameState {
    return this.game.gameState;
  }

  /**
   * Transition to a new state
   * @param newState Target game state
   * @throws Error if transition is invalid
   */
  transitionTo(newState: GameState): void {
    const currentState = this.game.gameState;

    // Define valid transitions
    const validTransitions: Record<GameState, GameState[]> = {
      [GameState.WAITING]: [GameState.INITIALIZED],
      [GameState.INITIALIZED]: [GameState.ROLLING],
      [GameState.ROLLING]: [GameState.MOVING],
      [GameState.MOVING]: [
        GameState.PROPERTY_TRANSACTION,
        GameState.JAIL,
        GameState.TURN_END,
      ],
      [GameState.PROPERTY_TRANSACTION]: [GameState.TURN_END],
      [GameState.JAIL]: [GameState.ROLLING],
      [GameState.TURN_END]: [GameState.ROLLING, GameState.GAME_OVER],
      [GameState.GAME_OVER]: [],
    };

    if (!validTransitions[currentState].includes(newState)) {
      throw new Error(
        `Invalid transition from ${currentState} to ${newState}`
      );
    }

    this.game.gameState = newState;
  }

  /**
   * Can the game transition to a state
   */
  canTransitionTo(newState: GameState): boolean {
    const validTransitions: Record<GameState, GameState[]> = {
      [GameState.WAITING]: [GameState.INITIALIZED],
      [GameState.INITIALIZED]: [GameState.ROLLING],
      [GameState.ROLLING]: [GameState.MOVING],
      [GameState.MOVING]: [
        GameState.PROPERTY_TRANSACTION,
        GameState.JAIL,
        GameState.TURN_END,
      ],
      [GameState.PROPERTY_TRANSACTION]: [GameState.TURN_END],
      [GameState.JAIL]: [GameState.ROLLING],
      [GameState.TURN_END]: [GameState.ROLLING, GameState.GAME_OVER],
      [GameState.GAME_OVER]: [],
    };

    return validTransitions[this.game.gameState].includes(newState);
  }

  /**
   * Get valid next states
   */
  getValidNextStates(): GameState[] {
    const validTransitions: Record<GameState, GameState[]> = {
      [GameState.WAITING]: [GameState.INITIALIZED],
      [GameState.INITIALIZED]: [GameState.ROLLING],
      [GameState.ROLLING]: [GameState.MOVING],
      [GameState.MOVING]: [
        GameState.PROPERTY_TRANSACTION,
        GameState.JAIL,
        GameState.TURN_END,
      ],
      [GameState.PROPERTY_TRANSACTION]: [GameState.TURN_END],
      [GameState.JAIL]: [GameState.ROLLING],
      [GameState.TURN_END]: [GameState.ROLLING, GameState.GAME_OVER],
      [GameState.GAME_OVER]: [],
    };

    return validTransitions[this.game.gameState];
  }

  /**
   * Roll dice and update game state
   */
  rollDice(): DiceRoll {
    const diceResult = CryptoDice.rollTwoDice();
    const roll: DiceRoll = {
      ...diceResult,
      timestamp: Date.now(),
    };

    this.game.lastDiceRoll = roll;
    return roll;
  }

  /**
   * Advance to next player
   */
  nextTurn(): void {
    this.game.currentPlayerIndex =
      (this.game.currentPlayerIndex + 1) % this.game.players.length;
    this.game.turn++;
  }

  /**
   * Check if there are any active players
   */
  getActivePlayers(): Player[] {
    return this.game.players.filter((p) => p.status === PlayerStatus.ACTIVE);
  }

  /**
   * Mark player as bankrupt
   */
  bankruptPlayer(playerId: string): void {
    const player = this.game.players.find((p) => p.id === playerId);
    if (player) {
      player.status = PlayerStatus.BANKRUPT;
      player.money = 0;
      player.ownedProperties = [];
    }
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    const activePlayers = this.getActivePlayers();
    return activePlayers.length <= 1;
  }

  /**
   * Get winner
   */
  getWinner(): Player | null {
    const activePlayers = this.getActivePlayers();
    return activePlayers.length === 1 ? (activePlayers[0] ?? null) : null;
  }

  /**
   * Update player position
   */
  movePlayer(playerId: string, newPosition: number): void {
    const player = this.game.players.find((p) => p.id === playerId);
    if (player) {
      player.position = newPosition % 40;
    }
  }

  /**
   * Update player money
   */
  updatePlayerMoney(playerId: string, amount: number): boolean {
    const player = this.game.players.find((p) => p.id === playerId);
    if (!player) return false;

    player.money += amount;

    // Check for bankruptcy
    if (player.money < 0) {
      this.bankruptPlayer(playerId);
      return false;
    }

    return true;
  }
}

export default GameStateMachine;
