export const tiles = {
  bottom: [
    // Group 1: TERAI CITIES (Dark Purple) - Lowland urban centers
    { 
      type: "property", 
      group: "dark-purple", 
      title: "Janakpur", 
      icon: "🏛️",
      price: 60, 
      rent: [2, 10, 30, 90, 160, 250], 
      houseCost: 50, 
      rotation: 0,
      image: "https://images.unsplash.com/photo-1706188370039-e0cf9bd6ea16?q=80&w=2670&auto=format&fit=crop"
    },
    { 
      type: "community-chest", 
      title: "Community", 
      rotation: 0,
      image: "https://images.unsplash.com/photo-1578926078328-123456789?w=500&h=500&fit=crop"
    },
    { 
      type: "property", 
      group: "dark-purple", 
      title: "Birgunj", 
      icon: "🏛️",
      price: 60, 
      rent: [4, 20, 60, 180, 320, 450], 
      houseCost: 50, 
      rotation: 0,
      image: "https://images.unsplash.com/photo-1609898793184-7d1496532e84?q=80&w=2170&auto=format&fit=crop"
    },
    { 
      type: "tax", 
      title: "Tax", 
      icon: "💰",
      price: 200, 
      rotation: 0,
      image: "https://images.unsplash.com/photo-1579621970563-ebec5330507e?w=500&h=500&fit=crop"
    },
    { 
      type: "railroad", 
      title: "South Railway", 
      icon: "🚂",
      price: 200, 
      rent: [25, 50, 100, 200], 
      rotation: 0,
      image: "https://images.unsplash.com/photo-1474487220716-f3dd330c4d79?w=500&h=500&fit=crop"
    },
    
    // Group 2: LAKES (Light Blue) - Water bodies
    { 
      type: "property", 
      group: "light-blue", 
      title: "Phewa Lake", 
      icon: "🌊",
      price: 100, 
      rent: [6, 30, 90, 270, 400, 550], 
      houseCost: 50, 
      rotation: 0,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
    { 
      type: "chance", 
      title: "Chance", 
      rotation: 0,
      image: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=500&h=500&fit=crop"
    },
    { 
      type: "property", 
      group: "light-blue", 
      title: "Rara Lake", 
      icon: "🌊",
      price: 100, 
      rent: [8, 40, 100, 300, 450, 600], 
      houseCost: 50, 
      rotation: 0,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
    { 
      type: "property", 
      group: "light-blue", 
      title: "Begnas Lake", 
      icon: "🌊",
      price: 120, 
      rent: [10, 50, 150, 450, 625, 750], 
      houseCost: 100, 
      rotation: 0,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
  ],
  
  right: [
    // Group 3: TEMPLES (Pink) - Religious sites
    { 
      type: "property", 
      group: "pink", 
      title: "Pashupatinath", 
      icon: "🛕",
      price: 140, 
      rent: [12, 60, 180, 500, 700, 900], 
      houseCost: 100, 
      rotation: 90,
      image: "https://images.unsplash.com/photo-1585773846884-d0c6dc7bab18?w=500&h=500&fit=crop"
    },
    { 
      type: "utility", 
      title: "Hydropower", 
      icon: "⚡",
      price: 150, 
      rentMultiplier: [4, 10], 
      rotation: 90,
      image: "https://images.unsplash.com/photo-1579621970563-ebec5330507e?w=500&h=500&fit=crop"
    },
    { 
      type: "property", 
      group: "pink", 
      title: "Boudhanath", 
      icon: "🛕",
      price: 140, 
      rent: [14, 70, 200, 550, 750, 950], 
      houseCost: 100, 
      rotation: 90,
      image: "https://images.unsplash.com/photo-1585773846884-d0c6dc7bab18?w=500&h=500&fit=crop"
    },
    { 
      type: "property", 
      group: "pink", 
      title: "Swayambhu", 
      icon: "🛕",
      price: 160, 
      rent: [16, 80, 220, 600, 800, 1000], 
      houseCost: 100, 
      rotation: 90,
      image: "https://images.unsplash.com/photo-1585773846884-d0c6dc7bab18?w=500&h=500&fit=crop"
    },
    { 
      type: "railroad", 
      title: "East Railway", 
      icon: "🚂",
      price: 200, 
      rent: [25, 50, 100, 200], 
      rotation: 90,
      image: "https://images.unsplash.com/photo-1474487220716-f3dd330c4d79?w=500&h=500&fit=crop"
    },
    
    // Group 4: NATIONAL PARKS (Orange) - Wildlife reserves
    { 
      type: "property", 
      group: "orange", 
      title: "Chitwan Park", 
      icon: "🦏",
      price: 180, 
      rent: [18, 90, 250, 700, 875, 1050], 
      houseCost: 150, 
      rotation: 90,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
    { 
      type: "community-chest", 
      title: "Community", 
      rotation: 90,
      image: "https://images.unsplash.com/photo-1578926078328-123456789?w=500&h=500&fit=crop"
    },
    { 
      type: "property", 
      group: "orange", 
      title: "Bardia Park", 
      icon: "🦏",
      price: 180, 
      rent: [20, 100, 300, 750, 925, 1100], 
      houseCost: 150, 
      rotation: 90,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
    { 
      type: "property", 
      group: "orange", 
      title: "Koshi Tappu", 
      icon: "🦏",
      price: 200, 
      rent: [22, 110, 330, 800, 975, 1150], 
      houseCost: 150, 
      rotation: 90,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
  ],
  
  top: [
    // Group 5: VALLEYS (Red) - Hill regions
    { 
      type: "property", 
      group: "red", 
      title: "Kathmandu", 
      icon: "🏔️",
      price: 220, 
      rent: [24, 120, 360, 850, 1025, 1200], 
      houseCost: 150, 
      rotation: 180,
      image: "https://images.unsplash.com/photo-1585773846884-d0c6dc7bab18?w=500&h=500&fit=crop"
    },
    { 
      type: "chance", 
      title: "Chance", 
      rotation: 180,
      image: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=500&h=500&fit=crop"
    },
    { 
      type: "property", 
      group: "red", 
      title: "Pokhara", 
      icon: "🏔️",
      price: 220, 
      rent: [26, 130, 390, 900, 1100, 1275], 
      houseCost: 150, 
      rotation: 180,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
    { 
      type: "property", 
      group: "red", 
      title: "Patan", 
      icon: "🏔️",
      price: 240, 
      rent: [28, 140, 400, 950, 1150, 1350], 
      houseCost: 150, 
      rotation: 180,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
    { 
      type: "railroad", 
      title: "West Railway", 
      icon: "🚂",
      price: 200, 
      rent: [25, 50, 100, 200], 
      rotation: 180,
      image: "https://images.unsplash.com/photo-1474487220716-f3dd330c4d79?w=500&h=500&fit=crop"
    },
    
    // Group 6: VIEWPOINTS (Yellow) - Scenic hills
    { 
      type: "property", 
      group: "yellow", 
      title: "Nagarkot", 
      icon: "🌄",
      price: 260, 
      rent: [32, 160, 500, 1100, 1300, 1500], 
      houseCost: 200, 
      rotation: 180,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
    { 
      type: "utility", 
      title: "Telecom", 
      icon: "📡",
      price: 150, 
      rentMultiplier: [4, 10], 
      rotation: 180,
      image: "https://images.unsplash.com/photo-1579621970563-ebec5330507e?w=500&h=500&fit=crop"
    },
    { 
      type: "property", 
      group: "yellow", 
      title: "Sarangkot", 
      icon: "🌄",
      price: 260, 
      rent: [34, 170, 520, 1150, 1350, 1550], 
      houseCost: 200, 
      rotation: 180,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
    { 
      type: "property", 
      group: "yellow", 
      title: "Dhulikhel", 
      icon: "🌄",
      price: 280, 
      rent: [36, 180, 540, 1200, 1400, 1600], 
      houseCost: 200, 
      rotation: 180,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
  ],
  
  left: [
    // Group 7: TREKS (Green) - Trekking routes
    { 
      type: "property", 
      group: "green", 
      title: "Annapurna", 
      icon: "🥾",
      price: 300, 
      rent: [40, 200, 600, 1400, 1700, 2000], 
      houseCost: 200, 
      rotation: -90,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
    { 
      type: "property", 
      group: "green", 
      title: "Langtang", 
      icon: "🥾",
      price: 300, 
      rent: [42, 210, 620, 1450, 1750, 2050], 
      houseCost: 200, 
      rotation: -90,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
    { 
      type: "community-chest", 
      title: "Community", 
      rotation: -90,
      image: "https://images.unsplash.com/photo-1578926078328-123456789?w=500&h=500&fit=crop"
    },
    { 
      type: "property", 
      group: "green", 
      title: "Manaslu", 
      icon: "🥾",
      price: 320, 
      rent: [44, 220, 660, 1500, 1800, 2100], 
      houseCost: 200, 
      rotation: -90,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
    { 
      type: "railroad", 
      title: "North Railway", 
      icon: "🚂",
      price: 200, 
      rent: [25, 50, 100, 200], 
      rotation: -90,
      image: "https://images.unsplash.com/photo-1474487220716-f3dd330c4d79?w=500&h=500&fit=crop"
    },
    
    // Group 8: PEAKS (Dark Blue) - Highest mountains
    { 
      type: "property", 
      group: "dark-blue", 
      title: "Everest", 
      icon: "⛰️",
      price: 350, 
      rent: [50, 250, 750, 1700, 2050, 2400], 
      houseCost: 200, 
      rotation: -90,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
    { 
      type: "chance", 
      title: "Chance", 
      rotation: -90,
      image: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=500&h=500&fit=crop"
    },
    { 
      type: "property", 
      group: "dark-blue", 
      title: "Makalu", 
      icon: "⛰️",
      price: 400, 
      rent: [100, 500, 1500, 2200, 2600, 3000], 
      houseCost: 200, 
      rotation: -90,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"
    },
    { 
      type: "tax", 
      title: "Luxury Tax", 
      icon: "💎",
      price: 100, 
      rotation: -90,
      image: "https://images.unsplash.com/photo-1579621970563-ebec5330507e?w=500&h=500&fit=crop"
    },
  ],
};

export const corners = {
  "top-left": { type: "corner", title: "GO", rotation: 135 },
  "top-right": { type: "corner", title: "Jail", rotation: -135 },
  "bottom-right": { type: "corner", title: "Parking", rotation: -45 },
  "bottom-left": { type: "corner", title: "Go to Jail", rotation: 45 },
};