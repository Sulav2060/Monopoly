import { GameState, PlayerState } from "../types/game";

export type ClientMessage = 
  | {
      type: "ROLL_DICE";
      gameId: string;
      playerId: string;
    }
  | {
      type: "JOIN_GAME";
      gameId: string;
      playerId: string;
      player?: PlayerState;
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
