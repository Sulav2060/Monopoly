import React from "react";
import Dice3D from "./Dice3D";

const CenterComponent = ({ dice1, dice2, isRolling, onRollComplete, showDice, currentPlayerIndex, totalPlayers }) => {
  return (
    <div className="col-span-5 row-span-5 bg-white border border-black flex flex-col items-center justify-center relative overflow-hidden">
      <h1 className="text-3xl font-bold mb-4">MONOPOLY</h1>
      
      {/* Dice Rolling Area - Always visible after first roll */}
      {showDice && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-full h-64">
            <Dice3D
              dice1={dice1}
              dice2={dice2}
              isRolling={isRolling}
              onRollComplete={onRollComplete}
              currentPlayerIndex={currentPlayerIndex}
              totalPlayers={totalPlayers}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CenterComponent;
