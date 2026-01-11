import { GameState } from "../types/game";

export type ClientMessage = {
  type: "ROLL_DICE";
  gameId: string;
  playerId: string;
};

export type ServerMessage =
  | {
      type: "GAME_STATE_UPDATE";
      gameId: string;
      state: GameState;
    }
  | {
      type: "ERROR";
      message: string;
    };
