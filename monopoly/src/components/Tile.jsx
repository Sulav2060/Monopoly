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
  image,
  icon, // emoji icon for the property
}) => {
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

  // Icon / content renderer with better styling
  const renderIcon = () => {
    if (type === "community-chest") {
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="text-3xl">📦</div>
          <div className="font-bold text-xs tracking-tight">{title}</div>
        </div>
      );
    }

    if (type === "chance") {
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="text-3xl">❓</div>
          <div className="font-bold text-xs tracking-tight">{title}</div>
        </div>
      );
    }

    if (type === "tax") {
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="text-3xl">{icon || "💰"}</div>
          <div className="font-bold text-xs tracking-tight">{title}</div>
          {price && (
            <div className="text-xs font-semibold bg-black/40 px-2 py-0.5 rounded-full text-white">
              ${price}
            </div>
          )}
        </div>
      );
    }

    if (type === "railroad" || type === "utility") {
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="text-3xl">{icon || "🚂"}</div>
          <div className="font-bold text-xs text-center leading-tight px-1">
            {title}
          </div>
          {price && (
            <div className="text-xs font-semibold bg-black/40 px-2 py-0.5 rounded-full text-white">
              ${price}
            </div>
          )}
        </div>
      );
    }

    // Property tiles
    return (
      <div className="flex flex-col items-center gap-1">
        {icon && <div className="text-2xl">{icon}</div>}
        <div className="font-bold text-xs text-center leading-tight px-1">
          {title}
        </div>
        {price && (
          <div className="text-xs font-semibold bg-black/50 px-2 py-0.5 rounded-full text-white">
            ${price}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      id={id}
      className="relative border-2 border-black/20 overflow-hidden w-full h-full flex flex-col rounded-xl shadow-lg"
    >
      {/* Background image with stronger blur */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${tileImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px) brightness(0.8)",
        }}
      />

      {/* Semi-transparent overlay for better text contrast */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />

      {/* Color strip - brighter and more visible */}
      {group && (
        <div
          className={`absolute ${bgColor} shadow-md`}
          style={{
            opacity: 0.95,
            ...(rotation === 180 && {
              top: 0,
              width: "100%",
              height: "20%",
            }),
            ...(rotation === 0 && {
              bottom: 0,
              width: "100%",
              height: "20%",
            }),
            ...(rotation === -90 && {
              right: 0,
              width: "20%",
              height: "100%",
            }),
            ...(rotation === 90 && {
              left: 0,
              width: "20%",
              height: "100%",
            }),
          }}
        />
      )}

      {/* Content area - fixed positioning */}
      <div
        className="absolute flex items-center justify-center p-2"
        style={{
          ...(rotation === 180 && {
            bottom: 0,
            left: 0,
            right: 0,
            height: group ? "80%" : "100%",
          }),
          ...(rotation === 0 && {
            top: 0,
            left: 0,
            right: 0,
            height: group ? "80%" : "100%",
          }),
          ...(rotation === -90 && {
            left: 0,
            top: 0,
            bottom: 0,
            width: group ? "80%" : "100%",
          }),
          ...(rotation === 90 && {
            right: 0,
            top: 0,
            bottom: 0,
            width: group ? "80%" : "100%",
          }),
          zIndex: 10,
        }}
      >
        <div
          className="flex flex-col items-center justify-center"
          style={{
            ...(isVertical && {
              transform: `rotate(${rotation}deg)`,
              width: "100%",
            }),
          }}
        >
          {/* Content with text shadow for readability */}
          <div
            style={{
              transform: isVertical ? "rotate(180deg)" : "rotate(0deg)",
              textShadow:
                "0 0 8px rgba(255, 255, 255, 0.9), 0 0 4px rgba(255, 255, 255, 0.8)",
              color: "#000",
            }}
          >
            {renderIcon()}
          </div>
        </div>
      </div>

      {/* Owner indicator - more prominent */}
      {ownedBy && (
        <div
          className={`absolute ${ownedBy} shadow-lg border border-white/50`}
          style={{
            opacity: 0.9,
            zIndex: 20,
            ...(rotation === 0 && {
              top: 0,
              left: 0,
              right: 0,
              height: "18%",
            }),
            ...(rotation === 180 && {
              bottom: 0,
              left: 0,
              right: 0,
              height: "18%",
            }),
            ...(rotation === 90 && {
              right: 0,
              top: 0,
              bottom: 0,
              width: "18%",
            }),
            ...(rotation === -90 && {
              left: 0,
              top: 0,
              bottom: 0,
              width: "18%",
            }),
          }}
        />
      )}
    </div>
  );
};

export default Tile;
