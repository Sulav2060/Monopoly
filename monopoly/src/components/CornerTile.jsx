import React from "react";

const CornerTile = ({ id, title, rotation }) => {
  return (
    <div
      id={id}
      className="border-2 border-black bg-[#097099] overflow-hidden flex items-center justify-center w-full h-full relative rounded-xl"
    >
      <div
        style={{ transform: `rotate(${rotation}deg)` }}
        className="text-center absolute"
      >
        <span className="font-bold text-sm text-white drop-shadow-lg whitespace-nowrap">
          {title}
        </span>
      </div>
    </div>
  );
};

export default CornerTile;
