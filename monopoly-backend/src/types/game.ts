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

export type DiceRoll = {
  die1: number;
  die2: number;
};

export type GameEvent =
  | { type: "DICE_ROLLED"; dice: DiceRoll }
  | { type: "PLAYER_MOVED"; from: number; to: number }
  | { type: "PASSED_GO"; amount: number }
  | { type: "TURN_ENDED"; nextPlayerId: PlayerId }
  | { type: "PROPERTY_BOUGHT"; tile: string } //FIXME:fix the tile type to be specifically one of the tile names from the board
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
    };

export type GameState = {
  players: PlayerState[];
  currentTurnIndex: number; //tells us whose turn it is.
  lastDice?: DiceRoll;
  events: GameEvent[];
  properties: PropertyOwnership[];
  doublesCount?: number; // to see if 3 doubles player gets and to take him to jail
};

export type PropertyOwnership = {
  tileIndex: number;
  ownerId: PlayerId;
};
