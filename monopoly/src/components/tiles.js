export const tiles = {
  // Top Row (rendered left to right, after "Free Parking")
  top: [
    { type: "property", group: "red", title: "Kentucky Avenue", price: 220, rotation: 180 },
    { type: "chance", title: "Chance", rotation: 180 },
    { type: "property", group: "red", title: "Indiana Avenue", price: 220, rotation: 180 },
    { type: "property", group: "red", title: "Illinois Avenue", price: 240, rotation: 180 },
    { type: "railroad", title: "B. & O. Railroad", price: 200, rotation: 180 },
  ],
  // Right side (rendered top to bottom, after "Go to Jail")
  right: [
    { type: "property", group: "yellow", title: "Atlantic Avenue", price: 260, rotation: -90 },
    { type: "property", group: "yellow", title: "Ventnor Avenue", price: 260, rotation: -90 },
    { type: "utility", title: "Water Works", price: 150, rotation: -90 },
    { type: "property", group: "yellow", title: "Marvin Gardens", price: 280, rotation: -90 },
    { type: "go-to-jail", title: "Go to Jail", rotation: -90 },
  ],
  // Bottom row (rendered right to left, after "Go")
  bottom: [
    { type: "property", group: "dark-purple", title: "Mediterranean Avenue", price: 60, rotation: 0 },
    { type: "community-chest", title: "Community Chest", rotation: 0 },
    { type: "property", group: "dark-purple", title: "Baltic Avenue", price: 60, rotation: 0 },
    { type: "tax", title: "Income Tax", price: 200, rotation: 0 },
    { type: "railroad", title: "Reading Railroad", price: 200, rotation: 0 },
  ],
  // Left side (rendered bottom to top, after "Jail")
  left: [
    { type: "property", group: "orange", title: "New York Avenue", price: 200, rotation: 90 },
    { type: "property", group: "orange", title: "Tennessee Avenue", price: 180, rotation: 90 },
    { type: "community-chest", title: "Community Chest", rotation: 90 },
    { type: "property", group: "orange", title: "St. James Place", price: 180, rotation: 90 },
    { type: "railroad", title: "Pennsylvania Railroad", price: 200, rotation: 90 },
  ],
};

export const corners = {
  "top-left": { type: "corner", title: "Free Parking", rotation: 135 },
  "top-right": { type: "corner", title: "Go to Jail", rotation: -135 },
  "bottom-right": { type: "corner", title: "Go", rotation: -45 },
  "bottom-left": { type: "corner", title: "Just Visiting", rotation: 45 },
};