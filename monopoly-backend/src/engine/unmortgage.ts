import { GameState } from "../types/game";
import { BOARD } from "./board";
import { getCurrentPlayerSafe } from "./assertions";

/**
 * Unmortgage a property
 * - Unmortgage cost = mortgageValue × 1.1
 * - Player must pay the unmortgage cost
 */
export function unmortgageProperty(
  state: GameState,
  tileIndex: number,
): GameState {
  const player = getCurrentPlayerSafe(state);

  // Find the property ownership
  const ownership = state.properties.find((p) => p.tileIndex === tileIndex);
  if (!ownership) {
    console.error(`Property at index ${tileIndex} is not owned`);
    return state;
  }

  // Verify the player owns this property
  if (ownership.ownerId !== player.id) {
    console.error(
      `Player ${player.id} does not own property at index ${tileIndex}`,
    );
    return state;
  }

  // Check if property is actually mortgaged
  if (!ownership.isMortaged) {
    console.error(`Property at index ${tileIndex} is not mortgaged`);
    return state;
  }

  // Get property details from the board
  const tile = BOARD[tileIndex];
  if (!tile || tile.type !== "PROPERTY") {
    console.error(`Tile at index ${tileIndex} is not a property`);
    return state;
  }

  // Calculate unmortgage cost (mortgage value * 1.1)
  const mortgageValue = Math.floor(tile.price / 2);
  const unmortgageCost = Math.floor(mortgageValue * 1.1);

  // Check if player has enough money
  if (player.money < unmortgageCost) {
    console.error(
      `Player ${player.id} does not have enough money to unmortgage. Need $${unmortgageCost}, have $${player.money}`,
    );
    return state;
  }

  // Update the game state
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === player.id ? { ...p, money: p.money - unmortgageCost } : p,
    ),
    properties: state.properties.map((p) =>
      p.tileIndex === tileIndex ? { ...p, isMortaged: false } : p,
    ),
    events: [
      ...state.events,
      {
        type: "PROPERTY_UNMORTGAGED",
        playerId: player.id,
        tileIndex: tileIndex,
        amount: unmortgageCost,
      },
    ],
  };
}
