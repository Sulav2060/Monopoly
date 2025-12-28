import { Router } from "express";
import { createGame } from "../engine/game";

const router = Router();

router.get("/init", (req, res) => {
  const game = createGame(["Alice", "Bob"]);
  res.json(game);
});

export default router;
