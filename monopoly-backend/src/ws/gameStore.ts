import { GameState } from "../types/game";

type Game = {
  id: string;
  state: GameState;
};

const games = new Map<string, Game>();

export function getGame(gameId: string): Game | undefined {
  return games.get(gameId);
}

export function createGame(gameId: string, state: GameState) {
  games.set(gameId, { id: gameId, state });
}

export function updateGame(gameId: string, state: GameState) {
  const game = games.get(gameId);
  if (game) {
    game.state = state;
  }
}
