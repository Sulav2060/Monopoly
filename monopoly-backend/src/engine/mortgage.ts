import { GameState } from "../types/game";
import { BOARD } from "./board";
import { getCurrentPlayerSafe } from "./assertions";
import { afterAssetChange } from "./debtResolution";

/**
 * Mortgage a property
 * - Can only mortgage if there are no houses on the property
 * - mortgageValue = property.basePrice / 2
 * - Player receives the mortgage value
 */
export function mortgageProperty(
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

  // Check if property is already mortgaged
  if (ownership.isMortaged) {
    console.error(`Property at index ${tileIndex} is already mortgaged`);
    return state;
  }

  // Check if there are houses on the property
  if (ownership.houses > 0) {
    console.error(
      `Cannot mortgage property at index ${tileIndex} - has ${ownership.houses} houses. Must sell houses first.`,
    );
    return state;
  }

  // Get property details from the board
  const tile = BOARD[tileIndex];
  if (!tile || tile.type !== "PROPERTY") {
    console.error(`Tile at index ${tileIndex} is not a property`);
    return state;
  }

  // Calculate mortgage value (half the base price)
  const mortgageValue = Math.floor(tile.price / 2);

  // Update the game state
  const newState = {
    ...state,
    players: state.players.map((p) =>
      p.id === player.id ? { ...p, money: p.money + mortgageValue } : p,
    ),
    properties: state.properties.map((p) =>
      p.tileIndex === tileIndex ? { ...p, isMortaged: true } : p,
    ),
    events: [
      ...state.events,
      {
        type: "PROPERTY_MORTGAGED",
        playerId: player.id,
        tileIndex: tileIndex,
        amount: mortgageValue,
      } as const //TODO: why needed as const
    ],
  };

  // Check if this resolves any debt
  return afterAssetChange(newState);
}
