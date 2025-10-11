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

// Different puzzle configurations
export const puzzleConfigs = [
  {
    id: 1,
    name: "Le Phare",
    description: "Un phare veillant sur les marins",
    completed: false,
    data: [
      {"id":1,"rotation":90,"flipped":false,"x":98.81382102505265,"y":326.8628532641676},
      {"id":2,"rotation":0,"flipped":false,"x":233.24171561083452,"y":328.2138873806076},
      {"id":3,"rotation":90,"flipped":false,"x":231.8906814943945,"y":160.0101398838253},
      {"id":4,"rotation":0,"flipped":false,"x":98.13830396683264,"y":193.11047573660576},
      {"id":5,"rotation":0,"flipped":false,"x":200.14137975805406,"y":68.13981996590402},
      {"id":6,"rotation":90,"flipped":false,"x":65.03796811405218,"y":259.9866645003867},
      {"id":7,"rotation":270,"flipped":false,"x":231.8906814943945,"y":260.6621815586067}
    ]
  },
  {
    id: 2,
    name: "Le Cygne",
    description: "Un cygne élégant",
    completed: false,
    data: [
      {
        "id": 1,
        "rotation": 180,
        "flipped": false,
        "x": 443,
        "y": 507
      },
      {
        "id": 2,
        "rotation": 90,
        "flipped": false,
        "x": 309,
        "y": 507
      },
      {
        "id": 3,
        "rotation": 315,
        "flipped": false,
        "x": 443,
        "y": 646
      },
      {
        "id": 4,
        "rotation": 45,
        "flipped": false,
        "x": 319,
        "y": 298
      },
      {
        "id": 5,
        "rotation": 45,
        "flipped": false,
        "x": 271,
        "y": 393
      },
      {
        "id": 6,
        "rotation": 135,
        "flipped": false,
        "x": 286,
        "y": 646
      },
      {
        "id": 7,
        "rotation": 225,
        "flipped": false,
        "x": 272,
        "y": 251
      }
    ]
  },
  {
    id: 3,
    name: "Nouveau Puzzle",
    description: "Un nouveau puzzle créatif",
    completed: false,
    data: [
      {"id":1,"rotation":135,"flipped":false,"x":24.068061856121787,"y":120.01478823636174},
      {"id":2,"rotation":315,"flipped":false,"x":308.9044117457954,"y":120.01478823636174},
      {"id":3,"rotation":315,"flipped":false,"x":285.1680492549893,"y":334.34017896217006},
      {"id":4,"rotation":45,"flipped":false,"x":24.068061856121787,"y":310.603816471364},
      {"id":5,"rotation":315,"flipped":false,"x":308.9044117457954,"y":263.1310914897517},
      {"id":6,"rotation":135,"flipped":false,"x":47.80442434692793,"y":239.39472899894557},
      {"id":7,"rotation":225,"flipped":false,"x":166.48623680095864,"y":168.18564152652712}
    ]
  },
  {
    id: 4,
    name: "Nouveau Puzzle 2",
    description: "Un autre nouveau puzzle créatif",
    completed: false,
    data: [
  { "id": 1, "rotation": 225, "flipped": false, "x": 228.48443268412476, "y": 303.5422206561335 },
  { "id": 2, "rotation": 135, "flipped": false, "x": 133.98186111674997, "y": 398.7396640732684 },
  { "id": 3, "rotation": 315, "flipped": false, "x": 16.548518507291675, "y": 327.8627353977373 },
  { "id": 4, "rotation": 45, "flipped": false, "x": 40.86903324889548, "y": 398.7396640732684 },
  { "id": 5, "rotation": 225, "flipped": false, "x": 87.42544718282272, "y": 209.03964908875878 },
  { "id": 6, "rotation": 45, "flipped": false, "x": 63.79980429097904, "y": 279.91657776428985 },
  { "id": 7, "rotation": 225, "flipped": false, "x": 181.23314690043733, "y": 256.29093487244614 }
]
  },
  {
    id: 5,
    name: "Nouveau Puzzle 3",
    description: "Un troisième nouveau puzzle créatif",
    completed: false,
    data: [
      {"id":1,"rotation":180,"flipped":false,"x":319.0124092379035,"y":374.6439685154677},
      {"id":2,"rotation":270,"flipped":false,"x":50.740473793398024,"y":373.8108258588078},
      {"id":3,"rotation":180,"flipped":false,"x":285.68670297150527,"y":307.15941332601136},
      {"id":4,"rotation":0,"flipped":false,"x":184.87644151565078,"y":239.67485813655503},
      {"id":5,"rotation":0,"flipped":false,"x":219.03529043870893,"y":339.65197693574964},
      {"id":6,"rotation":0,"flipped":false,"x":118.22502898285438,"y":273.0005644029532},
      {"id":7,"rotation":270,"flipped":false,"x":118.22502898285438,"y":373.8108258588078}
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
        "x": 225,
        "y": 445
      },
      {
        "id": 2,
        "rotation": 270,
        "flipped": false,
        "x": 224,
        "y": 578
      },
      {
        "id": 3,
        "rotation": 270,
        "flipped": false,
        "x": 293,
        "y": 278
      },
      {
        "id": 4,
        "rotation": 315,
        "flipped": false,
        "x": 224,
        "y": 197
      },
      {
        "id": 5,
        "rotation": 270,
        "flipped": false,
        "x": 192,
        "y": 277
      },
      {
        "id": 6,
        "rotation": 90,
        "flipped": false,
        "x": 192,
        "y": 511
      },
      {
        "id": 7,
        "rotation": 180,
        "flipped": false,
        "x": 226,
        "y": 378
      }
    ]
  },
  {
    id: 7,
    name: "Nouveau Puzzle 5",
    description: "Un cinquième nouveau puzzle créatif",
    completed: false,
    data: [
      {"id":1,"rotation":45,"flipped":false,"x":198.04825114759913,"y":441.05523716430497},
      {"id":2,"rotation":45,"flipped":false,"x":102.97677366818519,"y":441.05523716430497},
      {"id":3,"rotation":315,"flipped":false,"x":268.7991181090234,"y":369.56738200536586},
      {"id":4,"rotation":225,"flipped":false,"x":153.82895929670892,"y":536.126714643719},
      {"id":5,"rotation":225,"flipped":false,"x":55.80952902723564,"y":345.24677148737624},
      {"id":6,"rotation":45,"flipped":false,"x":221.63187346807385,"y":321.66314916690146},
      {"id":7,"rotation":225,"flipped":false,"x":150.88100650664956,"y":298.0795268464267}
    ]
  }
];

export function getPuzzleById(id) {
  return puzzleConfigs.find(puzzle => puzzle.id === parseInt(id));
}

export function getAllPuzzles() {
  return puzzleConfigs;
}