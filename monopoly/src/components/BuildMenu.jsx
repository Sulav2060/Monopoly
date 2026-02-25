import React, { useState, useMemo } from "react";

const COLOR_GROUP_SIZES = {
  "dark-purple": 2,
  "light-blue": 3,
  pink: 3,
  orange: 3,
  red: 3,
  yellow: 3,
  green: 3,
  "dark-blue": 2,
};

const COLOR_HEX = {
  "dark-purple": "#663399",
  "light-blue": "#87CEEB",
  pink: "#FF69B4",
  orange: "#FF8C00",
  red: "#FF0000",
  yellow: "#FFD700",
  green: "#00A651",
  "dark-blue": "#00008B",
};

export default function BuildMenu({
  currentPlayerId,
  properties,
  onBuild,
  onDestroy,
}) {
  const [selectedColor, setSelectedColor] = useState(null);

  const monopolies = useMemo(() => {
    const playerProps = properties.filter((p) => p.ownerId === currentPlayerId);

    const groups = {};
    playerProps.forEach((p) => {
      if (!p.color) return;
      if (!groups[p.color]) groups[p.color] = [];
      groups[p.color].push(p);
    });

    return Object.entries(groups)
      .filter(([color, props]) => {
        const expectedSize = COLOR_GROUP_SIZES[color];
        return (
          expectedSize &&
          props.length === expectedSize &&
          !props.some((p) => p.isMortgaged)
        );
      })
      .map(([color, props]) => ({ color, properties: props }));
  }, [properties, currentPlayerId]);

  const canBuild = (property, groupProperties) => {
    // Can't build if already has hotel or 5 houses
    if (property.hotel === 1 || property.houses === 5) return false;

    // Check Monopoly rule: max difference between properties is 1
    const currentHouses = property.houses;
    const otherHouses = groupProperties
      .filter((p) => p.id !== property.id)
      .map((p) => p.houses + (p.hotel ? 5 : 0));

    if (otherHouses.length === 0) return true;

    const maxOther = Math.max(...otherHouses);
    // Can build if equal to max or exactly 1 less than max
    return currentHouses === maxOther || currentHouses === maxOther - 1;
  };

  const canDestroy = (property, groupProperties) => {
    // Can't destroy if no buildings
    if (property.houses === 0 && property.hotel === 0) return false;

    // Check Monopoly rule: can only demolish if this property has the most
    const currentHouses = property.houses + (property.hotel ? 5 : 0);
    const otherHouses = groupProperties
      .filter((p) => p.id !== property.id)
      .map((p) => p.houses + (p.hotel ? 5 : 0));

    if (otherHouses.length === 0) return true;

    const maxOther = Math.max(...otherHouses);
    // Can destroy only if current >= all others (equal or more)
    return currentHouses >= maxOther;
  };

  const handleBuild = (property) => {
    const buildType = property.houses === 4 ? "HOTEL" : "HOUSE";
    onBuild(property.id, buildType);
  };

  const handleDestroy = (property) => {
    const destroyType = property.hotel === 1 ? "HOTEL" : "HOUSE";
    onDestroy(property.id, destroyType);
  };

  if (monopolies.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p className="text-4xl mb-3">🏚️</p>
        <p className="font-semibold">No monopolies yet</p>
        <p className="text-sm mt-1">
          Own all properties in a color group to build
        </p>
      </div>
    );
  }

  const selectedMonopoly = monopolies.find((m) => m.color === selectedColor);

  return (
    <div className="text-white w-full max-h-96 overflow-y-auto">
      {/* Color Tabs at Top */}
      <div className="flex gap-2 mb-6 pb-4 border-b border-slate-700">
        {monopolies.map((mono) => (
          <button
            key={mono.color}
            onClick={() =>
              setSelectedColor(mono.color === selectedColor ? null : mono.color)
            }
            className={`transition-all duration-200 rounded-full px-3 py-1.5 text-sm font-semibold flex items-center gap-2 ${
              selectedColor === mono.color
                ? "ring-2 ring-white scale-105"
                : "opacity-60 hover:opacity-90"
            }`}
            style={{
              backgroundColor: COLOR_HEX[mono.color] || mono.color,
              boxShadow:
                selectedColor === mono.color
                  ? `0 0 12px ${COLOR_HEX[mono.color] || mono.color}80`
                  : "none",
            }}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
            />
            <span className="capitalize">{mono.color}</span>
          </button>
        ))}
      </div>

      {/* Properties Menu - Clean Design */}
      {selectedMonopoly && (
        <div className="space-y-2">
          {selectedMonopoly.properties.map((property) => {
            const groupProps = selectedMonopoly.properties;
            const buildAllowed = canBuild(property, groupProps);
            const destroyAllowed = canDestroy(property, groupProps);
            const hasHotel = property.hotel === 1;

            // Display logic: show hotel if hotel exists or 5 houses, otherwise show house count or dash
            let buildingDisplay = "—";
            if (hasHotel) {
              buildingDisplay = "🏨 Hotel";
            } else if (property.houses === 5) {
              buildingDisplay = "🏨 Hotel Ready";
            } else if (property.houses > 0) {
              buildingDisplay = "🏠 " + property.houses;
            }

            return (
              <div
                key={property.id}
                className="p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-between gap-3"
              >
                {/* Property Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {property.name}
                  </p>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {buildingDisplay}
                  </div>
                </div>

                {/* Action Icons */}
                <div className="flex gap-1.5">
                  {/* Build Icon - only show if buildable */}
                  {buildAllowed && (
                    <button
                      onClick={() => handleBuild(property)}
                      title={
                        property.houses === 4 ? "Build hotel" : "Add house"
                      }
                      className="p-1.5 rounded-lg transition-all bg-green-600/80 hover:bg-green-500 text-white cursor-pointer hover:scale-110"
                    >
                      {property.houses === 4 ? "🏨" : "🏠"}
                    </button>
                  )}

                  {/* Destroy Icon - only show if destroyable */}
                  {destroyAllowed && (
                    <button
                      onClick={() => handleDestroy(property)}
                      title="Demolish building"
                      className="p-1.5 rounded-lg transition-all bg-red-600/80 hover:bg-red-500 text-white cursor-pointer hover:scale-110"
                    >
                      💥
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!selectedColor && monopolies.length > 0 && (
        <p className="text-slate-400 text-sm text-center py-6">
          Select a color tab above
        </p>
      )}
    </div>
  );
}
