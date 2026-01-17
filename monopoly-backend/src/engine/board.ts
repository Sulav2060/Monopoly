import { Tile } from "../types/board";

export const JAIL_INDEX = 10;
export const GO_INDEX = 0;
export const GO_TO_JAIL_INDEX = 30;

export const BOARD: Tile[] = [
  { tileIndex: 0, type: "GO" },

  // Dark Purple – Terai Cities
  { tileIndex: 1, type: "PROPERTY", id: "janakpur", name: "Janakpur", price: 60, baseRent: 2 },
  { tileIndex: 2, type: "COMMUNITY_CHEST" },
  { tileIndex: 3, type: "PROPERTY", id: "birgunj", name: "Birgunj", price: 60, baseRent: 4 },
  { tileIndex: 4, type: "TAX", amount: 200 },

  // Rail
  { tileIndex: 5, type: "PROPERTY", id: "south_railway", name: "South Railway", price: 200, baseRent: 25 },

  // Light Blue – Lakes
  { tileIndex: 6, type: "PROPERTY", id: "phewa", name: "Phewa Lake", price: 100, baseRent: 6 },
  { tileIndex: 7, type: "CHANCE" },
  { tileIndex: 8, type: "PROPERTY", id: "rara", name: "Rara Lake", price: 100, baseRent: 8 },
  { tileIndex: 9, type: "PROPERTY", id: "begnas", name: "Begnas Lake", price: 120, baseRent: 10 },

  { tileIndex: 10, type: "JAIL" },

  // Pink – Temples
  { tileIndex: 11, type: "PROPERTY", id: "pashupati", name: "Pashupati", price: 140, baseRent: 12 },
  { tileIndex: 12, type: "PROPERTY", id: "hydropower", name: "Hydropower", price: 150, baseRent: 4 },
  { tileIndex: 13, type: "PROPERTY", id: "boudha", name: "Boudha", price: 140, baseRent: 14 },
  { tileIndex: 14, type: "PROPERTY", id: "swayambhu", name: "Swayambhu", price: 160, baseRent: 16 },

  // Rail
  { tileIndex: 15, type: "PROPERTY", id: "east_railway", name: "East Railway", price: 200, baseRent: 25 },

  // Orange – National Parks
  { tileIndex: 16, type: "PROPERTY", id: "chitwan", name: "Chitwan", price: 180, baseRent: 18 },
  { tileIndex: 17, type: "COMMUNITY_CHEST" },
  { tileIndex: 18, type: "PROPERTY", id: "bardia", name: "Bardia", price: 180, baseRent: 20 },
  { tileIndex: 19, type: "PROPERTY", id: "koshi_tappu", name: "Koshi Tappu", price: 200, baseRent: 22 },

  { tileIndex: 20, type: "FREE_PARKING" },

  // Red – Valley Cities
  { tileIndex: 21, type: "PROPERTY", id: "kathmandu", name: "Kathmandu", price: 220, baseRent: 24 },
  { tileIndex: 22, type: "CHANCE" },
  { tileIndex: 23, type: "PROPERTY", id: "pokhara", name: "Pokhara", price: 220, baseRent: 26 },
  { tileIndex: 24, type: "PROPERTY", id: "patan", name: "Patan", price: 240, baseRent: 28 },

  // Rail
  { tileIndex: 25, type: "PROPERTY", id: "west_railway", name: "West Railway", price: 200, baseRent: 25 },

  // Yellow – Viewpoints
  { tileIndex: 26, type: "PROPERTY", id: "nagarkot", name: "Nagarkot", price: 260, baseRent: 32 },
  { tileIndex: 27, type: "PROPERTY", id: "sarangkot", name: "Sarangkot", price: 260, baseRent: 34 },
  { tileIndex: 28, type: "PROPERTY", id: "telecom", name: "Telecom", price: 150, baseRent: 4 },
  { tileIndex: 29, type: "PROPERTY", id: "dhulikhel", name: "Dhulikhel", price: 280, baseRent: 36 },

  { tileIndex: 30, type: "GO_TO_JAIL" },

  // Green – Mountains
  { tileIndex: 31, type: "PROPERTY", id: "annapurna", name: "Annapurna", price: 300, baseRent: 26 },
  { tileIndex: 32, type: "PROPERTY", id: "langtang", name: "Langtang", price: 300, baseRent: 26 },
  { tileIndex: 33, type: "COMMUNITY_CHEST" },
  { tileIndex: 34, type: "PROPERTY", id: "manaslu", name: "Manaslu", price: 320, baseRent: 28 },

  // Rail
  { tileIndex: 35, type: "PROPERTY", id: "north_railway", name: "North Railway", price: 200, baseRent: 25 },

  { tileIndex: 36, type: "CHANCE" },

  // Dark Blue – Peaks
  { tileIndex: 37, type: "PROPERTY", id: "makalu", name: "Makalu", price: 350, baseRent: 35 },
  { tileIndex: 38, type: "TAX", amount: 100 },
  { tileIndex: 39, type: "PROPERTY", id: "everest", name: "Everest", price: 400, baseRent: 50 },
];
