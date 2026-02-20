import React, { useState, useMemo } from 'react';

const COLOR_GROUP_SIZES = {
  "dark-purple": 2,
  "light-blue": 3,
  "pink": 3,
  "orange": 3,
  "red": 3,
  "yellow": 3,
  "green": 3,
  "dark-blue": 2,
};

export default function BuildMenu({ currentPlayerId, properties, onBuild }) {
  const [selectedColor, setSelectedColor] = useState(null);

  const monopolies = useMemo(() => {
    const playerProps = properties.filter(p => p.ownerId === currentPlayerId);
    
    // Debug - remove after confirming it works
    console.log("currentPlayerId:", currentPlayerId);
    console.log("playerProps:", playerProps);

    const groups = {};
    playerProps.forEach(p => {
      if (!p.color) return;
      if (!groups[p.color]) groups[p.color] = [];
      groups[p.color].push(p);
    });

    console.log("groups:", groups);

    return Object.entries(groups)
      .filter(([color, props]) => {
        const expectedSize = COLOR_GROUP_SIZES[color];
        console.log(`Color ${color}: has ${props.length}, needs ${expectedSize}`);
        return expectedSize && props.length === expectedSize && !props.some(p => p.isMortgaged);
      })
      .map(([color, props]) => ({ color, properties: props }));
  }, [properties, currentPlayerId]);

  const canBuild = (property, groupProperties) => {
    if (property.hotel === 1) return false;
    const currentBuilds = property.houses + (property.hotel * 5);
    return groupProperties.every(p => {
      if (p.id === property.id) return true;
      const otherBuilds = p.houses + (p.hotel * 5);
      return currentBuilds <= otherBuilds;
    });
  };

  const handleBuild = (property) => {
    const buildType = property.houses === 4 ? 'HOTEL' : 'HOUSE';
    onBuild(property.id, buildType);
  };

  if (monopolies.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p className="text-4xl mb-3">🏚️</p>
        <p className="font-semibold">No monopolies yet</p>
        <p className="text-sm mt-1">Own all properties in a color group to build</p>
      </div>
    );
  }

  return (
    <div className="text-white w-full">
      {/* Color Group Selector */}
      <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
        {monopolies.map((mono) => (
          <button
            key={mono.color}
            onClick={() => setSelectedColor(mono.color === selectedColor ? null : mono.color)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all capitalize whitespace-nowrap ${
              selectedColor === mono.color
                ? 'ring-2 ring-white scale-105'
                : 'opacity-60 hover:opacity-100'
            }`}
            style={{ backgroundColor: mono.color === 'lightblue' ? '#87CEEB' : mono.color }}
          >
            {mono.color}
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

            return (
              <div key={property.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div>
                  <p className="font-bold">{property.name}</p>
                  <div className="text-sm text-slate-400 mt-1">
                    {property.hotel === 1 ? (
                      <span className="text-red-400 font-bold">🏨 Hotel (max)</span>
                    ) : property.houses === 0 ? (
                      <span>No buildings</span>
                    ) : (
                      <span className="text-green-400">{"🏠".repeat(property.houses)}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Cost: ${property.housePrice}
                  </div>
                </div>

                <button
                  onClick={() => handleBuild(property)}
                  disabled={!buildAllowed}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                    buildAllowed
                      ? 'bg-orange-500 hover:bg-orange-400 text-white hover:-translate-y-0.5'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isHotelNext ? '🏨 Hotel' : '🏠 House'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!selectedColor && (
        <p className="text-slate-400 text-sm text-center py-2">
          Select a color group above to build
        </p>
      )}
    </div>
  );
}