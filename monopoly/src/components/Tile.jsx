import React from "react";

const Tile = ({ title, price, rotation, group, type }) => {
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

  // Get background color based on group, or use transparent for non-property tiles
  const bgColor = group ? colorMap[group] || "bg-gray-300" : "bg-green-100";

  const isVertical = rotation === 90 || rotation === -90;

  // Render icon based on tile type
  const renderIcon = () => {
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

    if (type === "chance") {
      return (
        <div className="flex flex-col items-center gap-1">
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <div className="font-semibold text-xs">{title}</div>
        </div>
      );
    }

    if (type === "railroad") {
      return (
        <div className="flex flex-col items-center gap-1">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zm0 2c3.51 0 5.96.48 6.93 1.5H5.07C6.04 4.48 8.49 4 12 4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V7h5v3zm5.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-7h-5V7h5v3z" />
          </svg>
          <div className="font-semibold text-xs">{title}</div>
          {price && <div className="text-xs font-medium">${price}</div>}
        </div>
      );
    }

    if (type === "utility") {
      return (
        <div className="flex flex-col items-center gap-1">
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <div className="font-semibold text-xs">{title}</div>
          {price && <div className="text-xs font-medium">${price}</div>}
        </div>
      );
    }

    if (type === "tax") {
      return (
        <div className="flex flex-col items-center gap-1">
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <div className="font-semibold text-xs">{title}</div>
          {price && <div className="text-xs font-medium">${price}</div>}
        </div>
      );
    }

    // Default: property tile
    return (
      <>
        <div className="font-semibold text-xs">{title}</div>
        {price && <div className="text-xs font-medium">${price}</div>}
      </>
    );
  };

  return (
    <div className={`relative border border-black ${bgColor} overflow-hidden`}>
      <div
        className="bg-white w-full h-[85%] p-1 flex flex-col justify-around text-center items-center"
        style={{
          position: "absolute",
          ...(rotation === 0 && { bottom: 0 }),
          ...(rotation === 180 && { top: 0 }),
          ...(rotation === 90 && {
            left: 0,
            width: "85%",
            height: "100%",
          }),
          ...(rotation === -90 && {
            right: 0,
            width: "85%",
            height: "100%",
          }),
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
