import React from "react";
import lakeside from "../assets/lakeside-pkr.webp";

const CornerTile = ({ id, title, rotation, image }) => {
  const tileImage = image || lakeside;

  return (
    <div
      id={id}
      className="border border-white/20 bg-gradient-to-br from-cyan-500/20 via-cyan-400/10 to-cyan-300/5 overflow-hidden flex items-center justify-center w-full h-full relative rounded-lg shadow-[0_8px_32px_-8px_rgba(6,182,212,0.4)] backdrop-blur-md"
    >
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 opacity-30 rounded-lg"
        style={{
          backgroundImage: `url(${tileImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-900/30 to-slate-900/20 rounded-lg" />
      <div
        style={{ transform: `rotate(${rotation}deg)` }}
        className="text-center absolute z-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
      >
        <span className="font-bold text-sm text-cyan-100 tracking-wide">
          {title}
        </span>
      </div>
    </div>
  );
};

export default CornerTile;
