export const corners = {
  "top-left": {
    type: "corner",
    title: "GO",
    rotation: 0,
    image: "https://images.unsplash.com/photo-1761653457980-21b9f7fd3a04?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80"
  },
  "top-right": {
    type: "corner",
    title: "Jail",
    rotation: 0,
    image: "https://images.unsplash.com/photo-1516024693578-e0623769b752?q=80&w=2681&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Prison bars
  },
  "bottom-right": {
    type: "corner",
    title: "Parking",
    rotation: 0,
    image: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80" // Parking lot
  },
  "bottom-left": {
    type: "corner",
    title: "Go to Jail",
    rotation: 0,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80" // Police/jail theme
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
      image: "https://images.unsplash.com/photo-1550850603-645ae3c6c387?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Janaki Temple from Wikimedia
    },
    {
      type: "community-chest",
      title: "Community",
      rotation: 0,
      image: "https://images.unsplash.com/photo-1642211841112-2beeda7bfc07?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Community/helping hands
    },
    {
      type: "property",
      group: "dark-purple",
      title: "Birgunj",
      price: 60,
      rent: [4, 20, 60, 180, 320, 450],
      houseCost: 50,
      rotation: 0,
      image: "https://images.unsplash.com/photo-1734793650000-72b59fcf2d09?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Nepal city/market
    },
    {
      type: "tax",
      title: "Tax",
      price: 200,
      rotation: 0,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80" // Calculator/tax
    },
    {
      type: "railroad",
      title: "South airport",
      price: 200,
      rent: [25, 50, 100, 200],
      rotation: 0,
      image: "https://imgs.search.brave.com/W5fJOGVNMxEuELkXJ-ciaVocuA8xOZ4Jxr5qZJYHdBw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zd2Fy/YWp5YS5ndW1sZXQu/aW8vc3dhcmFqeWEv/MjAyMy0wMS8xNTU5/MTg4Yy1mYjJlLTQw/ODQtOGU5NS0zZjU2/YWI2MGZlYjcvUG9r/aGFyYS5qcGc_dz02/MTAmcT03NSZjb21w/cmVzcz10cnVlJmZv/cm1hdD1hdXRv" // Train tracks
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
      image: "https://images.unsplash.com/photo-1722595631994-6de3b5318da1?q=80&w=1336&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Phewa Lake boats
    },
    {
      type: "chance",
      title: "Chance",
      rotation: 0,
      image: "https://images.unsplash.com/photo-1628260412297-a3377e45006f?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Question mark/mystery
    },
    {
      type: "property",
      group: "light-blue",
      title: "Rara",
      price: 100,
      rent: [8, 40, 100, 300, 450, 600],
      houseCost: 50,
      rotation: 0,
      image: "https://images.unsplash.com/photo-1630804597431-46a42500fe02?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Mountain lake
    },
    {
      type: "property",
      group: "light-blue",
      title: "Begnas",
      price: 120,
      rent: [10, 50, 150, 450, 625, 750],
      houseCost: 100,
      rotation: 0,
      image: "https://images.unsplash.com/photo-1691885770413-7cba2e97c779?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Serene lake
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
      image: "https://images.unsplash.com/photo-1648298470994-7065f521375c?q=80&w=1417&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Pashupatinath Temple
    },
    {
      type: "utility",
      title: "Hydropower",
      price: 150,
      rentMultiplier: [4, 10],
      rotation: 90,
      image: "https://images.unsplash.com/photo-1611036884458-6650ef4ccfdb?q=80&w=3264&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Hydroelectric dam
    },
    {
      type: "property",
      group: "pink",
      title: "Boudha",
      price: 140,
      rent: [14, 70, 200, 550, 750, 950],
      houseCost: 100,
      rotation: 90,
      image: "https://plus.unsplash.com/premium_photo-1694475032847-e6a228961e98?q=80&w=1830&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Boudhanath Stupa
    },
    {
      type: "property",
      group: "pink",
      title: "Swayambhu",
      price: 160,
      rent: [16, 80, 220, 600, 800, 1000],
      houseCost: 100,
      rotation: 90,
      image: "https://images.unsplash.com/photo-1662721737580-b1558a41a49a?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Swayambhunath Temple
    },
    {
      type: "railroad",
      title: "East airport",
      price: 200,
      rent: [25, 50, 100, 200],
      rotation: 90,
      image: "https://imgs.search.brave.com/QxYQsBzCnKeY9089ovXw6V4wyB3jqy5HY-ClyDiKDRk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvOTAy/NDYyMDkyL3Bob3Rv/L2thdGhtYW5kdXMt/cXVvdC10cmliaHV2/YW4tcXVvdC1pbnRl/cm5hdGlvbmFsLWFp/cnBvcnQtaW4tbmVw/YWwtYXQtYW4tZWxl/dmF0aW9uLW9mLTEz/MzhtLWhpZ2guanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPVJW/M0tVLUhnNzVqMVYz/LVBZLWFBMnJqYTBo/QkUtUG0zTy1ENDNl/RVVDQVE9" // airport
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
      image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=800&q=80" // Elephant/Chitwan
    },
    {
      type: "community-chest",
      title: "Community",
      rotation: 90,
    image: "https://images.unsplash.com/photo-1642211841112-2beeda7bfc07?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Community/helping hands
    },
    {
      type: "property",
      group: "orange",
      title: "Bardia",
      price: 180,
      rent: [20, 100, 300, 750, 925, 1100],
      houseCost: 150,
      rotation: 90,
      image: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=800&q=80" // Tiger/wildlife
    },
    {
      type: "property",
      group: "orange",
      title: "Koshi Tappu",
      price: 200,
      rent: [22, 110, 330, 800, 975, 1150],
      houseCost: 150,
      rotation: 90,
      image: "https://imgs.search.brave.com/a_yb1n7h8ABJJrgG_URy3gaZkJ7-uOa3_uNiOWbye8c/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/a29zaGl0YXBwdS5j/b20vd3AtY29udGVu/dC91cGxvYWRzL3Bo/b3RvLWdhbGxlcnkv/dGh1bWIvdmlsbGFn/ZS13YWxrLWtvc2hp/LXRhcHB1LXdpbGRs/aWZlLWNhbXAtbmVw/YWwtcGhvdG8tMjIu/anBnP2J3Zz0xNTY3/MDUyODQz" // Birds/wetland
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
      image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=800&q=80" // Kathmandu valley
    },
    {
      type: "chance",
      title: "Chance",
      rotation: 180,
      image: "https://images.unsplash.com/photo-1628260412297-a3377e45006f?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Question mark/mystery
    },
    {
      type: "property",
      group: "red",
      title: "Pokhara",
      price: 220,
      rent: [26, 130, 390, 900, 1100, 1275],
      houseCost: 150,
      rotation: 180,
      image: "https://images.unsplash.com/photo-1562462181-b228e3cff9ad?q=80&w=3410&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Pokhara lakeside
    },
    {
      type: "property",
      group: "red",
      title: "Patan",
      price: 240,
      rent: [28, 140, 400, 950, 1150, 1350],
      houseCost: 150,
      rotation: 180,
      image: "https://images.unsplash.com/photo-1585597800810-07a63ea8e983?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Patan Durbar Square
    },
    {
      type: "railroad",
      title: "West airport",
      price: 200,
      rent: [25, 50, 100, 200],
      rotation: 180,
      image: "https://images.unsplash.com/photo-1759027421185-f798efb2d35a?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Train
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
      image: "https://images.unsplash.com/photo-1585898175463-4bb8b8a9dea2?q=80&w=3268&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Mountain sunrise
    },
    
    {
      type: "property",
      group: "yellow",
      title: "Sarangkot",
      price: 260,
      rent: [34, 170, 520, 1150, 1350, 1550],
      houseCost: 200,
      rotation: 180,
      image: "https://images.unsplash.com/photo-1687495423260-5466c1c83c1f?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Paragliding viewpoint
    },
    {
      type: "utility",
      title: "Telecom",
      price: 150,
      rentMultiplier: [4, 10],
      rotation: 180,
      image: "https://imgs.search.brave.com/LsuU_EQYS09B8hygZOGvTRBrb3TjZ3JQg21Q417wWuY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/aW52ZXN0b3BhcGVy/LmNvbS93cC1jb250/ZW50L3VwbG9hZHMv/MjAyMC8wNi9uZXBh/bC10ZWxlY29tLW50/Yy0xLTc5Nng0NDUu/anBn" // Communication tower
    },
     {
      type: "utility",
      title: "Telecom",
      price: 150,
      rentMultiplier: [4, 10],
      rotation: 180,
      image: "https://images.unsplash.com/photo-1516031190212-da133013de50?auto=format&fit=crop&w=800&q=80" // Communication tower
    },
    {
      type: "property",
      group: "yellow",
      title: "Dhulikhel",
      price: 280,
      rent: [36, 180, 540, 1200, 1400, 1600],
      houseCost: 200,
      rotation: 180,
      image: "https://images.unsplash.com/photo-1607602014822-8a126e0d3de4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80" // Himalayan panorama
    },
  ],
 left: [
  {
    type: "property",
    group: "green",
    title: "Annapurna",
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
    rotation: -90,
    image: "https://images.unsplash.com/photo-1697621535550-1c671d4969c4?q=80&w=3264&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80"
  },
  {
    type: "property",
    group: "green",
    title: "Langtang",
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
    rotation: -90,
    image: "https://images.unsplash.com/photo-1574930220106-c8d35aa7b452?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80"
  },
  {
    type: "community-chest",
    title: "Community",
    rotation: -90,
    image: "https://images.unsplash.com/photo-1642211841112-2beeda7bfc07?q=80&w=2670&auto=format&fit=crop"
  },
  {
    type: "property",
    group: "green",
    title: "Manaslu",
    price: 320,
    rent: [28, 150, 450, 1000, 1200, 1400],
    houseCost: 200,
    rotation: -90,
    image: "https://images.unsplash.com/photo-1691516347103-d29505e72c4a?q=80&w=1334&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80"
  },
  {
    type: "railroad",
    title: "North airport",
    price: 200,
    rent: [25, 50, 100, 200],
    houseCost: 0,
    rotation: -90,
    image: "https://imgs.search.brave.com/lX9pjw2I5GpugzsV6RqFi86IolGKBXmjQUxoc8UuXgE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMtYXBpLmthdGht/YW5kdXBvc3QuY29t/L3RodW1iLnBocD9z/cmM9aHR0cHM6Ly9h/c3NldHMtY2RuLmth/dGhtYW5kdXBvc3Qu/Y29tL3VwbG9hZHMv/c291cmNlL25ld3Mv/MjAyMi9uZXdzL3Ro/dW1iMy0xNjUyMTQ5/MDk3LmpwZyZ3PTkw/MCZoZWlnaHQ9NjAx"
  },
  {
    type: "chance",
    title: "Chance",
    rotation: -90,
    image: "https://images.unsplash.com/photo-1628260412297-a3377e45006f?q=80&w=2148&auto=format&fit=crop"
  },
  {
    type: "property",
    group: "dark-blue",
    title: "Makalu",
    price: 350,
    rent: [35, 175, 500, 1100, 1300, 1500],
    houseCost: 200,
    rotation: -90,
    image: "https://images.unsplash.com/photo-1584395631446-e41b0fc3f68d?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80"
  },
  {
    type: "tax",
    title: "Luxury Tax",
    price: 100,
    rotation: -90,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=3411&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80"
  },
  {
    type: "property",
    group: "dark-blue",
    title: "Everest",
    price: 400,
    rent: [50, 200, 600, 1400, 1700, 2000],
    houseCost: 200,
    rotation: -90,
    image: "https://images.unsplash.com/photo-1720939485733-43c874b6044d?q=80&w=3264&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=1200&q=80"
  }
],

};