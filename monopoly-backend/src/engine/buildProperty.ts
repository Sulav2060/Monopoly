import { GameState, PropertyOwnership } from "../types/game";
import { PropertyTile } from "../types/board";
import { getCurrentPlayerSafe } from "./assertions";
import { BOARD } from "./board";

//TODO: Maybe we need to add socket messages to frontend as well and not just console.error.Maybe this isn't something to show to client.how do we send just to developer then??
//TODO: Maybe we should validate the user's money at the start if he can actually build or not
/**
 * Get the cost to build a house on a property from the board data
 */
function getHouseCost(tileIndex: number): number {
  const tile = BOARD[tileIndex];
  if (tile && tile.type === "PROPERTY") {
    return tile.houseBuildCost;
  }
  return 0;
}

/**
 * Get all properties in the same group
 */
function getGroupProperties(
  state: GameState,
  groupName: string,
): PropertyTile[] {
  return BOARD.filter(
    (tile) => tile.type === "PROPERTY" && tile.group === groupName,
  ) as PropertyTile[];
}

/**
 * Check if player owns all properties in the group
 */
function ownsEntireGroup(
  state: GameState,
  playerId: string,
  groupName: string,
): boolean {
  const groupProperties = getGroupProperties(state, groupName);

  //checking that each property of the group actually belongs to the same player.later verifying that the owner is the current player.
  return groupProperties.every((prop) => {
    const ownership = state.properties.find(
      (p) => p.tileIndex === prop.tileIndex,
    );
    return ownership && ownership.ownerId === playerId;
  });
}

/**
 * Check if any property in the group is mortgaged
 */
function hasAnyMortgagedProperty(state: GameState, groupName: string): boolean {
  const groupProperties = getGroupProperties(state, groupName);
  //finds the matching property from group properties and checks for any of the property is mortaged(using some)
  //still not sure if that property is the property of the same user.instead it may be mortaged but whole group can be of any other player(owner)
  return groupProperties.some((prop) => {
    const ownership = state.properties.find(
      (p) => p.tileIndex === prop.tileIndex,
    );
    return ownership && ownership.isMortaged;
  });
}

/**
 * Check if the houses are uniform in the group
 * All properties must have the same number of houses, or differ by at most 1
 * (uniform building rule in Monopoly)
 */
function isUniformBuilding(
  state: GameState,
  groupName: string,
  targetTileIndex: number,
): boolean {
  const groupProperties = getGroupProperties(state, groupName);
  const ownerships = groupProperties.map((prop) =>
    state.properties.find((p) => p.tileIndex === prop.tileIndex),
  );

  // Get current house counts for each property in the group is houseCounts an array?yes, it's an array of numbers representing the number of houses on each property in the group. We use the map function to create this array by looking up the ownership information for each property and extracting the number of houses (defaulting to 0 if not found).
  const houseCounts = ownerships.map((own) => own?.houses ?? 0);

  // If trying to build on this property, simulate the new state
  const targetIndex = groupProperties.findIndex(
    (prop) => prop.tileIndex === targetTileIndex,
  );
  if (targetIndex !== -1) {
    //increase houseCount for the target(current) property
    houseCounts[targetIndex] = (houseCounts[targetIndex] ?? 0) + 1;
  }

  // All houses must differ by at most 1
  const minHouses = Math.min(...houseCounts);
  const maxHouses = Math.max(...houseCounts);

  return maxHouses - minHouses <= 1; //returns true if okay,false if not uniform building (difference greater than 1)
}

/**
 * Build a house on a property
 * Validates:
 * - Player's turn
 * - Player owns the property
 * - Player owns entire property group
 * - No mortgaged properties in the group
 * - Uniform building (houses within 1 of each other)
 * - Player has sufficient funds
 * - Property hasn't reached max (4 houses or 5 = hotel)
 */
export function buildProperty(
  state: GameState,
  playerId: string,
  tileIndex: number,
): GameState {
  try {
    const currentPlayer = getCurrentPlayerSafe(state);

    //TODO: Maybe we need to add socket messages to frontend as well and not just console.error.Maybe this isn't something to show to client.how do we send just to developer then??

    //already validated in handler, but we can keep it here for extra safety if this function is called from somewhere else in the future.
    // ===== VALIDATION 1: Player's Turn =====
    if (currentPlayer.id !== playerId) {
      console.error("❌ Not player's turn");
      return state;
    }

    // ===== VALIDATION 2: Get Property Tile =====
    const tile = BOARD[tileIndex];
    if (!tile || tile.type !== "PROPERTY") {
      console.error("❌ Invalid tile or not a property");
      return state;
    }

    // ===== VALIDATION 3: Player owns the property =====
    const ownership = state.properties.find((p) => p.tileIndex === tileIndex);
    if (!ownership || ownership.ownerId !== playerId) {
      console.error("❌ Player does not own this property");
      return state;
    }

    // ===== VALIDATION 4: Player owns entire group =====
    if (!ownsEntireGroup(state, playerId, tile.group)) {
      console.error("❌ Player does not own all properties in the group");
      return state;
    }

    // ===== VALIDATION 5: No mortgaged properties in group =====
    if (hasAnyMortgagedProperty(state, tile.group)) {
      console.error("❌ Cannot build while properties in group are mortgaged");
      return state;
    }

    // ===== VALIDATION 6: Uniform building =====
    if (!isUniformBuilding(state, tile.group, tileIndex)) {
      console.error("❌ Building must be uniform across group properties");
      return state;
    }

    // ===== VALIDATION 7: Max houses check =====
    if (ownership.houses >= 5) {
      console.error("❌ Property already has hotel (max buildings reached)");
      return state;
    }

    //find out current houses+1 cost for the property,then validate the player has enough money to build that house/hotel.

    // ===== VALIDATION 8: Sufficient balance =====
    const houseCost = getHouseCost(tile.tileIndex);
    if (currentPlayer.money < houseCost) {
      console.error("❌ Insufficient funds to build house/hotel");
      return state;
    }

    // ===== BUILD THE HOUSE/HOTEL =====
    const updatedProperty: PropertyOwnership = {
      ...ownership,
      houses: ownership.houses + 1,
    };

    return {
      ...state,
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, money: p.money - houseCost } : p,
      ),
      properties: state.properties.map((p) =>
        p.tileIndex === tileIndex ? updatedProperty : p,
      ),
      events: [
        ...state.events,
        {
          type: "PROPERTY_BUILT",
          playerId: playerId,
          tileIndex: tileIndex,
          houses: updatedProperty.houses,
          cost: houseCost,
        },
      ],
    };
  } catch (error) {
    console.error("❌ Error in buildProperty:", error);
    return state;
  }
}
