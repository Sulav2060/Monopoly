import { Tile } from "../types/board";

export const JAIL_INDEX = 10;
export const GO_INDEX = 0;
export const GO_TO_JAIL_INDEX = 30;
export const BOARD: Tile[] = [
  { tileIndex: 0, type: "GO" },
  {
    tileIndex: 1,
    type: "PROPERTY",
    id: "mediterranean",
    name: "Mediterranean Avenue",
    price: 60,
    baseRent: 50,
  },

  { tileIndex: 2, type: "COMMUNITY_CHEST" },

  {
    tileIndex: 3,
    type: "PROPERTY",
    id: "baltic",
    name: "Baltic Avenue",
    price: 60,
    baseRent: 4,
  },

  { tileIndex: 4, type: "TAX", amount: 200 },

  {
    tileIndex: 5,
    type: "PROPERTY",
    id: "reading_railroad",
    name: "Reading Railroad",
    price: 200,
    baseRent: 50,
  },

  {
    tileIndex: 6,
    type: "PROPERTY",
    id: "oriental",
    name: "Oriental Avenue",
    price: 100,
    baseRent: 6,
  },

  { tileIndex: 7, type: "CHANCE" },

  {
    tileIndex: 8,
    type: "PROPERTY",
    id: "vermont",
    name: "Vermont Avenue",
    price: 100,
    baseRent: 6,
  },

  {
    tileIndex: 9,
    type: "PROPERTY",
    id: "connecticut",
    name: "Connecticut Avenue",
    price: 120,
    baseRent: 8,
  },

  { tileIndex: 10, type: "JAIL" },

  {
    tileIndex: 11,
    type: "PROPERTY",
    id: "st_charles",
    name: "St. Charles Place",
    price: 140,
    baseRent: 10,
  },

  {
    tileIndex: 12,
    type: "PROPERTY",
    id: "electric_company",
    name: "Electric Company",
    price: 150,
    baseRent: 10,
  },

  {
    tileIndex: 13,
    type: "PROPERTY",
    id: "states",
    name: "States Avenue",
    price: 140,
    baseRent: 10,
  },

  {
    tileIndex: 14,
    type: "PROPERTY",
    id: "virginia",
    name: "Virginia Avenue",
    price: 160,
    baseRent: 12,
  },

  {
    tileIndex: 15,
    type: "PROPERTY",
    id: "pennsylvania_railroad",
    name: "Pennsylvania Railroad",
    price: 200,
    baseRent: 25,
  },

  {
    tileIndex: 16,
    type: "PROPERTY",
    id: "st_james",
    name: "St. James Place",
    price: 180,
    baseRent: 14,
  },

  { tileIndex: 17, type: "COMMUNITY_CHEST" },

  {
    tileIndex: 18,
    type: "PROPERTY",
    id: "tennessee",
    name: "Tennessee Avenue",
    price: 180,
    baseRent: 14,
  },

  {
    tileIndex: 19,
    type: "PROPERTY",
    id: "new_york",
    name: "New York Avenue",
    price: 200,
    baseRent: 16,
  },

  { tileIndex: 20, type: "FREE_PARKING" },

  {
    tileIndex: 21,
    type: "PROPERTY",
    id: "kentucky",
    name: "Kentucky Avenue",
    price: 220,
    baseRent: 18,
  },

  { tileIndex: 22, type: "CHANCE" },

  {
    tileIndex: 23,
    type: "PROPERTY",
    id: "indiana",
    name: "Indiana Avenue",
    price: 220,
    baseRent: 18,
  },

  {
    tileIndex: 24,
    type: "PROPERTY",
    id: "illinois",
    name: "Illinois Avenue",
    price: 240,
    baseRent: 20,
  },

  {
    tileIndex: 25,
    type: "PROPERTY",
    id: "bo_railroad",
    name: "B. & O. Railroad",
    price: 200,
    baseRent: 25,
  },

  {
    tileIndex: 26,
    type: "PROPERTY",
    id: "atlantic",
    name: "Atlantic Avenue",
    price: 260,
    baseRent: 22,
  },

  {
    tileIndex: 27,
    type: "PROPERTY",
    id: "ventnor",
    name: "Ventnor Avenue",
    price: 260,
    baseRent: 22,
  },

  {
    tileIndex: 28,
    type: "PROPERTY",
    id: "water_works",
    name: "Water Works",
    price: 150,
    baseRent: 150,
  },

  {
    tileIndex: 29,
    type: "PROPERTY",
    id: "marvin_gardens",
    name: "Marvin Gardens",
    price: 280,
    baseRent: 24,
  },

  { tileIndex: 30, type: "GO_TO_JAIL" },

  {
    tileIndex: 31,
    type: "PROPERTY",
    id: "pacific",
    name: "Pacific Avenue",
    price: 300,
    baseRent: 26,
  },

  {
    tileIndex: 32,
    type: "PROPERTY",
    id: "north_carolina",
    name: "North Carolina Avenue",
    price: 300,
    baseRent: 26,
  },

  { tileIndex: 33, type: "COMMUNITY_CHEST" },

  {
    tileIndex: 34,
    type: "PROPERTY",
    id: "pennsylvania",
    name: "Pennsylvania Avenue",
    price: 320,
    baseRent: 28,
  },

  {
    tileIndex: 35,
    type: "PROPERTY",
    id: "short_line",
    name: "Short Line",
    price: 200,
    baseRent: 25,
  },

  { tileIndex: 36, type: "CHANCE" },

  {
    tileIndex: 37,
    type: "PROPERTY",
    id: "park_place",
    name: "Park Place",
    price: 350,
    baseRent: 35,
  },

  { tileIndex: 38, type: "TAX", amount: 100 },

  {
    tileIndex: 39,
    type: "PROPERTY",
    id: "boardwalk",
    name: "Boardwalk",
    price: 400,
    baseRent: 50,
  },
];
