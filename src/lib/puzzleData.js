// Shared puzzle data and piece definitions

import { PIECES_DATA as PIECES_DATA_SOURCE } from './piecesData.js';

// Unit-based coordinate system for perfect alignment
const UNIT = 27;       // 270px / 10 units
const OFFSET = 15;     // margin
const U = (n) => OFFSET + UNIT * n;
const P = (pts) => pts.map(([x,y]) => `${U(x)},${U(y)}`).join(' ');

// Color for pieces that are not found or not completed
export const PIECE_GREY_COLOR = '#000';

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
    name: "Le Cygne",
    description: "Un cygne élégant",
    completed: false,
    data: [
      {  "x": 190.9009433962264,  "y": 482.91981132075466,  "id": 1,  "rotation": 180,  "flipped": false},
      {  "x": 56.26886792452828,  "y": 482.91981132075466,  "id": 2,  "rotation": 90,  "flipped": false},
      {  "x": 257.26886792452825,  "y": 380.52358490566036,  "id": 3,  "rotation": 90,  "flipped": false},
      {  "x": 192.7971698113207,  "y": 346.39150943396226,  "id": 4,  "rotation": 0,  "flipped": false},
      {  "x": 156.76886792452828,  "y": 245.89150943396226,  "id": 5,  "rotation": 0,  "flipped": false},
      {  "x": 215.55188679245282,  "y": 217.44811320754712,  "id": 6,  "rotation": 225,  "flipped": false},
      {  "x": 257.26886792452825,  "y": 482.91981132075466,  "id": 7,  "rotation": 270,  "flipped": false}
    ]
  },
  {
    id: 3,
    name: "Nouveau Puzzle",
    description: "Un nouveau puzzle créatif",
    completed: false,
    data: [
      {
        "id": 1,
        "rotation": 135,
        "flipped": false,
        "x": 19.74455040871935,
        "y": 34.805858310626704
      },
      {
        "id": 2,
        "rotation": 315,
        "flipped": false,
        "x": 305.9094005449591,
        "y": 34.805858310626704
      },
      {
        "id": 3,
        "rotation": 225,
        "flipped": false,
        "x": 43.02111716621252,
        "y": 153.92711171662125
      },
      {
        "id": 4,
        "rotation": 45,
        "flipped": false,
        "x": 19.74455040871935,
        "y": 225.12602179836512
      },
      {
        "id": 5,
        "rotation": 315,
        "flipped": false,
        "x": 305.9094005449591,
        "y": 178.57288828337875
      },
      {
        "id": 6,
        "rotation": 225,
        "flipped": false,
        "x": 281.2636239782016,
        "y": 251.1410081743869
      },
      {
        "id": 7,
        "rotation": 225,
        "flipped": false,
        "x": 163.5115803814714,
        "y": 84.09741144414167
      }
    ]
  },
  {
    id: 4,
    name: "Nouveau Puzzle 2",
    description: "Un autre nouveau puzzle créatif",
    completed: false,
    data: [
      {
        "id": 1,
        "rotation": 135,
        "flipped": false,
        "x": 151.18869209809264,
        "y": 349.7241144414169
      },
      {
        "id": 2,
        "rotation": 45,
        "flipped": false,
        "x": 247.033378746594,
        "y": 444.8841961852861
      },
      {
        "id": 3,
        "rotation": 315,
        "flipped": false,
        "x": 32.752043596730246,
        "y": 374.36989100817436
      },
      {
        "id": 4,
        "rotation": 45,
        "flipped": false,
        "x": 56.02861035422342,
        "y": 444.8841961852861
      },
      {
        "id": 5,
        "rotation": 45,
        "flipped": false,
        "x": 103.26634877384194,
        "y": 253.87942779291552
      },
      {
        "id": 6,
        "rotation": 45,
        "flipped": false,
        "x": 79.98978201634876,
        "y": 326.4475476839237
      },
      {
        "id": 7,
        "rotation": 225,
        "flipped": false,
        "x": 197.74182561307902,
        "y": 301.8017711171662
      }
    ]
  },
  {
    id: 5,
    name: "Nouveau Puzzle 3",
    description: "Un troisième nouveau puzzle créatif",
    completed: false,
    data: [
      {
        "id": 1,
        "rotation": 180,
        "flipped": false,
        "x": 319.81466227347613,
        "y": 374.4522240527183
      },
      {
        "id": 2,
        "rotation": 270,
        "flipped": false,
        "x": 49.93822075782538,
        "y": 374.4522240527183
      },
      {
        "id": 3,
        "rotation": 180,
        "flipped": false,
        "x": 285.8731466227348,
        "y": 307.39703459637565
      },
      {
        "id": 4,
        "rotation": 0,
        "flipped": false,
        "x": 184.87644151565075,
        "y": 238.6861614497529
      },
      {
        "id": 5,
        "rotation": 0,
        "flipped": false,
        "x": 219.64579901153212,
        "y": 339.6828665568369
      },
      {
        "id": 6,
        "rotation": 0,
        "flipped": false,
        "x": 117.82125205930808,
        "y": 272.6276771004942
      },
      {
        "id": 7,
        "rotation": 270,
        "flipped": false,
        "x": 117.82125205930808,
        "y": 374.4522240527183
      }
    ]
  },
  {
    id: 6,
    name: "Nouveau Puzzle 4",
    description: "Un quatrième nouveau puzzle créatif",
    completed: false,
    data: [
      {
        "id": 1,
        "rotation": 90,
        "flipped": false,
        "x": 150.9349258649094,
        "y": 272.6276771004942
      },
      {
        "id": 2,
        "rotation": 270,
        "flipped": false,
        "x": 150.9349258649094,
        "y": 407.5658978583196
      },
      {
        "id": 3,
        "rotation": 180,
        "flipped": false,
        "x": 117.82125205930808,
        "y": 339.6828665568369
      },
      {
        "id": 4,
        "rotation": 45,
        "flipped": false,
        "x": 155.9019769357496,
        "y": 24.275123558484353
      },
      {
        "id": 5,
        "rotation": 270,
        "flipped": false,
        "x": 114.50988467874794,
        "y": 104.57578253706754
      },
      {
        "id": 6,
        "rotation": 180,
        "flipped": false,
        "x": 217.16227347611203,
        "y": 105.4036243822076
      },
      {
        "id": 7,
        "rotation": 180,
        "flipped": false,
        "x": 149.27924217462933,
        "y": 207.22817133443164
      }
    ]
  },
  {
    id: 7,
    name: "Nouveau Puzzle 5",
    description: "Un cinquième nouveau puzzle créatif",
    completed: false,
    data: [
      {
        "id": 1,
        "rotation": 45,
        "flipped": false,
        "x": 222.9571663920923,
        "y": 440.6795716639209
      },
      {
        "id": 2,
        "rotation": 45,
        "flipped": false,
        "x": 127.75535420098848,
        "y": 440.6795716639209
      },
      {
        "id": 3,
        "rotation": 315,
        "flipped": false,
        "x": 294.9794069192751,
        "y": 370.31301482701815
      },
      {
        "id": 4,
        "rotation": 45,
        "flipped": false,
        "x": 172.45881383855027,
        "y": 535.0535420098847
      },
      {
        "id": 5,
        "rotation": 225,
        "flipped": false,
        "x": 78.08484349258649,
        "y": 346.30560131795716
      },
      {
        "id": 6,
        "rotation": 45,
        "flipped": false,
        "x": 247.79242174629326,
        "y": 322.2981878088962
      },
      {
        "id": 7,
        "rotation": 225,
        "flipped": false,
        "x": 175.77018121911038,
        "y": 298.2907742998353
      }
    ]
  }
];

export function getPuzzleById(id) {
  return puzzleConfigs.find(puzzle => puzzle.id === parseInt(id));
}

export function getAllPuzzles() {
  return puzzleConfigs;
}