import express from "express";
import cors from "cors";
import gameRoutes from "./routes/game.routes";
import roomRoutes from "./routes/room.routes";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/game", gameRoutes);
app.use("/room", roomRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
