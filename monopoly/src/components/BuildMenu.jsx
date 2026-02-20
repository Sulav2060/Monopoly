import React, { useState, useEffect, useMemo } from 'react';

// Example data structure matching your backend state
const MOCK_PROPERTIES = [
  { id: 1, name: "Kathmandu", color: "blue", ownerId: "player1", houses: 2, hotel: 0, housePrice: 200, isMortgaged: false },
  { id: 2, name: "Pokhara", color: "blue", ownerId: "player1", houses: 2, hotel: 0, housePrice: 200, isMortgaged: false },
  { id: 3, name: "Lumbini", color: "green", ownerId: "player1", houses: 0, hotel: 0, housePrice: 150, isMortgaged: false },
];

const COLOR_GROUP_SIZES = {
  brown: 2, lightblue: 3, pink: 3, orange: 3, red: 3, yellow: 3, green: 3, blue: 2
};

export default function BuildMenu({ currentPlayerId, properties, onBuild }) {
  const [selectedColor, setSelectedColor] = useState(null);

  // 1. Find all color groups where the player has a monopoly
  const monopolies = useMemo(() => {
    const playerProps = properties.filter(p => p.ownerId === currentPlayerId);
    const counts = {};

    playerProps.forEach(p => {
      if (!p.color) return; // Skip utilities/stations
      counts[p.color] = counts[p.color] ? [...counts[p.color], p] : [p];
    });

    return Object.keys(counts).filter(color =>
      counts[color].length === COLOR_GROUP_SIZES[color] &&
      !counts[color].some(p => p.isMortgaged) // Cannot build if any are mortgaged
    ).map(color => ({
      color,
      properties: counts[color]
    }));
  }, [properties, currentPlayerId]);

  // 2. Logic to check if building on a specific property follows the "Even Build" rule
  const canBuild = (property, groupProperties) => {
    if (property.hotel === 1) return false; // Maxed out

    const currentBuilds = property.houses + (property.hotel * 5); // Treat hotel as 5 houses for math

    // Check if building here makes it uneven (difference > 1)
    const isValid = groupProperties.every(p => {
      if (p.id === property.id) return true;
      const otherBuilds = p.houses + (p.hotel * 5);
      return currentBuilds <= otherBuilds;
    });

    return isValid;
  };

  const handleBuild = (property) => {
    const isHotelUpgrade = property.houses === 4;
    // Call your WebSocket/Backend function here
    onBuild(property.id, isHotelUpgrade ? 'HOTEL' : 'HOUSE');
  };


  return (
    <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 text-white w-full max-w-md shadow-2xl">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">🏗️</span> Construction Menu
      </h3>

      {/* Color Group Selector */}
      <div className="flex gap-2 overflow-x-auto mb-4 pb-2">
        {monopolies.map((mono) => (
          <button
            key={mono.color}
            onClick={() => setSelectedColor(mono.color)}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${selectedColor === mono.color
                ? 'ring-2 ring-white scale-105'
                : 'opacity-70 hover:opacity-100'
              }`}
            style={{ backgroundColor: mono.color }}
          >
            {mono.color.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Properties in Selected Group */}
      {selectedColor && (
        <div className="space-y-3">
          {monopolies.find(m => m.color === selectedColor)?.properties.map(property => {
            const groupProps = monopolies.find(m => m.color === selectedColor).properties;
            const buildAllowed = canBuild(property, groupProps);
            const isHotelNext = property.houses === 4;
            const cost = property.housePrice;

            return (
              <div key={property.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div>
                  <p className="font-bold text-lg">{property.name}</p>
                  <div className="flex gap-1 mt-1 text-sm text-slate-400">
                    Structures:
                    {property.hotel === 1 ? (
                      <span className="text-red-400 font-bold ml-1">🏨 Hotel</span>
                    ) : (
                      <span className="text-green-400 font-bold ml-1">
                        {"🏠".repeat(property.houses) || "None"}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!isMyTurn) return;

                    const myProps = currentGame.properties?.filter(p => p.ownerId === currentPlayerId) || [];
                    const colorCounts = myProps.reduce((acc, p) => {
                      const tile = getTileAtIndex(p.tileIndex);
                      if (tile?.color) acc[tile.color] = (acc[tile.color] || 0) + 1;
                      return acc;
                    }, {});
                    const hasMonopoly = Object.entries(colorCounts).some(
                      ([color, count]) => count === COLOR_GROUP_SIZES[color]
                    );

                    if (!hasMonopoly) {
                      showNotification("You need a full color set to build!", "info");
                      return;
                    }
                    setShowBuildMenu(true);
                  }}
                  disabled={!isMyTurn}
                  className={`py-3 rounded-xl font-semibold transition-all border text-sm ${isMyTurn
                    ? "bg-orange-500/80 border-orange-400/70 text-white shadow-[0_10px_30px_-15px_rgba(249,115,22,0.8)] hover:-translate-y-0.5"
                    : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  🏗️ Build
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}