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
      playerId?: string;
      playerName: string;
    }
  | {
      type: "START_GAME";
      gameId: string;
    }
  | {
      type: "END_TURN";
      gameId: string;
      playerId: string;
    }
  | {
      type: "BUY_PROPERTY";
      gameId: string;
      playerId: string;
    }
  | { type: "AUCTION_TIMEOUT"; gameId: string }
  | { type: "PLACE_BID"; gameId: string; playerId: string; amount: number };

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
