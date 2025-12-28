import { Tile } from "../types/board"

export const BOARD: Tile[] = [
  { type: "GO" },                 // 0
  { type: "PROPERTY", name: "Mediterranean Ave", price: 60, rent: 2 },
  { type: "COMMUNITY" },
  { type: "PROPERTY", name: "Baltic Ave", price: 60, rent: 4 },
  { type: "TAX", amount: 200 },
  { type: "JAIL" },
  // ... (we’ll fill more later)
]
