import { GameState, PlayerId } from "../types/game";
import { checkGameOver } from "./gameOver";
import { endTurn } from "./endTurn";

export function bankruptPlayer(
  state: GameState,
  playerId: PlayerId,
  causedBy?: PlayerId,
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

  const bankruptState: GameState = {
    ...state,
    players,
    properties,
    events: [
      ...state.events,
      {
        type: "PLAYER_BANKRUPT" as const, //also here what does const do?and why normal string and providing causedBy as empty strings didn't work.
        playerId,
        ...(causedBy && { causedBy }), //TODO: see here what's being done
      },
    ],
  };

  // Check if game is over after bankruptcy
  const gameOverState = checkGameOver(bankruptState);

  // End the bankrupt player's turn
  return endTurn(gameOverState);
}
