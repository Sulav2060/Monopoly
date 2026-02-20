import { GameState } from "../types/game";
import { getCurrentPlayerSafe } from "./assertions";
import { BOARD } from "./board";

export function buyPendingProperty(state: GameState): GameState {
  const pending = state.pendingAction;

  if (!pending || pending.type !== "BUY_PROPERTY") {
    return state;
  }
  const player = getCurrentPlayerSafe(state);
  //take tileIndex from pending action.
  const tileIndex = pending.property.tileIndex;
  //take property from board using tileIndex.
  const property = BOARD[tileIndex];
  if (!property || property.type !== "PROPERTY") {
    throw new Error("Tile is not a property"); //sure that we need to provide error here and we shouldn't just return state
  }
  if (player.money < property.price) {
    throw new Error("Insufficient funds to buy property"); //sure that we need to provide error here and we shouldn't just return state
    return state; // insufficient funds → do nothing
  }

  return {
    ...state,
    pendingAction: null,
    players: state.players.map((p) =>
      p.id === player.id ? { ...p, money: p.money - property.price } : p,
    ),
    properties: [
      ...state.properties,
      {
        tileIndex: property.tileIndex,
        ownerId: player.id,
        houses: 0,
        isMortaged: false,
      },
    ],
    events: [
      ...state.events,
      {
        type: "PROPERTY_BOUGHT",
        tile: property.tileIndex,
      },
    ],
  };
}
