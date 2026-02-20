import React from "react";
import lakeside from "../assets/lakeside-pkr.webp";

const CornerTile = ({ id, title, rotation, image }) => {
  const tileImage = image || lakeside;
  const isJail = title === "Jail";

  return (
    <div id={id} className="w-full h-full relative group">
      {isJail ? (
        /* JAIL TILE - Split Layout with zones */
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0 bg-slate-900/50 rounded-lg overflow-hidden border border-white/10">
          {/* JUST VISITING - Top row (cyan zone) */}
          <div className="col-span-3 row-span-1 border-b border-white/10 bg-cyan-950/40 flex items-center justify-center relative">
            <span className="font-bold text-[10px] text-cyan-200 tracking-tighter uppercase">
              Just Visiting
            </span>
          </div>

          {/* IN JAIL - Right side (red zone with prison bars pattern) */}
          <div className="col-span-2 row-span-2 relative bg-linear-to-br from-red-900/60 to-red-950/80 border-l border-t border-red-500/50 overflow-hidden flex flex-col items-center justify-center">
            {/* Prison bar pattern overlay */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 4px, #000 4px, #000 6px)",
              }}
            />

            <div className="relative z-10 text-center">
              <div className="font-black text-xs text-red-100 tracking-widest uppercase">
                In
              </div>
              <div className="font-black text-xs text-red-100 tracking-widest uppercase">
                Jail
              </div>
            </div>
          </div>

          {/* VISITING SECTION - Left column (cyan zone) */}
          <div className="col-span-1 row-span-2 border-r border-white/10 bg-cyan-950/40 flex flex-col items-center justify-center gap-1 p-2">
            {/* Empty - tokens positioned by PlayerToken component */}
          </div>
        </div>
      ) : (
        /* REGULAR CORNER TILE */
        <div className="border border-white/20 bg-linear-to-br from-cyan-500/20 via-cyan-400/10 to-cyan-300/5 overflow-hidden flex items-center justify-center w-full h-full relative rounded-lg shadow-[0_8px_32px_-8px_rgba(6,182,212,0.4)] backdrop-blur-md">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url(${tileImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-linear-to-br from-slate-900/40 via-slate-900/30 to-slate-900/20" />
          <div
            style={{ transform: `rotate(${rotation}deg)` }}
            className="text-center absolute z-10"
          >
            <span className="font-bold text-sm text-cyan-100 tracking-wide uppercase">
              {title}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CornerTile;
