import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GameProvider>
      <App />
    </GameProvider>
  </BrowserRouter>
);