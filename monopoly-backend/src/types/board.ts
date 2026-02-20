export type TileType =
  | "GO"
  | "PROPERTY"
  | "TAX"
  | "JAIL"
  | "FREE_PARKING"
  | "GO_TO_JAIL"
  | "CHANCE"
  | "COMMUNITY";

export type PropertyTile = {
  type: "PROPERTY";
  id: string;
  name: string;
  price: number;
  tileIndex: number;
  baseRent: number;
  group: string;
  houseRent: number[];
  hotelRent: number;
  houseBuildCost: number;
};

export type Tile =
  | { type: "GO"; tileIndex: number }
  | PropertyTile
  | { type: "GO_TO_JAIL"; tileIndex: number }
  | { type: "JAIL"; tileIndex: number }
  | { type: "FREE_PARKING"; tileIndex: number }
  | { type: "CHANCE"; tileIndex: number }
  | { type: "COMMUNITY_CHEST"; tileIndex: number }
  | { type: "TAX"; amount: number; tileIndex: number };
