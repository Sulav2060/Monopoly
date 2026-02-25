import "./App.css";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Home from "./pages/Home";
import GameRoom from "./pages/GameRoom";
import NotFound from "./pages/NotFound";

// Redirect /game/:gameId → /?join=:gameId
const GameRedirect = () => {
  const { gameId } = useParams();
  return <Navigate to={`/?join=${gameId}`} replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game/:gameId" element={<GameRedirect />} />
      <Route path="/game/:gameId/play" element={<GameRoom />} />
      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;