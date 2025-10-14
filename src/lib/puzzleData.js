// Shared puzzle data and piece definitions

import { PIECES_DATA as PIECES_DATA_SOURCE } from './piecesData.js';

// Unit-based coordinate system for perfect alignment
const UNIT = 27;       // 270px / 10 units
const OFFSET = 15;     // margin
const U = (n) => OFFSET + UNIT * n;
const P = (pts) => pts.map(([x,y]) => `${U(x)},${U(y)}`).join(' ');

// Color for pieces that are not found or not completed
export const PIECE_GREY_COLOR = '#e7e7e7';

export const PIECES_DATA = {
  1: {
    name: 'Le Grand Triangle',
    color: PIECES_DATA_SOURCE[3].color,
    story: PIECES_DATA_SOURCE[3].story,
    artwork: PIECES_DATA_SOURCE[3].titre_artwork,
    points: P([[0,0],[5,5],[10,0]])
  },
  2: {
    name: 'Le Second Grand Triangle',
    color: PIECES_DATA_SOURCE[5].color,
    story: PIECES_DATA_SOURCE[5].story,
    artwork: PIECES_DATA_SOURCE[5].titre_artwork,
    points: P([[0,0],[5,5],[0,10]])
  },
  3: {
    name: 'Le Petit Triangle',
    color: PIECES_DATA_SOURCE[4].color,
    story: PIECES_DATA_SOURCE[4].story,
    artwork: PIECES_DATA_SOURCE[4].titre_artwork,
    points: P([[5,5],[7.5,7.5],[7.5,2.5]])
  },
  4: {
    name: 'Le Carré',
    color: PIECES_DATA_SOURCE[6].color,
    story: PIECES_DATA_SOURCE[6].story,
    artwork: PIECES_DATA_SOURCE[6 ].titre_artwork,
    points: P([[5,5],[7.5,7.5],[5,10],[2.5,7.5]])
  },
  5: {
    name: 'Le Parallélogramme',
    color: PIECES_DATA_SOURCE[1].color,
    story: PIECES_DATA_SOURCE[1].story,
    artwork: PIECES_DATA_SOURCE[1].titre_artwork,
    points: P([[7.5,2.5],[7.5,7.5],[10,5],[10,0]])
  },
  6: {
    name: 'Le 2e Petit Triangle',
    color: PIECES_DATA_SOURCE[2].color,
    story: PIECES_DATA_SOURCE[2].story,
    artwork: PIECES_DATA_SOURCE[2].titre_artwork,
    points: P([[0,10],[5,10],[2.5,7.5]])
  },
  7: {
    name: 'Le Moyen Triangle',
    color: PIECES_DATA_SOURCE[7].color,
    story: PIECES_DATA_SOURCE[7].story,
    artwork: PIECES_DATA_SOURCE[7].titre_artwork, points: P([[5,10],[10,5],[10,10]])
  }
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

export const puzzleConfigs = [
  {
    id: 1,
    name: "La pomme",
    description: "Une pomme coupée en deux",
    completed: false,
    container: {
        width: 400,
        height: 600
      },
      pieces: [
        {
          "id": 1,
          "rotation": 90,
          "flipped": false,
          "x": 131,
          "y": 392
        },
        {
          "id": 2,
          "rotation": 0,
          "flipped": false,
          "x": 266,
          "y": 392
        },
        {
          "id": 3,
          "rotation": 180,
          "flipped": false,
          "x": 97,
          "y": 326
        },
        {
          "id": 4,
          "rotation": 0,
          "flipped": false,
          "x": 131,
          "y": 259
        },
        {
          "id": 5,
          "rotation": 0,
          "flipped": false,
          "x": 231,
          "y": 142
        },
        {
          "id": 6,
          "rotation": 0,
          "flipped": false,
          "x": 266,
          "y": 224
        },
        {
          "id": 7,
          "rotation": 270,
          "flipped": false,
          "x": 266,
          "y": 325
        }
      ],
    },
  {
    id: 2,
    name: "Le Cygne",
    description: "Un cygne élégant",
    completed: false,
    scale: 0.75,
    container: {
        width: 400,
        height: 600
      },
      pieces: [
        {
          "id": 1,
          "rotation": 180,
          "flipped": false,
          "x": 267,
          "y": 395
        },
        {
          "id": 2,
          "rotation": 90,
          "flipped": false,
          "x": 132,
          "y": 395
        },
        {
          "id": 3,
          "rotation": 315,
          "flipped": false,
          "x": 265,
          "y": 535
        },
        {
          "id": 4,
          "rotation": 45,
          "flipped": false,
          "x": 140,
          "y": 185
        },
        {
          "id": 5,
          "rotation": 45,
          "flipped": false,
          "x": 93,
          "y": 280
        },
        {
          "id": 6,
          "rotation": 135,
          "flipped": false,
          "x": 110,
          "y": 534
        },
        {
          "id": 7,
          "rotation": 225,
          "flipped": false,
          "x": 93,
          "y": 138
        }
      ]
  },
  {
    id: 3,
    name: "Nouveau Puzzle",
    description: "Un nouveau puzzle créatif",
    completed: false,
    container: {
        width: 400,
        height: 600
      },
      pieces: [
        {
          "id": 1,
          "rotation": 225,
          "flipped": false,
          "x": 346,
          "y": 227
        },
        {
          "id": 2,
          "rotation": 225,
          "flipped": false,
          "x": 61,
          "y": 227
        },
        {
          "id": 3,
          "rotation": 315,
          "flipped": false,
          "x": 321,
          "y": 440
        },
        {
          "id": 4,
          "rotation": 45,
          "flipped": false,
          "x": 60,
          "y": 418
        },
        {
          "id": 5,
          "rotation": 135,
          "flipped": false,
          "x": 345,
          "y": 369
        },
        {
          "id": 6,
          "rotation": 135,
          "flipped": false,
          "x": 84,
          "y": 347
        },
        {
          "id": 7,
          "rotation": 225,
          "flipped": false,
          "x": 203,
          "y": 275
        }
      ]
  },
  {
    id: 4,
    name: "Nouveau Puzzle 2",
    description: "Un autre nouveau puzzle créatif",
    completed: false,
    container: {
    "width": 400,
    "height": 600
  },
  pieces: [
    {
      "id": 1,
      "rotation": 225,
      "flipped": false,
      "x": 295,
      "y": 324
    },
    {
      "id": 2,
      "rotation": 135,
      "flipped": false,
      "x": 200,
      "y": 419
    },
    {
      "id": 3,
      "rotation": 135,
      "flipped": false,
      "x": 129,
      "y": 300
    },
    {
      "id": 4,
      "rotation": 45,
      "flipped": false,
      "x": 105,
      "y": 419
    },
    {
      "id": 5,
      "rotation": 45,
      "flipped": false,
      "x": 153,
      "y": 229
    },
    {
      "id": 6,
      "rotation": 225,
      "flipped": false,
      "x": 82,
      "y": 347
    },
    {
      "id": 7,
      "rotation": 225,
      "flipped": false,
      "x": 249,
      "y": 276
    }
  ]
  },
  {
    id: 5,
    name: "Nouveau Puzzle 3",
    description: "Un troisième nouveau puzzle créatif",
    completed: false,
    scale: 0.75,
    container: {
        width: 400,
        height: 600
      },
      pieces: [
        {
          "id": 1,
          "rotation": 180,
          "flipped": false,
          "x": 334,
          "y": 354
        },
        {
          "id": 2,
          "rotation": 270,
          "flipped": false,
          "x": 65,
          "y": 354
        },
        {
          "id": 3,
          "rotation": 180,
          "flipped": false,
          "x": 300,
          "y": 287
        },
        {
          "id": 4,
          "rotation": 0,
          "flipped": false,
          "x": 200,
          "y": 220
        },
        {
          "id": 5,
          "rotation": 0,
          "flipped": false,
          "x": 233,
          "y": 321
        },
        {
          "id": 6,
          "rotation": 0,
          "flipped": false,
          "x": 132,
          "y": 253
        },
        {
          "id": 7,
          "rotation": 270,
          "flipped": false,
          "x": 132,
          "y": 354
        }
      ]
  },
  {
    id: 6,
    name: "Nouveau Puzzle 4",
    description: "Un quatrième nouveau puzzle créatif",
    completed: false,
    container: {
      width: 400,
      height: 600
    },
    pieces: [
    {
      "id": 1,
      "rotation": 180,
      "flipped": false,
      "x": 202,
      "y": 474
    },
    {
      "id": 2,
      "rotation": 180,
      "flipped": false,
      "x": 202,
      "y": 340
    },
    {
      "id": 3,
      "rotation": 270,
      "flipped": false,
      "x": 269,
      "y": 173
    },
    {
      "id": 4,
      "rotation": 45,
      "flipped": false,
      "x": 201,
      "y": 92
    },
    {
      "id": 5,
      "rotation": 90,
      "flipped": false,
      "x": 169,
      "y": 173
    },
    {
      "id": 6,
      "rotation": 90,
      "flipped": false,
      "x": 168,
      "y": 407
    },
    {
      "id": 7,
      "rotation": 180,
      "flipped": false,
      "x": 202,
      "y": 274
    }
  ]
  },
  {
    id: 7,
    name: "Nouveau Puzzle 5",
    description: "Un cinquième nouveau puzzle créatif",
    completed: false,
    container: {
        width: 400,
        height: 600
      },
      pieces: [
        {
          "id": 1,
          "rotation": 45,
          "flipped": false,
          "x": 248,
          "y": 362
        },
        {
          "id": 2,
          "rotation": 45,
          "flipped": false,
          "x": 153,
          "y": 362
        },
        {
          "id": 3,
          "rotation": 315,
          "flipped": false,
          "x": 319,
          "y": 292
        },
        {
          "id": 4,
          "rotation": 45,
          "flipped": false,
          "x": 200,
          "y": 457
        },
        {
          "id": 5,
          "rotation": 45,
          "flipped": false,
          "x": 105,
          "y": 267
        },
        {
          "id": 6,
          "rotation": 45,
          "flipped": false,
          "x": 272,
          "y": 243
        },
        {
          "id": 7,
          "rotation": 225,
          "flipped": false,
          "x": 200,
          "y": 220
        }
      ]
    },
];

export function getPuzzleById(id) {
  return puzzleConfigs.find(puzzle => puzzle.id === parseInt(id));
}

export function getAllPuzzles() {
  return puzzleConfigs;
}