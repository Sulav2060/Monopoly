import { Game, Player, GameState, DiceRoll, Property, PlayerStatus, PropertyType } from "../types/game";
import GameStateMachine from "../engine/fsm";
import CryptoDice from "../utils/dice";


/**
 * Game Service
 * Handles game logic and operations
 */
export class GameService {
  /**
   * Execute a player turn
   * @param game Game instance
   * @param fsm FSM instance
   * @returns Updated game state
   */
  static executeTurn(game: Game, fsm: GameStateMachine): Game {
    const currentPlayer = game.players[game.currentPlayerIndex];

    if (!currentPlayer || currentPlayer.status !== "ACTIVE") {
      // Skip to next active player
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
      return game;
    }

    // Player rolls dice
    const diceRoll = fsm.rollDice();

    // Move player
    const newPosition = (currentPlayer.position + diceRoll.total) % 40;
    fsm.movePlayer(currentPlayer.id, newPosition);

    // Handle passing GO
    if (currentPlayer.position > newPosition) {
      currentPlayer.money += 200; // Collect $200 for passing GO
    }

    return game;
  }

  /**
   * Process property landing
   * @param game Game instance
   * @param property Property landed on
   */
  static processPropertyLanding(game: Game, property: Property): void {
    const currentPlayer = game.players[game.currentPlayerIndex];
    
    if (!currentPlayer) {
      throw new Error("Current player not found");
    }

    // Corner properties have no rent
    if (property.type === "CORNER") {
      return;
    }

    // Unowned property - can be purchased
    if (!property.owner) {
      // Property can be purchased if player has enough money
      if (currentPlayer.money >= property.price) {
        // Property is available for purchase
        // This should trigger UI for purchase decision
      }
      return;
    }

    // Owned property - pay rent
    if (property.owner !== currentPlayer.id) {
      const owner = game.players.find((p) => p.id === property.owner);
      if (owner) {
        const rentAmount = this.calculateRent(property);
        currentPlayer.money -= rentAmount;
        owner.money += rentAmount;

        // Check for bankruptcy
        if (currentPlayer.money < 0) {
          currentPlayer.status = PlayerStatus.BANKRUPT;
          // Transfer remaining money and properties to owner
          const remaining = currentPlayer.money;
          if (remaining > 0) {
            owner.money += remaining;
          }
          currentPlayer.ownedProperties.forEach((propId) => {
            const prop = game.properties.find((p) => p.id === propId);
            if (prop) {
              prop.owner = owner.id;
              owner.ownedProperties.push(propId);
            }
          });
          currentPlayer.ownedProperties = [];
        }
      }
    }
  }

  /**
   * Calculate rent for a property
   * @param property Property to calculate rent for
   * @returns Rent amount
   */
  static calculateRent(property: Property): number {
    if (property.type === PropertyType.CORNER) {
      return 0;
    }

    if (property.type === PropertyType.TAX) {
      return property.baseRent[0] ?? 0;
    }

    // For streets with houses/hotels
    if (property.hotels > 0) {
      return property.baseRent[5] ?? property.baseRent[0] ?? 0;
    }

    if (property.houses > 0) {
      return property.baseRent[property.houses] ?? property.baseRent[0] ?? 0;
    }

    // Base rent
    return property.baseRent[0] ?? 0;
  }

  /**
   * Buy property for player
   * @param game Game instance
   * @param playerId Player ID
   * @param propertyId Property ID
   * @throws Error if purchase invalid
   */
  static buyProperty(game: Game, playerId: string, propertyId: number): void {
    const player = game.players.find((p) => p.id === playerId);
    const property = game.properties.find((p) => p.id === propertyId);

    if (!player || !property) {
      throw new Error("Player or property not found");
    }

    // Only STREET, RAILROAD, and UTILITY can be purchased
    if (![PropertyType.STREET, PropertyType.RAILROAD, PropertyType.UTILITY].includes(property.type)) {
      throw new Error(`Cannot purchase ${property.type} properties`);
    }

    if (property.owner !== null) {
      throw new Error("Property already owned");
    }

    if (player.money < property.price) {
      throw new Error("Insufficient funds");
    }

    property.owner = playerId;
    player.money -= property.price;
    player.ownedProperties.push(propertyId);
  }

  /**
   * Sell property from player
   * @param game Game instance
   * @param playerId Player ID
   * @param propertyId Property ID
   * @throws Error if sale invalid
   */
  static sellProperty(game: Game, playerId: string, propertyId: number): void {
    const player = game.players.find((p) => p.id === playerId);
    const property = game.properties.find((p) => p.id === propertyId);

    if (!player || !property) {
      throw new Error("Player or property not found");
    }

    if (property.owner !== playerId) {
      throw new Error("Player does not own this property");
    }

    if (property.houses > 0 || property.hotels > 0) {
      throw new Error("Must sell all houses/hotels first");
    }

    const salePrice = Math.floor(property.price / 2);
    property.owner = null;
    player.money += salePrice;
    player.ownedProperties = player.ownedProperties.filter(
      (id) => id !== propertyId
    );
  }

  /**
   * Buy house for property
   * @param game Game instance
   * @param playerId Player ID
   * @param propertyId Property ID
   * @throws Error if purchase invalid
   */
  static buyHouse(game: Game, playerId: string, propertyId: number): void {
    const player = game.players.find((p) => p.id === playerId);
    const property = game.properties.find((p) => p.id === propertyId);

    if (!player || !property) {
      throw new Error("Player or property not found");
    }

    if (property.owner !== playerId) {
      throw new Error("Player does not own this property");
    }

    if (property.houses >= 4 && property.hotels === 0) {
      throw new Error("Cannot build more than 4 houses");
    }

    if (player.money < property.basePricePerHouse) {
      throw new Error("Insufficient funds");
    }

    property.houses++;
    player.money -= property.basePricePerHouse;
  }

  /**
   * Send player to jail
   * @param game Game instance
   * @param playerId Player ID
   */
  static sendToJail(game: Game, playerId: string): void {
    const player = game.players.find((p) => p.id === playerId);
    if (player) {
      player.position = 10; // Jail position
      player.inJail = true;
      player.jailTurns = 3;
    }
  }

  /**
   * Get player by ID
   * @param game Game instance
   * @param playerId Player ID
   */
  static getPlayer(game: Game, playerId: string): Player | undefined {
    return game.players.find((p) => p.id === playerId);
  }

  /**
   * Get property by ID
   * @param game Game instance
   * @param propertyId Property ID
   */
  static getProperty(game: Game, propertyId: number): Property | undefined {
    return game.properties.find((p) => p.id === propertyId);
  }

  /**
   * Get player properties
   * @param game Game instance
   * @param playerId Player ID
   */
  static getPlayerProperties(game: Game, playerId: string): Property[] {
    return game.properties.filter((p) => p.owner === playerId);
  }

  /**
   * Check if player owns property group
   * @param properties List of properties
   * @param group Group name
   */
  static ownsPropertyGroup(properties: Property[], group: string): boolean {
    const groupProperties = properties.filter((p) => {
      // Map property IDs to groups
      const groupMap: Record<number, string> = {
        1: "dark-purple",
        3: "dark-purple",
        6: "light-blue",
        8: "light-blue",
        9: "light-blue",
        11: "pink",
        13: "pink",
        14: "pink",
        16: "orange",
        18: "orange",
        19: "orange",
        21: "red",
        23: "red",
        24: "red",
        26: "yellow",
        27: "yellow",
        29: "yellow",
        31: "green",
        32: "green",
        34: "green",
        37: "dark-blue",
        39: "dark-blue",
      };
      return groupMap[p.id] === group;
    });

    return (
      groupProperties.length > 0 &&
      groupProperties.every((p) => p.owner === (properties[0]?.owner ?? null))
    );
  }
}

export default GameService;
