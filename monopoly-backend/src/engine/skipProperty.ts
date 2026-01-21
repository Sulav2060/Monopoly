import { GameState } from "../types/game";
import { endTurn } from "./endTurn";

export function skipProperty(state: GameState): GameState {
  const pending = state.pendingAction;

  if (!pending || pending.type !== "BUY_PROPERTY") {
    return state;
  }

  return {
    ...endTurn({
      ...state,
      pendingAction: null,
      events: [
        ...state.events,
        {
          type: "PROPERTY_SKIPPED",
          playerId: pending.playerId,
          tileIndex: pending.tileIndex,
        },
      ],
    }),
  };
}
