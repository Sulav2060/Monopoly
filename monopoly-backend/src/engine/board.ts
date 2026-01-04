import { Tile } from "../types/board";

export const JAIL_INDEX = 10;
export const GO_INDEX = 0;
export const GO_TO_JAIL_INDEX = 30;

export const BOARD: Tile[] = [
  { type: "GO" }, // 0

  {
    type: "PROPERTY",
    id: "mediterranean",
    name: "Mediterranean Avenue",
    price: 60,
    baseRent: 2,
  },

  { type: "COMMUNITY_CHEST" },

  {
    type: "PROPERTY",
    id: "baltic",
    name: "Baltic Avenue",
    price: 60,
    baseRent: 4,
  },

  // ... keep going later

  { type: "JAIL" }, // 10
  { type: "FREE_PARKING" }, // 20
  { type: "GO_TO_JAIL" }, // 30
];
