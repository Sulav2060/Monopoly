import { Router } from "express";
import { createGame, getGame } from "../ws/gameStore";
import { createInitialGameState } from "../engine/game";

const router = Router();

function generateShortId(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new game instance
router.post("/create", (req, res) => {
  const gameId = generateShortId();
  const initialState = createInitialGameState();

  createGame(gameId, initialState);

  console.log(`🆕 Created new game: ${gameId}`);

  res.json({
    gameId,
    message: "Game created successfully",
  });
});

router.get("/:gameId", (req, res) => {
  const { gameId } = req.params;
  const game = getGame(gameId);
  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }
  res.json({ gameId, status: game.state?.hasStarted ? "started" : "waiting" });
});

export default router;
