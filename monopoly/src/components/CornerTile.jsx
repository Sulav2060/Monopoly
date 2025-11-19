import React from "react";

const CornerTile = ({ id, title, rotation }) => {
  return (
    // FIX: Added w-full and h-full here
    <div
      id={id}
      className="border border-black bg-gray-400 overflow-hidden flex items-center justify-center w-full h-full"
    >
      <div
        style={{ transform: `rotate(${rotation}deg)` }}
        className="text-center"
      >
        <span className="font-bold text-sm">{title}</span>
      </div>
    </div>
  );
};

export default CornerTile;
