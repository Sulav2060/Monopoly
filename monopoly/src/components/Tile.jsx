import React from "react";

const Tile = ({ id, title, price, rotation, group, type }) => {
  // Color mapping for property groups
  const colorMap = {
    "dark-purple": "bg-purple-900",
    "light-blue": "bg-sky-400",
    pink: "bg-pink-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
    yellow: "bg-yellow-400",
    green: "bg-green-600",
    "dark-blue": "bg-blue-900",
    railroad: "bg-black",
    utility: "bg-gray-400",
  };

  const bgColor = group ? colorMap[group] || "bg-gray-300" : "bg-green-100";
  const isVertical = rotation === 90 || rotation === -90;

  // Render icon based on tile type
  const renderIcon = () => {
    // This part remains the same as your code
    if (type === "community-chest") {
      return (
        <div className="flex flex-col items-center gap-1">
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="8" width="18" height="12" rx="2" />
            <path d="M12 8V4M8 4h8M12 12h.01" />
          </svg>
          <div className="font-semibold text-xs">{title}</div>
        </div>
      );
    }
    // ... all other icon types
    return (
      <>
        <div className="font-semibold text-xs">{title}</div>
        {price && <div className="text-xs font-medium">${price}</div>}
      </>
    );
  };

  return (
    // FIX: Added w-full and h-full here
    <div
      id={id}
      className={`relative border border-black ${bgColor} overflow-hidden w-full h-full`}
    >
      <div
        className="bg-white w-full h-[85%] p-1 flex flex-col justify-around text-center items-center"
        style={{
          position: "absolute",
          ...(rotation === 0 && { bottom: 0 }),
          ...(rotation === 180 && { top: 0 }),
          ...(rotation === 90 && { left: 0, width: "85%", height: "100%" }),
          ...(rotation === -90 && { right: 0, width: "85%", height: "100%" }),
        }}
      >
        <div
          style={{
            transform: `rotate(${rotation}deg)`,
            ...(isVertical && {
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              width: "75px",
            }),
          }}
        >
          {renderIcon()}
        </div>
      </div>
    </div>
  );
};

export default Tile;
