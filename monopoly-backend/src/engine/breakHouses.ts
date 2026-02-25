import { GameState, PropertyOwnership } from "../types/game";
import { PropertyTile } from "../types/board";
import { getCurrentPlayerSafe } from "./assertions";
import { BOARD } from "./board";
import { afterAssetChange } from "./debtResolution";

/**
 * Get the cost to break a house on a property from the board data
 * Returns half of the build cost
 */
function getHouseBreakRefund(tileIndex: number): number {
  const tile = BOARD[tileIndex];
  if (tile && tile.type === "PROPERTY") {
    return Math.floor(tile.houseBuildCost / 2);
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
  return groupProperties.some((prop) => {
    const ownership = state.properties.find(
      (p) => p.tileIndex === prop.tileIndex,
    );
    return ownership && ownership.isMortaged;
  });
}

/**
 * Check if the houses are uniform in the group for breaking
 * All properties must have the same number of houses, or differ by at most 1
 * (uniform breaking rule in Monopoly - houses must be broken evenly)
 */
function isUniformBreaking(
  state: GameState,
  groupName: string,
  targetTileIndex: number,
): boolean {
  const groupProperties = getGroupProperties(state, groupName);
  const ownerships = groupProperties.map((prop) =>
    state.properties.find((p) => p.tileIndex === prop.tileIndex),
  );

  // Get current house counts for each property in the group
  const houseCounts = ownerships.map((own) => own?.houses ?? 0);

  // If trying to break on this property, simulate the new state
  const targetIndex = groupProperties.findIndex(
    (prop) => prop.tileIndex === targetTileIndex,
  );
  if (targetIndex !== -1) {
    // Decrease houseCount for the target property
    houseCounts[targetIndex] = (houseCounts[targetIndex] ?? 0) - 1;
  }

  // All houses must differ by at most 1
  const minHouses = Math.min(...houseCounts);
  const maxHouses = Math.max(...houseCounts);

  return maxHouses - minHouses <= 1; // Returns true if uniform breaking
}

/**
 * Break a house on a property
 * Validates:
 * - Player's turn
 * - Player owns the property
 * - Player owns entire property group
 * - No mortgaged properties in the group
 * - Uniform breaking (houses within 1 of each other)
 * - Property has at least 1 house to break
 * Returns half the building cost
 */
export function breakHouses(
  state: GameState,
  playerId: string,
  tileIndex: number,
): GameState {
  try {
    const currentPlayer = getCurrentPlayerSafe(state);

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
      console.error(
        "❌ Cannot break houses while properties in group are mortgaged",
      );
      return state;
    }

    // ===== VALIDATION 6: Property has houses to break =====
    if (ownership.houses <= 0) {
      console.error("❌ Property has no houses to break");
      return state;
    }

    // ===== VALIDATION 7: Uniform breaking =====
    if (!isUniformBreaking(state, tile.group, tileIndex)) {
      console.error("❌ Breaking must be uniform across group properties");
      return state;
    }

    // ===== BREAK THE HOUSE =====
    const houseRefund = getHouseBreakRefund(tile.tileIndex);
    const updatedProperty: PropertyOwnership = {
      ...ownership,
      houses: ownership.houses - 1,
    };

    const newState = {
      ...state,
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, money: p.money + houseRefund } : p,
      ),
      properties: state.properties.map((p) =>
        p.tileIndex === tileIndex ? updatedProperty : p,
      ),
      events: [
        ...state.events,
        {
          type: "PROPERTY_BROKEN",
          playerId: playerId,
          tileIndex: tileIndex,
          houses: updatedProperty.houses,
          refund: houseRefund,
        } as const, //TODO: why needed as const
      ],
    };

    // Check if this resolves any debt
    return afterAssetChange(newState);
  } catch (error) {
    console.error("❌ Error in breakHouses:", error);
    return state;
  }
}
