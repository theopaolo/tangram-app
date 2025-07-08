<script>
  import { browser } from '$app/environment';

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
    "id": 1,
    "x": 675,
    "y": 421,
    "rotation": 180,
    "flipped": false
  },
  {
    "id": 2,
    "x": 947,
    "y": 421,
    "rotation": 270,
    "flipped": false
  },
  {
    "id": 3,
    "x": 777,
    "y": 422,
    "rotation": 0,
    "flipped": false
  },
  {
    "id": 4,
    "x": 813,
    "y": 537,
    "rotation": 45,
    "flipped": false
  },
  {
    "id": 5,
    "x": 845,
    "y": 388,
    "rotation": 0,
    "flipped": false
  },
  {
    "id": 6,
    "x": 836,
    "y": 608,
    "rotation": 45,
    "flipped": false
  },
  {
    "id": 7,
    "x": 878,
    "y": 286,
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
</script>

<style>
  .puzzle-canvas {
    position: relative;
    width: 400px;
    height: 400px;
    border: 1px solid #ccc;
    margin: 2rem; /* Added margin for better visibility */
  }

  /* ✨ FIX: We apply positioning directly to the SVG */
  .tangram-piece-svg {
    /* Use top/left to set the anchor point */
    position: absolute;
    top: var(--y);
    left: var(--x);

    /* Center the piece on its anchor, then rotate/flip */
    transform-origin: 50% 50%;
    transform:
      translate(-50%, -50%) /* This centers the piece on the (x,y) coordinate */
      rotate(var(--rotation))
      scaleX(var(--scaleX));
    transition: transform 0.3s ease;
  }
</style>

<div class="puzzle-canvas">
  {#each planePuzzle as pieceTransform}
    {@const pieceData = PIECES_DATA_WITH_VIEWBOX[pieceTransform.id]}

    <svg
      class="tangram-piece-svg"
      viewBox={pieceData.viewBox}
      width={pieceData.width}
      height={pieceData.height}
      style="
        --x: {pieceTransform.x}px;
        --y: {pieceTransform.y}px;
        --rotation: {pieceTransform.rotation}deg;
        --scaleX: {pieceTransform.flipped ? -1 : 1};
      "
    >
      <polygon points={pieceData.points} fill={pieceData.color} />
    </svg>
  {/each}
</div>
