import React from "react";

const Arrow = ({ side, offset = 0.5 }) => {
  const base = "absolute w-3 h-3 bg-white rotate-45 border border-gray-300";
  const offsetPercent = `${offset * 100}%`;
  const positions = {
    // side indicates where the card is relative to tile
    // arrow points back toward the tile
    bottom: {
      top: "-0.4rem",
      left: offsetPercent,
      transform: "translateX(-50%)",
    }, // arrow points up
    top: {
      bottom: "-0.4rem",
      left: offsetPercent,
      transform: "translateX(-50%)",
    }, // arrow points down
    left: {
      right: "-0.4rem",
      top: offsetPercent,
      transform: "translateY(-50%)",
    }, // arrow points right
    right: {
      left: "-0.4rem",
      top: offsetPercent,
      transform: "translateY(-50%)",
    }, // arrow points left
  };
  const style = positions[side] || positions.bottom;
  return <div className={base} style={style} />;
};

const PopoverCard = ({ tile, side = "top", arrowOffset = 0.5, onClose }) => {
  if (!tile) return null;
  const { title, type, group, price, rent, houseCost, rentMultiplier } = tile;
  const mortgage = price ? Math.floor(price / 2) : null;

  const groupColorMap = {
    "dark-purple": "bg-purple-900",
    "light-blue": "bg-sky-400",
    pink: "bg-pink-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
    yellow: "bg-yellow-400",
    green: "bg-green-600",
    "dark-blue": "bg-blue-900",
  };
  const headerColor = group
    ? groupColorMap[group] || "bg-gray-500"
    : "bg-gray-600";

  return (
    <div className="relative z-70">
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-56">
        <div
          className={`px-3 py-2 ${headerColor} text-white rounded-t-xl flex justify-between items-center`}
        >
          <div className="text-xs uppercase tracking-wide">
            {type?.toUpperCase() || "TILE"}
          </div>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white text-base font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-3">
          <div className="font-bold text-sm mb-1">{title}</div>
          {price && (
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Price</span>
              <span className="font-semibold">${price}</span>
            </div>
          )}
          {mortgage !== null && (
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Mortgage</span>
              <span className="font-semibold">${mortgage}</span>
            </div>
          )}
          {houseCost && type === "property" && (
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">House Cost</span>
              <span className="font-semibold">${houseCost}</span>
            </div>
          )}
          {Array.isArray(rent) && (
            <div className="mt-1">
              <div className="text-gray-700 font-semibold text-xs mb-1">
                Rent
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                <span className="text-gray-600">Base</span>
                <span className="font-medium">${rent[0]}</span>
                {rent.slice(1).map((r, i) => (
                  <React.Fragment key={`rent-${i}`}>
                    <span className="text-gray-600">
                      {i < rent.length - 2
                        ? `${i + 1} House${i === 0 ? "" : "s"}`
                        : "Hotel"}
                    </span>
                    <span className="font-medium">${r}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
          {rentMultiplier && type === "utility" && (
            <div className="text-[11px] text-gray-700 mt-1">
              Rent is {rentMultiplier[0]}x dice if one utility owned,{" "}
              {rentMultiplier[1]}x if both.
            </div>
          )}
        </div>
        <Arrow side={side} offset={arrowOffset} />
      </div>
    </div>
  );
};

export default PopoverCard;
