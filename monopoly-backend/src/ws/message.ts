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
  | { type: "PLACE_BID"; gameId: string; playerId: string; amount: number }
  | {
      type: "BUILD_PROPERTY";
      gameId: string;
      playerId: string;
      tileIndex: number;
    } //houses: number of houses to build, 5 means hotel
  | {
      type: "BREAK_PROPERTY";
      gameId: string;
      playerId: string;
      tileIndex: number;
    } //break/demolish houses, returns half the building cost
  | {
      type: "MORTGAGE_PROPERTY";
      gameId: string;
      playerId: string;
      tileIndex: number;
    }
  | {
      type: "UNMORTGAGE_PROPERTY";
      gameId: string;
      playerId: string;
      tileIndex: number;
    }
  | {
      type: "INITIATE_TRADE";
      gameId: string;
      playerId: string; // Player making the trade offer
      targetPlayerId: string; // Player being offered the trade
      offerMoney: number; // Money player is offering
      offerProperties: number[]; // Property tile indices player is offering
      requestMoney: number; // Money player is requesting
      requestProperties: number[]; // Property tile indices player is requesting
    }
  | {
      type: "FINALIZE_TRADE";
      gameId: string;
      tradeId: string; // Unique identifier of the trade to finalize
      action: "ACCEPT" | "REJECT";
    }
  | {
      type: "DELETE_TRADE";
      gameId: string;
      playerId: string; // Player who initiated and is deleting the trade
      tradeId: string; // Unique identifier of the trade to delete
    }
  | {
      type: "DECLARE_BANKRUPTCY";
      gameId: string;
      playerId: string; // Player declaring bankruptcy
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
