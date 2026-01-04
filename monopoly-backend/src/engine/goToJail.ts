import { GameState } from "../types/game";
import { getCurrentPlayerSafe } from "./assertions";
import { JAIL_INDEX } from "./board";

export function goToJail(state: GameState): GameState {
  const player = getCurrentPlayerSafe(state);

  const players = state.players.map((p) =>
    p.id === player.id
      ? {
          ...p,
          position: JAIL_INDEX,
          inJail: true,
          jailTurns: 0,
        }
      : p
  );

  return {
    ...state,
    players,
    events: [
      ...state.events,
      {
        type: "PLAYER_SENT_TO_JAIL",
        playerId: player.id,
      },
    ],
  };
}
