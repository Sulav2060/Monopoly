import { GameState } from "../types/game";
import { getCurrentPlayerSafe } from "./assertions";
import { goToJail } from "./goToJail";
import { movePlayer } from "./move";

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

    case "MOVE": //player moves to new position due to community chest/chance card TODO: Maybe we need an event like upper event to tell why he reached jail
      return movePlayer(nextState, {
        die1: card.position,
        die2: 0,
      });
  }
}
