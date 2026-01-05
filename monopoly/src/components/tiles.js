export const tiles = {
  bottom: [
  
    { type: "property", group: "dark-purple", title: "Kathmandu Durbar Square", price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, rotation: 0 },
    { type: "community-chest", title: "Community Chest", rotation: 0 },
    { type: "property", group: "dark-purple", title: "Patan Durbar Square", price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, rotation: 0 },
    { type: "tax", title: "Income Tax", price: 200, rotation: 0 },
    { type: "railroad", title: "Kathmandu-Pokhara Express", price: 200, rent: [25, 50, 100, 200], rotation: 0 },
    { type: "property", group: "light-blue", title: "Phewa Lake, Pokhara", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, rotation: 0 },
    { type: "chance", title: "Tourism Boost", rotation: 0 },
    { type: "property", group: "light-blue", title: "Nagarkot Viewpoint", price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, rotation: 0 },
    { type: "property", group: "light-blue", title: "Dhulikhel Hills", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, rotation: 0 },
   
  ],
  right: [
    { type: "property", group: "pink", title: "Bhaktapur Durbar Square", price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, rotation: 90 },
    { type: "utility", title: "Hydropower Plant", price: 150, rentMultiplier: [4, 10], rotation: 90 },
    { type: "property", group: "pink", title: "Boudhanath Stupa", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, rotation: 90 },
    { type: "property", group: "pink", title: "Swayambhunath Stupa", price: 180, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, rotation: 90 },
    { type: "railroad", title: "Nepal Railways", price: 200, rent: [25, 50, 100, 200], rotation: 90 },
    { type: "property", group: "orange", title: "Chitwan National Park", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, rotation: 90 },
    { type: "community-chest", title: "Community Chest", rotation: 90 },
    { type: "property", group: "orange", title: "Lumbini", price: 220, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, rotation: 90 },
    { type: "property", group: "orange", title: "Pokhara Lakeside", price: 240, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, rotation: 90 },
   
  ],
  top: [
    { type: "property", group: "red", title: "Pashupatinath Temple", price: 260, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 150, rotation: 180 },
    { type: "chance", title: "Festival Bonus", rotation: 180 },
    { type: "property", group: "red", title: "Sagarmatha National Park", price: 280, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, rotation: 180 },
    { type: "property", group: "red", title: "Rara Lake", price: 300, rent: [30, 160, 500, 1100, 1300, 1500], houseCost: 200, rotation: 180 },
    { type: "railroad", title: "Kathmandu-Birgunj Express", price: 300, rent: [25, 50, 100, 200], rotation: 180 },
    { type: "property", group: "yellow", title: "Manaslu Region", price: 320, rent: [32, 170, 550, 1200, 1400, 1600], houseCost: 200, rotation: 180 },
    { type: "utility", title: "Telecommunication Tower", price: 150, rentMultiplier: [4, 10], rotation: 180 },
    { type: "property", group: "yellow", title: "Annapurna Circuit", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, rotation: 180 },
    { type: "property", group: "yellow", title: "Upper Mustang", price: 450, rent: [60, 220, 660, 1500, 1800, 2100], houseCost: 200, rotation: 180 },
    
  ],
  left: [
    { type: "property", group: "green", title: "Rara National Park", price: 500, rent: [70, 250, 750, 1600, 1950, 2200], houseCost: 200, rotation: -90 },
    { type: "property", group: "green", title: "Langtang Valley", price: 500, rent: [70, 250, 750, 1600, 1950, 2200], houseCost: 200, rotation: -90 },
    { type: "community-chest", title: "Community Chest", rotation: -90 },
    { type: "property", group: "green", title: "Gosaikunda Lake", price: 550, rent: [75, 300, 800, 1700, 2050, 2300], houseCost: 200, rotation: -90 },
    { type: "railroad", title: "East-West Highway Express", price: 600, rent: [25, 50, 100, 200], rotation: -90 },
    { type: "property", group: "blue", title: "Sagarmatha Summit", price: 700, rent: [100, 400, 1100, 2000, 2400, 2800], houseCost: 200, rotation: -90 },
    { type: "chance", title: "Weather Advantage", rotation: -90 },
    { type: "property", group: "blue", title: "Makalu Base Camp", price: 800, rent: [150, 500, 1200, 2200, 2600, 3000], houseCost: 200, rotation: -90 },
    { type: "property", group: "blue", title: "Upper Dolpo", price: 900, rent: [200, 600, 1400, 2400, 2800, 3200], houseCost: 200, rotation: -90 },
   
  ],
};

export const corners = {
  "top-left": { type: "corner", title: "GO", rotation: 135 },
  "top-right": { type: "corner", title: "Just Visiting / Jail", rotation: -135 },
  "bottom-right": { type: "corner", title: "Free Parking", rotation: -45 },
  "bottom-left": { type: "corner", title: "Go to Jail", rotation: 45 },
};