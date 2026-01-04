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
  baseRent: number;
};

export type Tile =
  | { type: "GO" }
  | PropertyTile
  | { type: "GO_TO_JAIL" }
  | { type: "JAIL" }
  | { type: "FREE_PARKING" }
  | { type: "CHANCE" }
  | { type: "COMMUNITY_CHEST" }
  | { type: "TAX" };
