<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

	const PIECES_DATA = {
		1: {  name: 'Le Grand Triangle',color: '#A9BCC4',story: 'Cette pièce représente la majestuosité de la pyramide de Khéops...',artwork: 'Pyramide de Khéops - Égypte Antique',points: '15,15 150,150 285,15' /* Large right triangle*/},
		2: {	name: 'Le Triangle Moyen',	color: '#FFF35C',	story: 'Inspiré des voiles des navires vénitiens...',	artwork: 'Les Marchands de Venise - Canaletto',	points: '15,15 150,150 15,285' /* Large left triangle */ },
    3: { 	name: 'Le Petit Triangle', 	color: '#2B3B6D', 	story: 'Cette petite forme géométrique fait écho...', 	artwork: "Livre d'Heures - Art Médiéval", 	points: '150,150 217,217 217,83' /* Small triangle (top right) */ },
    4: { 	name: 'Le Carré', 	color: '#7AC142', 	story: "Le carré parfait représente l'équilibre...", 	artwork: 'Le Parthénon - Grèce Antique', 	points: '150,150 217,217 150,285 83,217' /* Square in center */ },
    5: { 	name: 'Le Parallélogramme', 	color: '#6B8FD6', 	story: 'Cette oeuvre fait partie de la série...', 	artwork: 'MC Mitout. Les plus belles heures...', 	points: '217,83 217,217 285,150 285,15' /* Parallelogram (right) */ },
    6: { 	name: 'Le Grand Trapèze', 	color: '#3B5D3A', 	story: 'Inspiré des toitures des pagodes japonaises...', 	artwork: 'Temple Kinkaku-ji - Architecture Japonaise', 	points: '15,285 150,285 83,217' /* Small triangle (bottom left) */ },
    7: { 	name: 'Le Petit Trapèze', 	color: '#8B83D2', 	story: 'Cette dernière pièce représente les rayons...', 	artwork: 'Impression, soleil levant - Claude Monet', 	points: '150,285 285,150 285,285' /* Triangle (bottom right) */ }
	};

  const birdPuzzle = [
  {
    "id": 1,
    "x": 142,
    "y": 282,
    "rotation": 315,
    "flipped": true
  },
  {
    "id": 2,
    "x": 334,
    "y": 90,
    "rotation": 45,
    "flipped": false
  },
  {
    "id": 3,
    "x": 90,
    "y": 70,
    "rotation": 270,
    "flipped": false
  },
  {
    "id": 4,
    "x": 157,
    "y": 104,
    "rotation": 0,
    "flipped": false
  },
  {
    "id": 5,
    "x": 237,
    "y": 234,
    "rotation": 135,
    "flipped": false
  },
  {
    "id": 6,
    "x": 261,
    "y": 162,
    "rotation": 45,
    "flipped": false
  },
  {
    "id": 7,
    "x": 352,
    "y": 300,
    "rotation": 90,
    "flipped": true
  }
]

const planePuzzle = [
  {
    "x": 675,
    "y": 421,
    "id": 1,
    "rotation": 180,
    "flipped": false
  },
  {
    "x": 947,
    "y": 421,
    "id": 2,
    "rotation": 270,
    "flipped": false
  },
  {
    "x": 777,
    "y": 422,
    "id": 3,
    "rotation": 0,
    "flipped": false
  },
  {
    "x": 813,
    "y": 537,
    "id": 4,
    "rotation": 45,
    "flipped": false
  },
  {
    "x": 845,
    "y": 388,
    "id": 5,
    "rotation": 0,
    "flipped": false
  },
  {
    "x": 836,
    "y": 608,
    "id": 6,
    "rotation": 45,
    "flipped": false
  },
  {
    "x": 878,
    "y": 286,
    "id": 7,
    "rotation": 180,
    "flipped": false
  }
]


 let pickupSound, dropSound;
  let audioUnlocked = false;
  let audioContext;

  if (browser) {
    pickupSound = new Audio('/snd/tap_01.mp3');
    dropSound = new Audio('/snd/tap_04.mp3');
  }

 function unlockAudio() {
    if (audioUnlocked) return;

    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    audioUnlocked = true;
  }

  function playSound(audio) {
    audio.currentTime = 0;
    audio.play();
  }

function calculateViewBox(pointsStr) {
  const points = pointsStr.split(' ').map(p => p.split(',').map(Number));
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);

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

const PIECES_DATA_WITH_VIEWBOX = Object.fromEntries(
  Object.entries(PIECES_DATA).map(([id, piece]) => {
    return [id, { ...piece, ...calculateViewBox(piece.points) }];
  })
);

// --- AUTO-FIT STATE ---
let pieces = planePuzzle.map(p => ({ ...p, origX: p.x, origY: p.y }));
let containerSize = { width: 0, height: 0 };
let puzzleScale = 1;
let puzzleContainer;

function getTransformedPoints(piece, pieceData) {
  const originX = 150, originY = 150;
  const angle = piece.rotation * (Math.PI / 180);
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const scaleX = piece.flipped ? -1 : 1;
  const basePoints = pieceData.points.split(' ').map(p => p.split(',').map(Number));
  return basePoints.map(([px, py]) => {
    let x = px - originX, y = py - originY;
    x *= scaleX;
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    return { x: rx + piece.x, y: ry + piece.y };
  });
}

function fitPuzzle() {
  if (!containerSize.width || pieces.length === 0) return;
  const gutter = 0;
  const allPts = pieces.flatMap(p =>
    getTransformedPoints({ ...p, x: p.origX, y: p.origY }, PIECES_DATA_WITH_VIEWBOX[p.id])
  );
  if (!allPts.length) return;
  const xs = allPts.map(pt => pt.x), ys = allPts.map(pt => pt.y);
  const bounds = {
    minX: Math.min(...xs), minY: Math.min(...ys),
    maxX: Math.max(...xs), maxY: Math.max(...ys)
  };
  const puzzleWidth = bounds.maxX - bounds.minX;
  const availableWidth = containerSize.width - gutter * 2;
  puzzleScale = availableWidth / puzzleWidth;
  for (const piece of pieces) {
    piece.x = Math.round((piece.origX - bounds.minX) * puzzleScale + gutter);
    piece.y = Math.round((piece.origY - bounds.minY) * puzzleScale + gutter);
  }
}

function observeResize(node) {
  const observer = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;
    containerSize.width = width;
    containerSize.height = height;
    fitPuzzle();
  });
  observer.observe(node);
  return { destroy() { observer.unobserve(node); } };
}

onMount(() => {
  fitPuzzle();
});
</script>

<style>
  .puzzle-canvas {
    position: relative;
    width: 100vw;
    height: 100vh;
    border: 1px solid #ccc;
  }

  .tangram-piece {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--w);
    height: var(--h);
    transform: translate(
      calc(var(--x) * 1px - 50%),
      calc(var(--y) * 1px - 50%)
    )
    rotate(var(--rotation))
    scaleX(var(--scaleX));
    transition: transform 0.2s;
    pointer-events: none;
    will-change: transform;
  }

  .tangram-piece-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }
</style>

<div class="puzzle-canvas" bind:this={puzzleContainer} use:observeResize>
  {#each pieces as piece}
    {@const pieceData = PIECES_DATA_WITH_VIEWBOX[piece.id]}
    <div
      class="tangram-piece"
      style="
        --x: {piece.x};
        --y: {piece.y};
        --w: {pieceData.width * puzzleScale}px;
        --h: {pieceData.height * puzzleScale}px;
        --rotation: {piece.rotation}deg;
        --scaleX: {piece.flipped ? -1 : 1};
      "
    >
      <svg class="tangram-piece-svg" viewBox={pieceData.viewBox}>
        <polygon points={pieceData.points} fill={pieceData.color} />
      </svg>
    </div>
  {/each}
</div>
