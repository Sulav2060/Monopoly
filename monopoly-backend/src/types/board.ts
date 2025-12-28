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
  name: string;
  price: number;
  rent: number;
};

export type Tile =
  | { type: "GO" }
  | { type: "TAX"; amount: number }
  | { type: "JAIL" }
  | { type: "FREE_PARKING" }
  | { type: "GO_TO_JAIL" }
  | PropertyTile
  | { type: "COMMUNITY" };
