import React from "react";
import Dice3D from "./utils/Dice3D";

const CenterComponent = ({
  currentDice,
  isRolling,
  onRollComplete,
  showDice = true,
  currentTurnIndex,
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

  const isDisabled = isAnimating || (!hasRolled && !isMyTurn);
  const isEndState = hasRolled;
  const actionLabel = isAnimating
    ? "Moving..."
    : isEndState
    ? "End Turn"
    : "🎲 Roll Dice";
  const actionHandler = isEndState ? onEndTurn : onRollDice;
  const actionDisabled =
    isAnimating || (!isEndState && hasRolled) || (!isEndState && !isMyTurn);
  const buttonTone = isEndState
    ? "bg-indigo-500/80 border-indigo-400/60 hover:bg-indigo-500"
    : `${rollBg} border-white/20 hover:opacity-90`;

  return (
    <div className="col-span-9 row-span-9 bg-[#1D1D1D] flex flex-col items-center justify-center relative overflow-hidden ">
      {showDice && (
        <div className="absolute w-full h-full inset-0 aspect-square flex items-center justify-center z-50">
          <div className="w-full h-full">
            <Dice3D
              dice1={currentDice.d1}
              dice2={currentDice.d2}
              isRolling={isRolling}
              onRollComplete={onRollComplete}
              currentTurnIndex={currentTurnIndex}
              totalPlayers={totalPlayers}
            />
          </div>
        </div>
      )}

      {/* Control Panel at Bottom */}
      {showControls && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-60 bg-white/10 border border-white/10 rounded-xl shadow-[0_10px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-xl p-5 flex flex-col items-center gap-3 max-w-sm w-[min(420px,90vw)]">
          <button
            onClick={actionHandler}
            disabled={actionDisabled}
            className={`w-full px-5 py-3 font-bold text-sm rounded-xl border transition-all shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)] ${
              actionDisabled
                ? "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                : `${buttonTone} text-white hover:-translate-y-0.5`
            }`}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default CenterComponent;
