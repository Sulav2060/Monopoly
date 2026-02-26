//changed so that we can have a initial game state creation in one place
import { CommunityChestCard, GameState } from "../types/game";

const initialCommunityChestDeck: CommunityChestCard[] = [
  { type: "MONEY", amount: 200 },
  { type: "GO_TO_JAIL" },
  { type: "MOVE", position: 12 },
];

export function createInitialGameState(): GameState {
  return {
    pendingAction: null,
    pendingTrades: [],
    players: [],
    currentTurnIndex: 0,
    events: [],
    properties: [],
    communityChestDeck: initialCommunityChestDeck,
    communityChestIndex: 0,
    voteout: null,
  };
}
