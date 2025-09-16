// Shared puzzle data and piece definitions

export const PIECES_DATA = {
  1: {  name: 'Le Grand Triangle',color: '#A9BCC4',story: 'Cette pièce représente la majestuosité de la pyramide de Khéops...',artwork: 'Pyramide de Khéops - Égypte Antique',points: '15,15 150,150 285,15' /* Large right triangle*/},
  2: {	name: 'Le Triangle Moyen',	color: '#FFF35C',	story: 'Inspiré des voiles des navires vénitiens...',	artwork: 'Les Marchands de Venise - Canaletto',	points: '15,15 150,150 15,285' /* Large left triangle */ },
  3: { 	name: 'Le Petit Triangle', 	color: '#2B3B6D', 	story: 'Cette petite forme géométrique fait écho...', 	artwork: "Livre d'Heures - Art Médiéval", 	points: '150,150 217,217 217,83' /* Small triangle (top right) */ },
  4: { 	name: 'Le Carré', 	color: '#7AC142', 	story: "Le carré parfait représente l'équilibre...", 	artwork: 'Le Parthénon - Grèce Antique', 	points: '150,150 217,217 150,285 83,217' /* Square in center */ },
  5: { 	name: 'Le Parallélogramme', 	color: '#6B8FD6', 	story: 'Cette oeuvre fait partie de la série...', 	artwork: 'MC Mitout. Les plus belles heures...', 	points: '217,83 217,217 285,150 285,15' /* Parallelogram (right) */ },
  6: { 	name: 'Le Grand Trapèze', 	color: '#3B5D3A', 	story: 'Inspiré des toitures des pagodes japonaises...', 	artwork: 'Temple Kinkaku-ji - Architecture Japonaise', 	points: '15,285 150,285 83,217' /* Small triangle (bottom left) */ },
  7: { 	name: 'Le Petit Trapèze', 	color: '#8B83D2', 	story: 'Cette dernière pièce représente les rayons...', 	artwork: 'Impression, soleil levant - Claude Monet', 	points: '150,285 285,150 285,285' /* Triangle (bottom right) */ }
};

// Calculate viewBox for each piece
function calculateViewBox(pointsStr) {
  const points = pointsStr.split(' ').map((p) => p.split(',').map(Number));
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  const width = maxX - minX;
  const height = maxY - minY;

  return {
    viewBox: `${minX} ${minY} ${width} ${height}`,
    width,
    height
  };
}

export const PIECES_DATA_WITH_VIEWBOX = Object.fromEntries(
  Object.entries(PIECES_DATA).map(([id, piece]) => {
    return [id, { ...piece, ...calculateViewBox(piece.points) }];
  })
);

// Different puzzle configurations
export const puzzleConfigs = [
  {
    id: 1,
    name: "Le Phare",
    description: "Un phare veillant sur les marins",
    completed: false,
    data: [
      {  "x": 675,  "y": 421,  "id": 1,  "rotation": 180},
      {  "x": 947,  "y": 421,  "id": 2,  "rotation": 270},
      {  "x": 777,  "y": 422,  "id": 3,  "rotation": 0},
      {  "x": 813,  "y": 537,  "id": 4,  "rotation": 45},
      {  "x": 845,  "y": 388,  "id": 5,  "rotation": 0},
      {  "x": 836,  "y": 608,  "id": 6,  "rotation": 45},
      {  "x": 878,  "y": 286,  "id": 7,  "rotation": 180}
    ]
  },
  {
    id: 2,
    name: "La Maison",
    description: "Une maison accueillante",
    completed: false,
    data: [
      {  "x": 650,  "y": 400,  "id": 1,  "rotation": 0},
      {  "x": 750,  "y": 400,  "id": 2,  "rotation": 90},
      {  "x": 700,  "y": 350,  "id": 3,  "rotation": 180},
      {  "x": 700,  "y": 450,  "id": 4,  "rotation": 0},
      {  "x": 650,  "y": 500,  "id": 5,  "rotation": 270},
      {  "x": 750,  "y": 500,  "id": 6,  "rotation": 180},
      {  "x": 700,  "y": 300,  "id": 7,  "rotation": 0}
    ]
  },
  {
    id: 3,
    name: "Le Bateau",
    description: "Un voilier sur les flots",
    completed: false,
    data: [
      {  "x": 600,  "y": 450,  "id": 1,  "rotation": 45},
      {  "x": 800,  "y": 450,  "id": 2,  "rotation": 135},
      {  "x": 700,  "y": 400,  "id": 3,  "rotation": 90},
      {  "x": 700,  "y": 500,  "id": 4,  "rotation": 270},
      {  "x": 650,  "y": 350,  "id": 5,  "rotation": 45},
      {  "x": 750,  "y": 350,  "id": 6,  "rotation": 315},
      {  "x": 700,  "y": 550,  "id": 7,  "rotation": 0}
    ]
  },
  {
    id: 4,
    name: "L'Oiseau",
    description: "Un oiseau en plein vol",
    completed: false,
    data: [
      {  "x": 650,  "y": 380,  "id": 1,  "rotation": 315},
      {  "x": 750,  "y": 380,  "id": 2,  "rotation": 45},
      {  "x": 700,  "y": 420,  "id": 3,  "rotation": 0},
      {  "x": 700,  "y": 340,  "id": 4,  "rotation": 180},
      {  "x": 620,  "y": 340,  "id": 5,  "rotation": 270},
      {  "x": 780,  "y": 340,  "id": 6,  "rotation": 90},
      {  "x": 700,  "y": 460,  "id": 7,  "rotation": 180}
    ]
  },
  {
    id: 5,
    name: "Le Chat",
    description: "Un chat curieux",
    completed: false,
    data: [
      {  "x": 680,  "y": 420,  "id": 1,  "rotation": 90},
      {  "x": 720,  "y": 420,  "id": 2,  "rotation": 180},
      {  "x": 700,  "y": 380,  "id": 3,  "rotation": 225},
      {  "x": 700,  "y": 460,  "id": 4,  "rotation": 45},
      {  "x": 660,  "y": 380,  "id": 5,  "rotation": 135},
      {  "x": 740,  "y": 380,  "id": 6,  "rotation": 315},
      {  "x": 700,  "y": 340,  "id": 7,  "rotation": 270}
    ]
  },
  {
    id: 6,
    name: "Le Lapin",
    description: "Un lapin bondissant",
    completed: false,
    data: [
      {  "x": 670,  "y": 400,  "id": 1,  "rotation": 225},
      {  "x": 730,  "y": 400,  "id": 2,  "rotation": 315},
      {  "x": 700,  "y": 360,  "id": 3,  "rotation": 90},
      {  "x": 700,  "y": 440,  "id": 4,  "rotation": 270},
      {  "x": 650,  "y": 360,  "id": 5,  "rotation": 180},
      {  "x": 750,  "y": 360,  "id": 6,  "rotation": 0},
      {  "x": 700,  "y": 480,  "id": 7,  "rotation": 90}
    ]
  },
  {
    id: 7,
    name: "L'Arbre",
    description: "Un arbre majestueux",
    completed: false,
    data: [
      {  "x": 700,  "y": 350,  "id": 1,  "rotation": 0},
      {  "x": 700,  "y": 450,  "id": 2,  "rotation": 180},
      {  "x": 660,  "y": 400,  "id": 3,  "rotation": 270},
      {  "x": 740,  "y": 400,  "id": 4,  "rotation": 90},
      {  "x": 680,  "y": 320,  "id": 5,  "rotation": 135},
      {  "x": 720,  "y": 320,  "id": 6,  "rotation": 45},
      {  "x": 700,  "y": 500,  "id": 7,  "rotation": 0}
    ]
  }
];

export function getPuzzleById(id) {
  return puzzleConfigs.find(puzzle => puzzle.id === parseInt(id));
}

export function getAllPuzzles() {
  return puzzleConfigs;
}