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
  onPayJailFee,
  isJailAutoEnding,
  currentPlayer,
  isPendingAction,
  isPendingDebt,
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
    isAnimating ||
    (!isEndState && hasRolled) ||
    (!isEndState && !isMyTurn) ||
    isPendingAction ||
    isPendingDebt ||
    isJailAutoEnding;
  const buttonTone = isEndState
    ? "bg-indigo-500/80 border-indigo-400/60 hover:bg-indigo-500"
    : `${rollBg} border-white/20 hover:opacity-90`;

  return (
    <div className="w-full h-full bg-linear-to-br from-slate-900/50 via-slate-800/30 to-slate-900/40 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Centerpiece Image */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none select-none">
        <img
          src="/nepal.jpg"
          alt="Centerpiece"
          className="w-full h-full object-cover"
        />
      </div>

      {showDice && currentDice && (
        <div className="absolute inset-0 z-50">
          <Dice3D
            dice1={currentDice.d1 ?? 1}
            dice2={currentDice.d2 ?? 1}
            isRolling={isRolling}
            onRollComplete={onRollComplete}
            currentPlayerIndex={currentTurnIndex}
            totalPlayers={totalPlayers}
            onDiceClick={
              !hasRolled && isMyTurn && !isAnimating ? onRollDice : undefined
            }
          />
        </div>
      )}

      {/* Control Panel at Bottom */}
      {showControls && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-60 flex flex-col items-center gap-4 max-w-sm w-[min(420px,90vw)]">
          {/* Jail Payment Button - Only show when in jail AND not during auto-ending turn */}
          {currentPlayer?.inJail && !isJailAutoEnding && (
            <button
              onClick={onPayJailFee}
              disabled={isAnimating || currentPlayer.money < 50}
              className={`mx-auto px-6 py-2.5 text-sm font-semibold rounded-lg
    border backdrop-blur-md transition-all
    shadow-[0_10px_30px_-12px_rgba(0,0,0,0.9)]
    ${
      isAnimating || currentPlayer.money < 50
        ? "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
        : "bg-linear-to-r from-amber-500 to-amber-600 border-amber-400/30 text-white hover:-translate-y-0.5 hover:shadow-amber-500/25"
    }`}
            >
              🔓 Pay Rs.50 to Exit Jail
            </button>
          )}

          
          <button
            onClick={actionHandler}
            disabled={actionDisabled}
            className={`mx-auto px-6 py-2.5 text-sm font-semibold rounded-lg
    border backdrop-blur-md transition-all
    shadow-[0_10px_30px_-12px_rgba(0,0,0,0.9)]
    ${
      actionDisabled
        ? "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
        : "bg-linear-to-r from-blue-500 to-blue-600 border-blue-400/30 text-white hover:-translate-y-0.5 hover:shadow-blue-500/25"
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
