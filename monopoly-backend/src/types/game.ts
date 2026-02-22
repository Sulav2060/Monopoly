import { PropertyTile, Tile } from "./board";
export type PlayerId = string;

export type PlayerState = {
  id: PlayerId;
  name: string;
  position: number; // 0–39 board positions
  money: number;
  inJail: boolean;
  jailTurns: number; //TODO: learn about this jailTurns what it is?->how many times the person is in jail
  isBankrupt: boolean;
};

export type AuctionState = {
  property: PropertyTile;
  highestBid: number;
  highestBidderId?: PlayerId;
  activePlayerIds: PlayerId[]; // players still in auction
  currentBidderIndex: number;
};

export type Buy_Property_PendingAction_Data = PropertyTile & {
  playerId: PlayerId;
};

export type TradeOfferData = {
  tradeId: string; // Unique identifier for this trade offer
  initiatingPlayerId: PlayerId; // Player who made the offer
  targetPlayerId: PlayerId; // Player being offered the trade
  offerMoney: number; // Money initiating player is offering
  offerProperties: number[]; // Property tile indices initiating player is offering
  requestMoney: number; // Money requested from target player
  requestProperties: number[]; // Property tile indices requested from target player
};

export type PendingAction =
  | { type: "BUY_PROPERTY"; property: Buy_Property_PendingAction_Data }
  | { type: "AUCTION"; auction: AuctionState }
  | null;

export type DiceRoll = {
  die1: number;
  die2: number;
};

export type CommunityChestCard =
  | { type: "MONEY"; amount: 200 }
  | { type: "GO_TO_JAIL" }
  | { type: "MOVE"; position: 12 };

export type GameEvent =
  | { type: "DICE_ROLLED"; dice: DiceRoll }
  | { type: "PLAYER_MOVED"; from: number; to: number }
  | { type: "PASSED_GO"; amount: number }
  | { type: "TURN_ENDED"; nextPlayerId: PlayerId }
  | { type: "PROPERTY_BOUGHT"; tile: number } //FIXME:fix the tile type to be specifically one of the tile names from the board
  | {
      type: "RENT_PAID";
      from: PlayerId;
      to: PlayerId;
      amount: number;
    }
  //jail regarding events
  | { type: "PLAYER_SENT_TO_JAIL"; playerId: PlayerId }
  | { type: "JAIL_TURN_FAILED"; attempt: number }
  | { type: "JAIL_EXITED"; reason: "DOUBLES" | "MAX_TURNS" }
  //bankruptcy regarding events
  | {
      type: "PLAYER_BANKRUPT";
      playerId: PlayerId;
      causedBy?: PlayerId; // rent owner, optional TODO: still unclear about this
    }
  //game ends
  | { type: "GAME_OVER"; winnerId: PlayerId }
  //tax regarding event
  | { type: "TAX_PAID"; playerId: PlayerId; amount: number }
  | { type: "FREE_PARKING_COLLECTED"; playerId: PlayerId; amount: number }
  | {
      type: "COMMUNITY_CHEST";
      card: CommunityChestCard;
    }
  //player  buying property regarding events
  | { type: "PROPERTY_SKIPPED"; playerId: PlayerId; tileIndex: number }
  | {
      type: "PROPERTY_OFFERED";
      playerId: PlayerId;
      tileIndex: number;
      price: number;
    }
  //property building regarding events
  | {
      type: "PROPERTY_BUILT";
      playerId: PlayerId;
      tileIndex: number;
      houses: number;
      cost: number;
    }
  //auction regarding events
  | { type: "AUCTION_STARTED"; property: PropertyTile }
  | { type: "AUCTION_BID_PLACED"; playerId: PlayerId; amount: number }
  | { type: "AUCTION_PLAYER_PASSED"; playerId: PlayerId }
  | {
      type: "AUCTION_WON";
      playerId: PlayerId;
      tileIndex: number;
      amount: number;
    }
  | { type: "AUCTION_UNSOLD"; tileIndex: number }
  //trade regarding events
  | {
      type: "TRADE_OFFERED";
      tradeId: string;
      initiatingPlayerId: PlayerId;
      targetPlayerId: PlayerId;
      offerMoney: number;
      offerProperties: number[];
      requestMoney: number;
      requestProperties: number[];
    }
  | {
      type: "TRADE_ACCEPTED";
      tradeId: string;
      initiatingPlayerId: PlayerId;
      targetPlayerId: PlayerId;
      offerMoney: number;
      offerProperties: number[];
      requestMoney: number;
      requestProperties: number[];
    }
  | {
      type: "TRADE_REJECTED";
      tradeId: string;
      initiatingPlayerId: PlayerId;
      targetPlayerId: PlayerId;
    };

export type GameState = {
  players: PlayerState[];
  currentTurnIndex: number; //tells us whose turn it is.
  lastDice?: DiceRoll;
  events: GameEvent[];
  properties: PropertyOwnership[];
  doublesCount?: number; // to see if 3 doubles player gets and to take him to jail
  hasStarted?: boolean;
  maxPlayers?: number;
  freeParkingPot?: number;
  communityChestDeck: CommunityChestCard[];
  communityChestIndex: number;
  pendingAction: PendingAction;
  pendingTrades: TradeOfferData[]; // Array to support multiple concurrent trade offers
};

export type PropertyOwnership = {
  tileIndex: number;
  ownerId: PlayerId;
  houses: number; // 0-4 houses, 5 means hotel
  isMortaged: boolean;
};
