// import { GameState, PlayerState } from "../types/game";
// import { CommunityChestCard } from "../types/game";

// export function createGame(playerNames: string[]): GameState {
//   const players: PlayerState[] = playerNames.map((name) => ({
//     id: crypto.randomUUID(),
//     name,
//     position: 0,
//     money: 1500,
//     inJail: false,
//     jailTurns: 0,
//     communityChestDeck: [
//       { type: "MONEY", amount: 200 },
//       { type: "GO_TO_JAIL" },
//       { type: "MOVE", position: 12 },
//     ],
//     communityChestIndex: 0,
//   }));

//   return {
//     players,
//     currentTurnIndex: 0,
//     events: [],
//     properties: [],
//   };
// }
