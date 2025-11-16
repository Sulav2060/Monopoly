import React from "react";

const CornerTile = ({ title, rotation }) => {
  return (
    <div className="border border-black bg-gray-400 overflow-hidden flex items-center justify-center">
      <div style={{ transform: `rotate(${rotation}deg)` }}>
        <span className="font-bold">{title}</span>
      </div>
    </div>
  );
};

export default CornerTile;
