// SVG Geometric Shapes Library
const SHAPES = {
  circle: {
    id: "circle",
    name: "Circle",
    svg: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="currentColor" stroke="black" stroke-width="1"/></svg>',
  },
  square: {
    id: "square",
    name: "Square",
    svg: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="36" height="36" fill="currentColor" stroke="black" stroke-width="1"/></svg>',
  },
  triangle: {
    id: "triangle",
    name: "Triangle",
    svg: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,2 38,38 2,38" fill="currentColor" stroke="black" stroke-width="1"/></svg>',
  },
  diamond: {
    id: "diamond",
    name: "Diamond",
    svg: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,2 38,20 20,38 2,20" fill="currentColor" stroke="black" stroke-width="1"/></svg>',
  },
  star: {
    id: "star",
    name: "Star",
    svg: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,2 24,15 38,15 28,23 32,36 20,28 8,36 12,23 2,15 16,15" fill="currentColor" stroke="black" stroke-width="1"/></svg>',
  },
  hexagon: {
    id: "hexagon",
    name: "Hexagon",
    svg: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="currentColor" stroke="black" stroke-width="1"/></svg>',
  },
  pentagon: {
    id: "pentagon",
    name: "Pentagon",
    svg: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,2 38,15 31,37 9,37 2,15" fill="currentColor" stroke="black" stroke-width="1"/></svg>',
  },
  heart: {
    id: "heart",
    name: "Heart",
    svg: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20,36 C20,36 2,22 2,14 C2,8.5 5,5 9,5 C12,5 15,7 20,11 C25,7 28,5 31,5 C35,5 38,8.5 38,14 C38,22 20,36 20,36 Z" fill="currentColor" stroke="black" stroke-width="1"/></svg>',
  },
  cross: {
    id: "cross",
    name: "Cross",
    svg: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><rect x="17" y="2" width="6" height="36"/><rect x="2" y="17" width="36" height="6"/></g></svg>',
  },
  crescent: {
    id: "crescent",
    name: "Crescent",
    svg: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="currentColor" stroke="black" stroke-width="1"/><circle cx="24" cy="20" r="14" fill="black"/></svg>',
  },
  spiral: {
    id: "spiral",
    name: "Spiral",
    svg: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M 20 5 A 15 15 0 0 1 35 20 A 11 11 0 0 1 20 31 A 7 7 0 0 1 13 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  },
};

// Get array of all shape IDs
const SHAPE_IDS = Object.keys(SHAPES);

// Function to get a random shape
function getRandomShape() {
  return SHAPE_IDS[Math.floor(Math.random() * SHAPE_IDS.length)];
}

// Function to get shape by ID
function getShapeById(id) {
  return SHAPES[id];
}
