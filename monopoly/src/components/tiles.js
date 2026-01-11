export const corners = {
  "top-left": { 
    type: "corner", 
    title: "GO",          
    rotation: 135,
    image: "https://images.unsplash.com/photo-1526814050519-3f2f69f2d9fb?auto=format&fit=crop&w=800&q=80"
  },
  "top-right": { 
    type: "corner", 
    title: "Jail",        
    rotation: -135,
    image: "https://images.unsplash.com/photo-1549887534-7ef5d8bff4d5?auto=format&fit=crop&w=800&q=80"
  },
  "bottom-right": { 
    type: "corner", 
    title: "Parking",     
    rotation: -45,
    image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80"
  },
  "bottom-left": { 
    type: "corner", 
    title: "Go to Jail",  
    rotation: 45,
    image: "https://images.unsplash.com/photo-1559027615-cd2628902d4a?auto=format&fit=crop&w=800&q=80"
  },
};

export const tiles = {
  bottom: [
    // Group 1: TERAI CITIES (Dark Purple) – Cheapest
    { 
      type: "property",
      group: "dark-purple",
      title: "Janakpur",
      price: 60,
      rent: [2, 10, 30, 90, 160, 250],
      houseCost: 50,
      rotation: 0,
      image: "https://images.unsplash.com/photo-1583413234902-04023b2ba3a0?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "community-chest",
      title: "Community",
      rotation: 0,
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "property",
      group: "dark-purple",
      title: "Birgunj",
      price: 60,
      rent: [4, 20, 60, 180, 320, 450],
      houseCost: 50,
      rotation: 0,
      image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "tax",
      title: "Tax",
      price: 200,
      rotation: 0,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "railroad",
      title: "South Railway",
      price: 200,
      rent: [25, 50, 100, 200],
      rotation: 0,
      image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80"
    },

    // Group 2: LAKES (Light Blue)
    { 
      type: "property",
      group: "light-blue",
      title: "Phewa",
      price: 100,
      rent: [6, 30, 90, 270, 400, 550],
      houseCost: 50,
      rotation: 0,
      image: "https://images.unsplash.com/photo-1722592154622-60cc3c827465?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "chance",
      title: "Chance",
      rotation: 0,
      image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "property",
      group: "light-blue",
      title: "Rara",
      price: 100,
      rent: [8, 40, 100, 300, 450, 600],
      houseCost: 50,
      rotation: 0,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "property",
      group: "light-blue",
      title: "Begnas",
      price: 120,
      rent: [10, 50, 150, 450, 625, 750],
      houseCost: 100,
      rotation: 0,
      image: "https://images.unsplash.com/photo-1518831959410-48b794c2c94b?auto=format&fit=crop&w=800&q=80"
    },
  ],

  right: [
    // Group 3: TEMPLES (Pink)
    { 
      type: "property",
      group: "pink",
      title: "Pashupati",
      price: 140,
      rent: [12, 60, 180, 500, 700, 900],
      houseCost: 100,
      rotation: 90,
      image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "utility",
      title: "Hydropower",
      price: 150,
      rentMultiplier: [4, 10],
      rotation: 90,
      image: "https://images.unsplash.com/photo-1518614765139-b82d6d67883a?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "property",
      group: "pink",
      title: "Boudha",
      price: 140,
      rent: [14, 70, 200, 550, 750, 950],
      houseCost: 100,
      rotation: 90,
      image: "https://images.unsplash.com/photo-1583413234902-04023b2ba3a0?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "property",
      group: "pink",
      title: "Swayambhu",
      price: 160,
      rent: [16, 80, 220, 600, 800, 1000],
      houseCost: 100,
      rotation: 90,
      image: "https://images.unsplash.com/photo-1520496938502-73a5a82d5f3a?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "railroad",
      title: "East Railway",
      price: 200,
      rent: [25, 50, 100, 200],
      rotation: 90,
      image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&w=800&q=80"
    },

    // Group 4: NATIONAL PARKS (Orange)
    { 
      type: "property",
      group: "orange",
      title: "Chitwan",
      price: 180,
      rent: [18, 90, 250, 700, 875, 1050],
      houseCost: 150,
      rotation: 90,
      image: "https://images.unsplash.com/photo-1540573133985-87b6da556e38?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "community-chest",
      title: "Community",
      rotation: 90,
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "property",
      group: "orange",
      title: "Bardia",
      price: 180,
      rent: [20, 100, 300, 750, 925, 1100],
      houseCost: 150,
      rotation: 90,
      image: "https://images.unsplash.com/photo-1526481280695-3c687fd543c0?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "property",
      group: "orange",
      title: "Koshi Tappu",
      price: 200,
      rent: [22, 110, 330, 800, 975, 1150],
      houseCost: 150,
      rotation: 90,
      image: "https://images.unsplash.com/photo-1455218873509-8097305ee378?auto=format&fit=crop&w=800&q=80"
    },
  ],

  top: [
    // Group 5: VALLEY CITIES (Red)
    { 
      type: "property",
      group: "red",
      title: "Kathmandu",
      price: 220,
      rent: [24, 120, 360, 850, 1025, 1200],
      houseCost: 150,
      rotation: 180,
      image: "https://images.unsplash.com/photo-1533050487297-09b450131914?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "chance",
      title: "Chance",
      rotation: 180,
      image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "property",
      group: "red",
      title: "Pokhara",
      price: 220,
      rent: [26, 130, 390, 900, 1100, 1275],
      houseCost: 150,
      rotation: 180,
      image: "https://images.unsplash.com/photo-1526476148966-98bd039463ea?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "property",
      group: "red",
      title: "Patan",
      price: 240,
      rent: [28, 140, 400, 950, 1150, 1350],
      houseCost: 150,
      rotation: 180,
      image: "https://images.unsplash.com/photo-1562825101-bcfef760d45e?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "railroad",
      title: "West Railway",
      price: 200,
      rent: [25, 50, 100, 200],
      rotation: 180,
      image: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=800&q=80"
    },

    // Group 6: VIEWPOINTS (Yellow)
    { 
      type: "property",
      group: "yellow",
      title: "Nagarkot",
      price: 260,
      rent: [32, 160, 500, 1100, 1300, 1500],
      houseCost: 200,
      rotation: 180,
      image: "https://images.unsplash.com/photo-1550136513-548af444533e?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "utility",
      title: "Telecom",
      price: 150,
      rentMultiplier: [4, 10],
      rotation: 180,
      image: "https://images.unsplash.com/photo-1516031190212-da133013de50?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "property",
      group: "yellow",
      title: "Sarangkot",
      price: 260,
      rent: [34, 170, 520, 1150, 1350, 1550],
      houseCost: 200,
      rotation: 180,
      image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "property",
      group: "yellow",
      title: "Dhulikhel",
      price: 280,
      rent: [36, 180, 540, 1200, 1400, 1600],
      houseCost: 200,
      rotation: 180,
      image: "https://images.unsplash.com/photo-1613483514414-954b02368d79?auto=format&fit=crop&w=800&q=80"
    },
  ],

  left: [
    // Group 8: PEAKS (Dark Blue) – Most expensive
    { 
      type: "property",
      group: "dark-blue",
      title: "Everest",
      price: 400,
      rent: [50, 200, 600, 1400, 1700, 2000],
      houseCost: 200,
      rotation: -90,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80"
    },
    { 
      type: "tax",
      title: "Luxury Tax",
      price: 100,
      rotation: -90,
      image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "property",
      group: "dark-blue",
      title: "Makalu",
      price: 350,
      rent: [35, 175, 500, 1100, 1300, 1500],
      houseCost: 200,
      rotation: -90,
      image: "https://images.unsplash.com/photo-1521292270410-a8c53642e9d0?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "chance",
      title: "Chance",
      rotation: -90,
      image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "railroad",
      title: "North Railway",
      price: 200,
      rent: [25, 50, 100, 200],
      houseCost: 0,
      rotation: -90,
      image: "https://images.unsplash.com/photo-1432839318976-b5c5785ce43f?auto=format&fit=crop&w=800&q=80"
    },

    // Group 7: TREKS (Green)
    { 
      type: "property",
      group: "green",
      title: "Manaslu",
      price: 320,
      rent: [28, 150, 450, 1000, 1200, 1400],
      houseCost: 200,
      rotation: -90,
      image: "https://images.unsplash.com/photo-1545243424-0ce743321e11?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "community-chest",
      title: "Community",
      rotation: -90,
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "property",
      group: "green",
      title: "Langtang",
      price: 300,
      rent: [26, 130, 390, 900, 1100, 1275],
      houseCost: 200,
      rotation: -90,
      image: "https://images.unsplash.com/photo-1608908761160-14a98a27ba97?auto=format&fit=crop&w=800&q=80"
    },
    { 
      type: "property",
      group: "green",
      title: "Annapurna",
      price: 300,
      rent: [26, 130, 390, 900, 1100, 1275],
      houseCost: 200,
      rotation: -90,
      image: "https://images.unsplash.com/photo-1544739313-6fadacdd227f?auto=format&fit=crop&w=800&q=80"
    },
  ],
};