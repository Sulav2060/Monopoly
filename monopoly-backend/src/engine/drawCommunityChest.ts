import { GameState, GameEvent } from "../types/game";
import { getCurrentPlayerSafe } from "./assertions";
import { goToJail } from "./goToJail";
import { movePlayer } from "./move";
import { resolveCurrentTile } from "./resolveTile";

export function drawCommunityChest(state: GameState): GameState {
  if (state.communityChestDeck.length === 0) {
    throw new Error("Community Chest deck is empty");
  }

  const card = state.communityChestDeck[state.communityChestIndex]!; //safe assertion as nextIndex using % is cared and for emptyness the error is already thrown.
  const nextIndex =
    (state.communityChestIndex + 1) % state.communityChestDeck.length; //increase the community chest index for the next play turn

  let nextState = {
    ...state,
    communityChestIndex: nextIndex,
  };

  switch (card.type) {
    case "MONEY":
      return {
        ...nextState,
        players: state.players.map((p) =>
          p.id === getCurrentPlayerSafe(state).id
            ? { ...p, money: p.money + card.amount }
            : p
        ),
        events: [...state.events, { type: "COMMUNITY_CHEST", card }],
      };

    case "GO_TO_JAIL": //player moves to jail due to community chest/chance card TODO: Maybe we need an event like upper event to tell why he reached jail
      return goToJail(nextState);

    case "MOVE": {
      // Direct move to position (e.g. Electric Company #12) without rolling dice
      const player = getCurrentPlayerSafe(nextState);
      const currentPos = player.position;
      const targetPos = card.position;
      const passedGo = targetPos < currentPos;

      const updatedPlayers = nextState.players.map((p) =>
        p.id === player.id
          ? {
              ...p,
              position: targetPos,
              money: passedGo ? p.money + 200 : p.money,
            }
          : p
      );

      const events: GameEvent[] = [
        ...nextState.events,
        { type: "COMMUNITY_CHEST", card },
        { type: "PLAYER_MOVED", from: currentPos, to: targetPos },
      ];
    
      if (passedGo) {
        events.push({ type: "PASSED_GO", amount: 200 });
      }

      return resolveCurrentTile({
        ...nextState,
        players: updatedPlayers,
        events,
      });
    }
  }
}
