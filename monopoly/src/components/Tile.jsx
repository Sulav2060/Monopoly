import React from "react";
import lakeside from "../assets/lakeside-pkr.webp";

const Tile = ({
  id,
  title,
  price,
  rotation,
  group,
  type,
  ownedBy,
  isMortgaged,
  image,
  icon, // emoji icon for the property
  houses,
}) => {
  // Debug logging for house building
  React.useEffect(() => {
    if (group && houses > 0) {
      console.log(`🏠 Tile "${title}" has ${houses} houses`, {
        id,
        group,
        houses,
        ownedBy,
      });
    }
  }, [houses, title, group, id, ownedBy]);

  const tileImage = image || lakeside;

  // Modern color palette with better contrast
  const colorMap = {
    "dark-purple": "bg-purple-600",
    "light-blue": "bg-cyan-400",
    pink: "bg-rose-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
    yellow: "bg-amber-400",
    green: "bg-emerald-500",
    "dark-blue": "bg-blue-600",
    railroad: "bg-slate-800",
    utility: "bg-gray-500",
  };

  const bgColor = group ? colorMap[group] || "bg-gray-300" : "bg-slate-200";
  const isVertical = rotation === 90 || rotation === -90;
  const ownerBgClass =
    typeof ownedBy === "string" ? ownedBy : ownedBy?.color || null;
  const ownerGlow =
    typeof ownedBy === "object" && ownedBy?.glow ? ownedBy.glow : null;

  // Icon / content renderer with better styling
  const renderIcon = () => {
    if (type === "community-chest") {
      return (
        <div className="flex flex-col items-center gap-1 w-full overflow-hidden">
          <div className="font-bold text-[0.5rem] sm:text-xs tracking-tight text-center wrap-break-words w-full px-0.5">
            {title}
          </div>
        </div>
      );
    }

    if (type === "chance") {
      return (
        <div className="flex flex-col items-center gap-1 w-full overflow-hidden">
          <div className="font-bold text-[0.5rem] sm:text-xs tracking-tight text-center wrap-break-words w-full px-0.5">
            {title}
          </div>
        </div>
      );
    }

    if (type === "tax") {
      return (
        <div className="flex flex-col items-center gap-0.5 w-full overflow-hidden">
          <div className="font-bold text-[0.6rem] sm:text-xs tracking-tight text-center truncate w-full px-0.5">
            {title}
          </div>
          {price && (
            <div className="text-[0.5rem] sm:text-xs font-semibold bg-black/40 px-1.5 py-0.5 rounded-full text-white">
              Rs. {price}
            </div>
          )}
        </div>
      );
    }

    if (type === "railroad" || type === "utility") {
      return (
        <div className="flex flex-col items-center gap-0.5 w-full overflow-hidden">
          <div className="font-bold text-[0.6rem] sm:text-xs text-center leading-tight px-0.5 w-full truncate">
            {title}
          </div>
          {price && (
            <div className="text-[0.5rem] sm:text-xs font-semibold bg-black/40 px-1.5 py-0.5 rounded-full text-white">
              Rs. {price}
            </div>
          )}
        </div>
      );
    }

    // Property tiles
    return (
      <div className="flex flex-col items-center gap-0.5 justify-center w-full h-full overflow-hidden">
        <div className="font-bold text-[0.6rem] sm:text-xs text-center leading-tight px-0.5 w-full truncate">
          {title}
        </div>
        {price && (
          <div className="text-[0.5rem] sm:text-xs font-semibold bg-black/50 px-1.5 py-0.5 rounded-full text-white">
            Rs. {price}
          </div>
        )}
      </div>
    );
  };

  // Get the emoji icon for a property
  const getPropertyIcon = () => {
    if (icon) return icon;
    if (type === "community-chest") return "📦";
    if (type === "chance") return "❓";
    if (type === "tax") return icon || "💰";
    if (type === "railroad") return "🚂";
    if (type === "utility") return "⚡";
    return "🏠";
  };

  return (
    <div
      id={id}
      className={`relative border border-white/20 overflow-visible w-full h-full 
              flex flex-col rounded-lg 
              shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)] 
              bg-linear-to-br from-white/8 via-white/5 to-white/2 
              backdrop-blur-md
              ${isMortgaged ? "grayscale-20 opacity-70" : ""}
  `}
    >
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 opacity-30 rounded-lg "
        style={{
          backgroundImage: `url(${tileImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900/60 via-slate-900/40 to-slate-900/20 rounded-lg " />

      {/* Color accent bar - neon style - for properties */}
      {group && (
        <div
          className={`
      absolute ${bgColor}
      shadow-[0_0_20px_-5px]
      transition-all duration-200
      hover:shadow-[0_0_30px_0px]
      opacity-90
      ${
        rotation === 0
          ? "bottom-0 w-full h-[18%] rounded-b-lg"
          : rotation === 180
            ? "top-0 w-full h-[18%] rounded-t-lg"
            : rotation === 90
              ? "left-0 h-full w-[18%] rounded-l-lg"
              : rotation === -90
                ? "right-0 h-full w-[18%] rounded-r-lg"
                : ""
      }
    `}
          style={{
            boxShadow: `0 0 20px -5px ${bgColor.split("-")[1]}`,
          }}
        />
      )}

      {/* Owner bar for railroads and utilities */}
      {ownerBgClass && (type === "railroad" || type === "utility") && (
        <div
          className={`absolute ${ownerBgClass} opacity-90 rounded-sm`}
          style={{
            zIndex: 20,
            ...(rotation === 180 && {
              bottom: 0,
              left: 0,
              right: 0,
              height: "14%",
            }),
            ...(rotation === 0 && {
              top: 0,
              left: 0,
              right: 0,
              height: "14%",
            }),
            ...(rotation === -90 && {
              left: 0,
              top: 0,
              bottom: 0,
              width: "14%",
            }),
            ...(rotation === 90 && {
              right: 0,
              top: 0,
              bottom: 0,
              width: "14%",
            }),
          }}
        />
      )}

      {/* Content wrapper with better text styling */}
      <div className="absolute inset-0 flex items-center justify-center p-1.5 z-20">
        <div className="text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {renderIcon()}
        </div>
      </div>

      {isMortgaged && (
        <div
          className="absolute z-30 flex items-center justify-center
               rounded-full bg-yellow-400 text-black
               shadow-[0_0_12px_rgba(255,215,0,0.9)] text-[0.7rem] sm:text-xs
               w-6 h-6 sm:w-7 sm:h-7"
          style={{
            ...(rotation === 0 && {
              top: 4,
              left: "50%",
              transform: "translateX(-50%)",
            }),

            ...(rotation === 180 && {
              bottom: 4,
              left: "50%",
              transform: "translateX(-50%)",
            }),

            ...(rotation === 90 && {
              right: 4,
              top: "50%",
              transform: "translateY(-50%)",
            }),

            ...(rotation === -90 && {
              left: 4,
              top: "50%",
              transform: "translateY(-50%)",
            }),
          }}
        >
          🔒
        </div>
      )}
      {/* House/Hotel Display - bottom space opposite of group bar */}
      {group && (
        <div
          className={`absolute ${
            ownerBgClass || "bg-white/10"
          } border border-white/20 rounded-sm flex items-center justify-center gap-0.5`}
          style={{
            zIndex: 15,
            ...(rotation === 0 && {
              top: 2,
              left: 2,
              right: 2,
              height: "12%",
            }),
            ...(rotation === 180 && {
              bottom: 2,
              left: 2,
              right: 2,
              height: "12%",
            }),
            ...(rotation === 90 && {
              right: 2,
              top: 2,
              bottom: 2,
              width: "12%",
            }),
            ...(rotation === -90 && {
              left: 2,
              top: 2,
              bottom: 2,
              width: "12%",
            }),
          }}
        >
          {/* Houses/hotels will be rendered here */}
          {houses > 4 ? (
            <div className="flex items-center justify-center gap-0.5">
              <span className="text-xs sm:text-sm">🏨</span>
            </div>
          ) : (
            /* Houses Display - show houses if 1-4 houses */
            houses > 0 && (
              <div className={`flex items-center justify-center ${isVertical ? 'flex-col gap-0' : 'gap-0.5'}`}>
                <span className="text-[0.6rem] sm:text-xs">🏠</span>
                {houses > 1 && (
                  <>
                    <span className="text-[0.5rem] sm:text-[0.6rem] font-bold text-white">
                      x
                    </span>
                    <span className="text-[0.5rem] sm:text-[0.6rem] font-bold text-white">
                      {houses}
                    </span>
                  </>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Tile;
