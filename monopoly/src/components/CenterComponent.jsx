import React from "react";
import Dice3D from "./utils/Dice3D";

const CenterComponent = ({
  currentDice,
  isRolling,
  onRollComplete,
  showDice = true,
  currentPlayerIndex,
  totalPlayers,
  hasRolled,
  isMyTurn,
  isAnimating,
  onRollDice,
  onEndTurn,
  currentPlayer,
}) => {
  const rollBg = currentPlayer?.color?.color || "bg-emerald-600";
  const showControls = !!isMyTurn;

  return (
    <div className="col-span-9 row-span-9 border border-black flex flex-col items-center justify-center relative overflow-hidden bg-linear-to-br from-slate-50 to-slate-100">
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

      {/* Control Panel at Bottom */}
      {showControls && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-60 bg-white rounded-xl shadow-2xl p-4 flex items-center gap-4 max-w-sm">
          {/* Dice Display */}
          {/* <div className="flex gap-2">
            <div className="w-12 h-12 bg-white border-4 border-gray-800 rounded-lg flex items-center justify-center text-xl font-bold shadow-md">
              {currentDice.d1}
            </div>
            <div className="w-12 h-12 bg-white border-4 border-gray-800 rounded-lg flex items-center justify-center text-xl font-bold shadow-md">
              {currentDice.d2}
            </div>
          </div> */}

          {/* Buttons */}
          <div className="flex flex-row gap-2">
            <button
              onClick={onRollDice}
              disabled={isAnimating || hasRolled}
              className={`px-5 py-2 font-bold text-sm rounded-lg shadow-lg transition-all whitespace-nowrap ${
                isAnimating || hasRolled
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : `${rollBg} text-white hover:opacity-90 transform hover:scale-105`
              }`}
            >
              {isAnimating ? "Moving..." : hasRolled ? "Rolled" : "🎲 Roll"}
            </button>

            <button
              onClick={onEndTurn}
              disabled={!hasRolled || isAnimating}
              className={`px-5 py-2 font-bold text-sm rounded-lg shadow-lg transition-all whitespace-nowrap ${
                !hasRolled || isAnimating
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105"
              }`}
            >
              End Turn
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CenterComponent;
