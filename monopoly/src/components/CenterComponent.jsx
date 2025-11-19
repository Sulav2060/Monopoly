import React from "react";
import Dice3D from "./utils/Dice3D";

const CenterComponent = ({
  currentDice,
  isRolling,
  onRollComplete,
  showDice = true,
  currentPlayerIndex,
  totalPlayers,
}) => {
  return (
    <div className="col-span-5 row-span-5 border border-black flex flex-col items-center justify-center relative overflow-hidden">
      {showDice && (
        <div className="absolute w-full h-full inset-0 aspect-square flex items-center justify-center z-50">
          <div className="w-full h-full">
            <Dice3D
              dice1={currentDice.d1}
              dice2={currentDice.d2}
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
