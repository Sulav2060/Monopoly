// tests/helpers/tiles.ts
import { PropertyTile } from "../../types/board";

export const testProperty: PropertyTile = {
  id: "1",
  tileIndex: 1,
  type: "PROPERTY",
  name: "Mediterranean Avenue",
  baseRent: 50,
  price: 60,
  group: "terai",
  houseRent: [10, 30, 90, 160],
  hotelRent: 250,
  houseBuildCost: 12,
};
