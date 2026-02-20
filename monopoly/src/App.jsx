import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import JoinPage from "./pages/JoinPage";
import GameRoom from "./pages/GameRoom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game/:gameId" element={<JoinPage />} />
      <Route path="/game/:gameId/play" element={<GameRoom />} />
    </Routes>
  );
}

export default App;