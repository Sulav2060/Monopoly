import { GameState, PlayerId } from "../types/game";

export function bankruptPlayer(
  state: GameState,
  playerId: PlayerId,
  causedBy?: PlayerId
): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  const remainingMoney = Math.max(player.money, 0);

  const players = state.players.map((p) => {
    if (p.id === playerId) {
      return { ...p, money: 0, isBankrupt: true };
    }
    if (p.id === causedBy) {
      return { ...p, money: p.money + remainingMoney };
    }
    return p;
  });

  const properties = state.properties.filter((p) => p.ownerId !== playerId);

  return {
    ...state,
    players,
    properties,
    events: [
      ...state.events,
      {
        type: "PLAYER_BANKRUPT",
        playerId,
        causedBy: causedBy ?? "",
      },
    ],
  };
}
