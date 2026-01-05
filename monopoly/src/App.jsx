import "./App.css";
import Board from "./components/Board";
import Game from "./components/Game";
import Lobby from "./components/Lobby";
import { useGame } from "./context/GameContext";

function App() {
  const { currentGame } = useGame();

  const handleGameStart = () => {
    // Game start is handled by context state now
    // All players will see the game when currentGame is set
  };

  // Show Lobby if no game started
  if (!currentGame) {
    return <Lobby onGameStart={handleGameStart} />;
  }

  // Show Game component when a game is active
  return (
    <>
      <Game backendGame={currentGame} />
    </>
  );
}

export default App;
