import React from "react";

const Tile = ({
  id,
  title,
  price,
  rotation,
  group,
  type,
  ownedBy, // pass tailwind bg color e.g. "bg-red-600"
}) => {
  // Property group color (original Monopoly color strip)
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

  // Icon / content renderer
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

    return (
      <>
        <div className="font-semibold text-[10px] leading-tight text-center px-1">
          {title}
        </div>
        {price && <div className="text-[9px] font-medium mt-0.5">${price}</div>}
      </>
    );
  };

  // Ownership color strip (opposite side of group strip)
  const ownerStripStyle = {
    ...(rotation === 180 && { top: 0 }),
    ...(rotation === 0 && { bottom: 0 }),
    ...(rotation === -90 && { right: 0, width: "15%", height: "100%" }),
    ...(rotation === 90 && { left: 0, width: "15%", height: "100%" }),
  };

  return (
    <>
      <div
        id={id}
        className={`relative border border-black ${bgColor} overflow-hidden w-full h-full flex flex-col`}
      >
        {/* MAIN WHITE CONTENT */}
        <div
          className="bg-white p-2 flex flex-col justify-center text-center items-center"
          style={{
            position: "absolute",
            ...(rotation === 180 && {
              bottom: 0,
              width: "100%",
              height: "85%",
            }),
            ...(rotation === 0 && { top: 0, width: "100%", height: "85%" }),
            ...(rotation === -90 && { left: 0, width: "85%", height: "100%" }),
            ...(rotation === 90 && { right: 0, width: "85%", height: "100%" }),
          }}
        >
          <div
            className="flex flex-col items-center justify-center gap-1"
            style={{
              transform: `rotate(${rotation}deg)`,
              ...(isVertical && {
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                width: "80%",
              }),
            }}
          >
            {/* force correct text orientation */}
            <div style={{ transform: "rotate(180deg)" }}>{renderIcon()}</div>
            {/* OWNER COLOR STRIP */}
          </div>
          {ownedBy && (
            <div
              className={`absolute ${ownedBy} z-10`}
              style={{
                ...(rotation === 0 && {
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "15%",
                }),
                ...(rotation === 180 && {
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: "15%",
                }),
                ...(rotation === 90 && {
                  right: 0,
                  top: 0,
                  width: "15%",
                  height: "100%",
                }),
                ...(rotation === -90 && {
                  left: 0,
                  top: 0,
                  width: "15%",
                  height: "100%",
                }),
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Tile;
