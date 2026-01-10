// engine/buyProperty.ts
import { GameState } from "../types/game";
import { PropertyTile } from "../types/board";
import { getCurrentPlayerSafe } from "./assertions";

export function buyProperty(state: GameState, tile: PropertyTile): GameState {
  const index = state.currentTurnIndex;
  const player = getCurrentPlayerSafe(state);

  if (player.money < tile.price) return state;

  const updatedPlayer = {
    ...player,
    money: player.money - tile.price,
  };

  //if enough money automatically buy property for now.
  return {
    ...state,
    players: state.players.map((p, i) => (i === index ? updatedPlayer : p)),
    properties: [
      ...state.properties,
      { tileIndex: tile.tileIndex, ownerId: player.id },
    ],
    events: [...state.events, { type: "PROPERTY_BOUGHT", tile: tile.id }],
  };
}
