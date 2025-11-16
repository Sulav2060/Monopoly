import React from "react";

const PlayerToken = ({ position }) => {
  // This function calculates the grid position for the token.
  // It's a bit complex but ensures the token is on the correct tile.
  const getPositionStyle = (pos) => {
    if (pos >= 0 && pos <= 6) return { gridRow: 1, gridColumn: pos + 1 }; // Top
    if (pos >= 7 && pos <= 12) return { gridRow: pos - 5, gridColumn: 7 }; // Right
    if (pos >= 13 && pos <= 18) return { gridRow: 7, gridColumn: 19 - pos }; // Bottom
    if (pos >= 19 && pos <= 23) return { gridRow: 25 - pos, gridColumn: 1 }; // Left
    return {};
  };

  return (
    <div className="absolute w-full h-full top-0 left-0 grid grid-cols-[1.6fr_repeat(5,1fr)_1.6fr] grid-rows-[1.6fr_repeat(5,1fr)_1.6fr] pointer-events-none">
      <div
        style={getPositionStyle(position)}
        className="flex items-center justify-center transition-all duration-500 ease-out"
      >
        <div className="w-8 h-8 bg-cyan-400 rounded-full border-2 border-white shadow-lg animate-bounce" />
      </div>
    </div>
  );
};

export default PlayerToken;
