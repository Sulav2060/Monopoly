import React from "react";
import { tiles, corners } from "./tiles.js";
import Tile from "./Tile";
import CornerTile from "./CornerTile";
import CenterComponent from "./CenterComponent.jsx";
const Board = () => {
  return (
    <div className="w-screen h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="w-full h-full max-w-[80vmin] max-h-[80vmin] aspect-square">
        <div
          className="
            w-full h-full
            grid 
            grid-cols-[1.6fr_repeat(5,1fr)_1.6fr]
            grid-rows-[1.6fr_repeat(5,1fr)_1.6fr]
          "
        >
          {/* Top Row */}
          <CornerTile {...corners["top-left"]} />
          {tiles.top.map((tile, index) => (
            <Tile key={`top-${index}`} {...tile} />
          ))}
          <CornerTile {...corners["top-right"]} />

          {/* Middle Section: Left Tiles */}
          {tiles.left.map((tile, index) => (
            <div
              key={`left-wrapper-${index}`}
              className="grid"
              style={{ gridRow: index + 2, gridColumn: 1 }}
            >
              <Tile {...tile} />
            </div>
          ))}

          {/* Center Component */}
          <CenterComponent />

          {/* Middle Section: Right Tiles */}
          {tiles.right.map((tile, index) => (
            <div
              key={`right-wrapper-${index}`}
              className="grid"
              style={{ gridRow: index + 2, gridColumn: 7 }}
            >
              <Tile {...tile} />
            </div>
          ))}

          {/* Bottom Row */}
          <CornerTile {...corners["bottom-left"]} />
          {tiles.bottom.map((tile, index) => (
            <Tile key={`bottom-${index}`} {...tile} />
          ))}
          <CornerTile {...corners["bottom-right"]} />
        </div>
      </div>
    </div>
  );
};

export default Board;
