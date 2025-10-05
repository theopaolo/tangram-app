// Shared puzzle data and piece definitions

import { PIECES_DATA as PIECES_DATA_SOURCE } from './piecesData.js';

// Unit-based coordinate system for perfect alignment
const UNIT = 27;       // 270px / 10 units
const OFFSET = 15;     // margin
const U = (n) => OFFSET + UNIT * n;
const P = (pts) => pts.map(([x,y]) => `${U(x)},${U(y)}`).join(' ');

export const PIECES_DATA = {
  1: { name: 'Le Grand Triangle', color: PIECES_DATA_SOURCE[1].color, story: PIECES_DATA_SOURCE[1].story, artwork: PIECES_DATA_SOURCE[1].titre_artwork, points: P([[0,0],[5,5],[10,0]]) },
  2: { name: 'Le Second Grand Triangle', color: PIECES_DATA_SOURCE[2].color, story: PIECES_DATA_SOURCE[2].story, artwork: PIECES_DATA_SOURCE[2].titre_artwork, points: P([[0,0],[5,5],[0,10]]) },
  3: { name: 'Le Petit Triangle', color: PIECES_DATA_SOURCE[3].color, story: PIECES_DATA_SOURCE[3].story, artwork: PIECES_DATA_SOURCE[3].titre_artwork, points: P([[5,5],[7.5,7.5],[7.5,2.5]]) },
  4: { name: 'Le Carré', color: PIECES_DATA_SOURCE[4].color, story: PIECES_DATA_SOURCE[4].story, artwork: PIECES_DATA_SOURCE[4].titre_artwork, points: P([[5,5],[7.5,7.5],[5,10],[2.5,7.5]]) },
  5: { name: 'Le Parallélogramme', color: PIECES_DATA_SOURCE[5].color, story: PIECES_DATA_SOURCE[5].story, artwork: PIECES_DATA_SOURCE[5].titre_artwork, points: P([[7.5,2.5],[7.5,7.5],[10,5],[10,0]]) },
  6: { name: 'Le Grand Trapèze', color: PIECES_DATA_SOURCE[6].color, story: PIECES_DATA_SOURCE[6].story, artwork: PIECES_DATA_SOURCE[6].titre_artwork, points: P([[0,10],[5,10],[2.5,7.5]]) },
  7: { name: 'Le Petit Trapèze', color: PIECES_DATA_SOURCE[7].color, story: PIECES_DATA_SOURCE[7].story, artwork: PIECES_DATA_SOURCE[7].titre_artwork, points: P([[5,10],[10,5],[10,10]]) }
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
