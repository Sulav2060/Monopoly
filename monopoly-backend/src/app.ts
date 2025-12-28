import express from "express";
import cors from "cors";
import gameRoutes from "./routes/game.routes";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/game", gameRoutes);

export default app;
