<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import createInteractionHandler from '../../lib/interaction.js';
  import {
    getTriangleSimilarityGroups,
    checkRotationMatch,
    areInterchangeable,
    debugLog,
    createDebugState,
    initializeDebugMode
  } from '../../lib/puzzleDebug.js';

  // Toggle debug mode - set to false for production
  const DEBUG_MODE = false;

	const PIECES_DATA = {
		1: {  name: 'Le Grand Triangle',color: '#A9BCC4',story: 'Cette pièce représente la majestuosité de la pyramide de Khéops...',artwork: 'Pyramide de Khéops - Égypte Antique',points: '15,15 150,150 285,15' /* Large right triangle*/},
		2: {	name: 'Le Triangle Moyen',	color: '#FFF35C',	story: 'Inspiré des voiles des navires vénitiens...',	artwork: 'Les Marchands de Venise - Canaletto',	points: '15,15 150,150 15,285' /* Large left triangle */ },
    3: { 	name: 'Le Petit Triangle', 	color: '#2B3B6D', 	story: 'Cette petite forme géométrique fait écho...', 	artwork: "Livre d'Heures - Art Médiéval", 	points: '150,150 217,217 217,83' /* Small triangle (top right) */ },
    4: { 	name: 'Le Carré', 	color: '#7AC142', 	story: "Le carré parfait représente l'équilibre...", 	artwork: 'Le Parthénon - Grèce Antique', 	points: '150,150 217,217 150,285 83,217' /* Square in center */ },
    5: { 	name: 'Le Parallélogramme', 	color: '#6B8FD6', 	story: 'Cette oeuvre fait partie de la série...', 	artwork: 'MC Mitout. Les plus belles heures...', 	points: '217,83 217,217 285,150 285,15' /* Parallelogram (right) */ },
    6: { 	name: 'Le Grand Trapèze', 	color: '#3B5D3A', 	story: 'Inspiré des toitures des pagodes japonaises...', 	artwork: 'Temple Kinkaku-ji - Architecture Japonaise', 	points: '15,285 150,285 83,217' /* Small triangle (bottom left) */ },
    7: { 	name: 'Le Petit Trapèze', 	color: '#8B83D2', 	story: 'Cette dernière pièce représente les rayons...', 	artwork: 'Impression, soleil levant - Claude Monet', 	points: '150,285 285,150 285,285' /* Triangle (bottom right) */ }
	};

  const planePuzzle = [
    {  "x": 675,  "y": 421,  "id": 1,  "rotation": 180},
    {  "x": 947,  "y": 421,  "id": 2,  "rotation": 270},
    {  "x": 777,  "y": 422,  "id": 3,  "rotation": 0},
    {  "x": 813,  "y": 537,  "id": 4,  "rotation": 45},
    {  "x": 845,  "y": 388,  "id": 5,  "rotation": 0},
    {  "x": 836,  "y": 608,  "id": 6,  "rotation": 45},
    {  "x": 878,  "y": 286,  "id": 7,  "rotation": 180}
  ];

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
    if (!audio) return;
    audio.currentTime = 0;
    // audio.play();
  }

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

  const PIECES_DATA_WITH_VIEWBOX = Object.fromEntries(
    Object.entries(PIECES_DATA).map(([id, piece]) => {
      return [id, { ...piece, ...calculateViewBox(piece.points) }];
    })
  );

  // --- DRAG AND DROP STATE ---
  let pieces = $state([]);
  let targetPieces = $state([]);
  let activePieceId = $state(null);
  let containerSize = $state({ width: 0, height: 0 });
  let puzzleScale = $state(1);
  let puzzleSolved = $state(false);
  let puzzleContainer,piecesContainer;

  // --- MAGNETIC EFFECT CONSTANTS ---
  const MAGNETIC_SNAP_DISTANCE = 100; // Distance in pixels to begin attraction
  const MAGNETIC_SMOOTHNESS = 0.2; // Lower = stronger attraction each frame
  const HARD_LOCK_DISTANCE = 28; // Inside this radius, piece locks to target and overrides grabbing
  const SNAP_ON_RELEASE_DISTANCE = 48; // On release, snap perfectly if within this distance
  let magneticTarget = $state(null); // Currently attracted target
  let isMagnetLocked = $state(false); // When true, piece stays fixed on target while dragging

  // Debug state
  let debugInfo = $state({
    tolerance: 0,
    piecesInContainer: [],
    matchResults: [],
    lastCheck: null,
    triangleGroups: []
  });

  // Derived state
  const activePiece = $derived(pieces.find(p => p.id === activePieceId));

  // Find the closest compatible target for magnetic attraction
  function findMagneticTarget(piece) {
    if (!piece || piece.inContainer) return null;

    let closestTarget = null;
    let minDistance = MAGNETIC_SNAP_DISTANCE;

    for (const target of targetPieces) {
      // Check if piece can go in this target (same ID or interchangeable)
      const canFitTarget = piece.id === target.id || areInterchangeable(piece.id, target.id, PIECES_DATA);
      if (!canFitTarget) continue;

      // Check rotation compatibility
      const rotationMatch = checkRotationMatch(piece.id, piece.rotation, target.id, target.rotation, planePuzzle, PIECES_DATA, false);
      if (!rotationMatch) continue;

      // Calculate distance
      const distance = Math.hypot(piece.x - target.screenX, piece.y - target.screenY);

      if (distance < minDistance) {
        minDistance = distance;
        closestTarget = target;
      }
    }

    return closestTarget;
  }

  function getTransformedPoints(piece, pieceData) {
    const originX = 150, originY = 150;
    const angle = piece.rotation * (Math.PI / 180);
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const scaleX = 1;
    const basePoints = pieceData.points.split(' ').map((p) => p.split(',').map(Number));
    return basePoints.map(([px, py]) => {
      let x = px - originX, y = py - originY;
      x *= scaleX;
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;
      return { x: rx + piece.x, y: ry + piece.y };
    });
  }

  // Store original and transformed bounds for positioning
  let originalBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  let fitScale = 1;

  // Initialize pieces in the container at the bottom
  function initializePieces() {
    pieces =
      Object.keys(PIECES_DATA)
      .map((id) => (
        {
          id: parseInt(id), x: 0, y: 0, rotation: 0, origX: 0, origY: 0, inContainer: true, animationKey: 0,
        }
      ));
  }

  function fitTargets() {
    if (!containerSize.width || planePuzzle.length === 0) return;

    const gutter = -1; // The padding around the puzzle

    // 1. Get ALL transformed vertices for the solved puzzle
    const allFinalVertices = planePuzzle.flatMap(pieceState =>
      getTransformedPoints(pieceState, PIECES_DATA_WITH_VIEWBOX[pieceState.id])
    );

    // 2. Calculate the TRUE bounding box from these vertices
    const xs = allFinalVertices.map(p => p.x);
    const ys = allFinalVertices.map(p => p.y);
    const bounds = {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };

    // 3. Calculate the scale factor using the correct dimensions
    const puzzleWidth = bounds.maxX - bounds.minX;
    const puzzleHeight = bounds.maxY - bounds.minY;
    const availableWidth = containerSize.width - gutter * 2;
    const availableHeight = containerSize.height - (gutter * 2 + 100); // Account for the pieces container at the bottom

    const scaleFactor = Math.min(availableWidth / puzzleWidth, availableHeight / puzzleHeight);
    puzzleScale = scaleFactor;

    // 4. Calculate final screen positions for each target
    const scaledPuzzleWidth = puzzleWidth * scaleFactor;
    const scaledPuzzleHeight = puzzleHeight * scaleFactor;
    const offsetX = (containerSize.width - scaledPuzzleWidth) / 2;
    const offsetY = (containerSize.height - 100 - scaledPuzzleHeight) / 2; // Center in the upper area

    targetPieces = planePuzzle.map(target => {
      const screenX = offsetX + (target.x - bounds.minX) * scaleFactor;
      const screenY = offsetY + (target.y - bounds.minY) * scaleFactor;
      return { ...target, screenX, screenY };
    });
  }

  function observeResize(node) {
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      containerSize.width = width;
      containerSize.height = height;
      fitTargets();
    });
    observer.observe(node);
    return { destroy() { observer.unobserve(node); } };
  }

  // --- INTERACTION FUNCTIONS ---
  function draggable(node, params) {
    let offsetX, offsetY;

    const handlePointerDown = createInteractionHandler({
      onDown: (e) => {
        activePieceId = params.pieceId;
        // playSound(pickupSound);
        unlockAudio();

        const piece = pieces.find(p => p.id === params.pieceId);
        if (!piece) return;

        const rect = puzzleContainer.getBoundingClientRect();

        if (piece.inContainer) {
          // Moving from container to puzzle area
          piece.inContainer = false;
          piece.x = e.clientX - rect.left;
          piece.y = e.clientY - rect.top;
        }

        // Calculate offset from pointer to piece center
        offsetX = e.clientX - (piece.x + rect.left);
        offsetY = e.clientY - (piece.y + rect.top);
      },
      onDrag: (e) => {
        const piece = pieces.find(p => p.id === params.pieceId);
        if (!piece) return;

        const rect = puzzleContainer.getBoundingClientRect();
        const newX = Math.round(e.clientX - rect.left - offsetX);
        const newY = Math.round(e.clientY - rect.top - offsetY);

        // Temporarily set position to check for magnetic targets
        piece.x = newX;
        piece.y = newY;

        // Check for magnetic attraction
        const target = findMagneticTarget(piece);
        magneticTarget = target;

        if (target) {
          const targetDistance = Math.hypot(newX - target.screenX, newY - target.screenY);

          // Inside hard-lock zone, override grabbing and stick to target center
          if (targetDistance <= HARD_LOCK_DISTANCE) {
            isMagnetLocked = true;
            piece.x = target.screenX;
            piece.y = target.screenY;
          } else {
            // Outside lock zone but within magnetic range, apply strong attraction
            isMagnetLocked = false;
            const attractionStrength = Math.max(0, 1 - targetDistance / MAGNETIC_SNAP_DISTANCE);
            piece.x = newX + (target.screenX - newX) * attractionStrength * (1 - MAGNETIC_SMOOTHNESS);
            piece.y = newY + (target.screenY - newY) * attractionStrength * (1 - MAGNETIC_SMOOTHNESS);
          }
        } else {
          // No target nearby → ensure lock is cleared
          isMagnetLocked = false;
        }

        pieces = pieces; // Trigger reactivity
      },
      onEnd: (e, wasTap, wasDrag) => {
        const piece = pieces.find(p => p.id === params.pieceId);
        if (!piece) return;

        if (wasTap) {
          // Rotate on tap
          piece.rotation = (piece.rotation + 45) % 360;
          piece.animationKey += 1;
        } else if (wasDrag) {
          // playSound(dropSound);

          // If near a valid target, snap perfectly into place and override rotation
          const target = findMagneticTarget(piece);
          if (target) {
            const dist = Math.hypot(piece.x - target.screenX, piece.y - target.screenY);
            if (isMagnetLocked || dist <= SNAP_ON_RELEASE_DISTANCE) {
              piece.inContainer = false;
              piece.x = target.screenX;
              piece.y = target.screenY;
              piece.rotation = target.rotation;
              piece.animationKey += 1;
            }
          }

          // Check if piece should return to container (only if not snapped)
          if (!target || !(isMagnetLocked || Math.hypot(piece.x - target.screenX, piece.y - target.screenY) <= SNAP_ON_RELEASE_DISTANCE)) {
            const piecesRect = piecesContainer.getBoundingClientRect();
            if (e.clientY > piecesRect.top - 50) {
              // Return to container
              piece.inContainer = true;
              piece.x = 0;
              piece.y = 0;
              piece.rotation = 0;
              piece.animationKey += 1;
            }
          }
        }

        // Clear magnetic target
        magneticTarget = null;
        isMagnetLocked = false;

        // Check puzzle solution
        checkPuzzleSolution();
        pieces = pieces; // Trigger reactivity
      }
    });

    node.addEventListener('pointerdown', handlePointerDown);
    return {
      destroy: () => node.removeEventListener('pointerdown', handlePointerDown)
    };
  }

    // Triangle similarity groups are now managed by debug utils

    function checkPuzzleSolution() {
    const tolerance = 25 * puzzleScale; // Scale the tolerance for precision

    if (DEBUG_MODE) {
      debugLog("🔍 Checking puzzle solution...");
      debugLog(`Tolerance: ${tolerance}, Scale: ${puzzleScale}`);
    }

    // Update debug info
    if (DEBUG_MODE) {
      debugInfo.tolerance = Math.round(tolerance);
      debugInfo.lastCheck = new Date().toLocaleTimeString();
    }

    // A piece is still in the container, so it can't be solved yet.
    const piecesInContainer = pieces.filter(p => p.inContainer);
    if (DEBUG_MODE) {
      debugInfo.piecesInContainer = piecesInContainer.map(p => p.id);
    }

    if (piecesInContainer.length > 0) {
              if (DEBUG_MODE) {
          debugLog(`❌ Pieces still in container: ${piecesInContainer.map(p => p.id).join(', ')}`);
          debugInfo.matchResults = [`❌ ${piecesInContainer.length} pieces still in container: ${piecesInContainer.map(p => p.id).join(', ')}`];
        }
      puzzleSolved = false;
      return;
    }

    if (DEBUG_MODE) {
      debugLog("✅ All pieces are out of container");
    }

    // Track which pieces have been matched to avoid double-matching
    const matchedPieceIds = new Set();
    const matchResults = [];

        // Check if every target piece has a corresponding placed piece that matches
    const allCorrect = targetPieces.every(target => {
      if (DEBUG_MODE) {
        debugLog(`\n🎯 Checking target ${target.id} at (${Math.round(target.screenX)}, ${Math.round(target.screenY)}) rotation: ${target.rotation}°`);
      }

      // Find a piece that can fill this target position (either exact match or interchangeable)
      const validPiece = pieces.find(piece => {
        // Skip if this piece is already matched
        if (matchedPieceIds.has(piece.id)) {
          if (DEBUG_MODE) {
            debugLog(`  ⏭️ Piece ${piece.id} already matched, skipping`);
          }
          return false;
        }

        // Check if piece can go in this target (same ID or interchangeable)
        const canFitTarget = piece.id === target.id || areInterchangeable(piece.id, target.id, PIECES_DATA);
        if (!canFitTarget) {
          if (DEBUG_MODE) {
            debugLog(`  ❌ Piece ${piece.id} cannot fit target ${target.id} (not compatible)`);
          }
          return false;
        }

        // Calculate the distance between the piece's center and the target's center
        const distance = Math.hypot(piece.x - target.screenX, piece.y - target.screenY);

        // Smart rotation matching
        const rotationMatch = checkRotationMatch(piece.id, piece.rotation, target.id, target.rotation, planePuzzle, PIECES_DATA, DEBUG_MODE);

        if (DEBUG_MODE) {
          debugLog(`  🔍 Piece ${piece.id} at (${Math.round(piece.x)}, ${Math.round(piece.y)}) rotation: ${piece.rotation}°`);
          debugLog(`    📏 Distance: ${Math.round(distance)} (tolerance: ${Math.round(tolerance)})`);
        }

        // Check for correct position AND rotation
        const isValid = distance < tolerance && rotationMatch;

        if (DEBUG_MODE) {
          debugLog(`    ${isValid ? '✅' : '❌'} Valid: ${isValid}`);
        }

        return isValid;
      });

            // If we found a valid piece, mark it as matched
      if (validPiece) {
        matchedPieceIds.add(validPiece.id);
        if (DEBUG_MODE) {
          const distance = Math.hypot(validPiece.x - target.screenX, validPiece.y - target.screenY);
          matchResults.push(`✅ Target ${target.id} ← Piece ${validPiece.id} (dist: ${Math.round(distance)}, rot: ${validPiece.rotation}°/${target.rotation}°)`);
          debugLog(`  ✅ Target ${target.id} MATCHED with piece ${validPiece.id}`);
        }
        return true;
      } else {
        if (DEBUG_MODE) {
          // Find the closest piece for debugging
          const closestPiece = pieces.filter(p => !matchedPieceIds.has(p.id)).reduce((closest, piece) => {
            const distance = Math.hypot(piece.x - target.screenX, piece.y - target.screenY);
            return (!closest || distance < closest.distance)
              ? { piece, distance }
              : closest;
          }, null);

          if (closestPiece) {
            const canFit = closestPiece.piece.id === target.id || areInterchangeable(closestPiece.piece.id, target.id, PIECES_DATA);
            const rotMatch = checkRotationMatch(closestPiece.piece.id, closestPiece.piece.rotation, target.id, target.rotation, planePuzzle, PIECES_DATA, false);
            const rotInfo = `${closestPiece.piece.rotation}°→${target.rotation}°`;
            matchResults.push(`❌ Target ${target.id}: closest is piece ${closestPiece.piece.id} (dist: ${Math.round(closestPiece.distance)}, fit: ${canFit}, rot: ${rotMatch ? '✓' : '✗'}${rotInfo})`);
          } else {
            matchResults.push(`❌ Target ${target.id}: no available pieces`);
          }

          debugLog(`  ❌ Target ${target.id} NOT MATCHED`);
        }
        return false;
      }
    });

    if (DEBUG_MODE) {
      debugInfo.matchResults = matchResults;
      debugLog("\n📊 MATCH RESULTS:");
      matchResults.forEach(result => debugLog(result));
      debugLog(`\n🏁 Puzzle solved: ${allCorrect}`);
    }

    puzzleSolved = allCorrect;

    if (allCorrect && DEBUG_MODE) {
      debugLog("🎉 CONGRATULATIONS! PUZZLE SOLVED! 🎉");
    }
  }

    onMount(() => {
    initializePieces();
    fitTargets();

    // Initialize debug mode if enabled
    if (DEBUG_MODE) {
      initializeDebugMode(PIECES_DATA);
    }
  });
</script>

<style>
  
  .puzzle-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 90%;
    height: 100dvh;
    padding: auto;
    margin:auto;
  }

  .puzzle-container {
    height: 100%;
    border-radius: 8px;
    /* Prevent scrolling/zooming when interacting with pieces */
    touch-action: pan-x pan-y;
    /* Improve touch responsiveness */
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
     touch-action: none;       /* bloque le scroll natif */
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  }

  .puzzle-solved {
    border-color: #4CAF50;
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
  }

  .target-outline, .tangram-piece {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--w);
    height: var(--h);
    transform: translate(calc(var(--x) * 1px - 50%), calc(var(--y) * 1px - 50%)) rotate(var(--rotation)) scaleX(var(--scaleX));
    pointer-events: none;
  }

  .target-outline.magnetic-target {
    animation: magneticGlow 0.8s ease-in-out infinite alternate;
  }

  @keyframes magneticGlow {
    0% {
      filter: drop-shadow(0 0 5px rgba(76, 175, 80, 0.6));
    }
    100% {
      filter: drop-shadow(0 0 15px rgba(76, 175, 80, 0.9));
    }
  }
  .tangram-piece {
     transition: transform 0.2s;
     will-change: transform;
     /* Prevent default touch behaviors during drag */
     touch-action: none;
     user-select: none;
     -webkit-user-select: none;
     -webkit-touch-callout: none;
  }
  .tangram-piece-svg polygon {
    pointer-events: auto;
  }

  .tangram-piece:active {
    cursor: grabbing;
  }

  .tangram-piece.active {
    z-index: 100;
    transition: none;
  }

  @keyframes wiggle {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-2deg); }
    75% { transform: rotate(2deg); }
    100% { transform: rotate(0deg); }
  }

  .tangram-piece.active .tangram-piece-svg,
  .wiggling-svg {
    animation: wiggle 0.3s ease-in-out;
  }

  .tangram-piece-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }

  .tangram-piece-svg polygon {
    stroke-linejoin: round;
    stroke: transparent;
    stroke-width: 0;
    pointer-events: auto;
    transition: stroke 0.2s, stroke-width 0.2s;
    /* Prevent default touch behaviors during drag */
    touch-action: none;
  }

  .tangram-piece.active .tangram-piece-svg polygon {
    stroke: rgba(0, 0, 0, 0.2);
    stroke-width: 1;
    filter: drop-shadow(10px 10px 10px rgba(0, 0, 0, 0.9));
    will-change: transform;
  }

  .pieces-container {
    display: flex;
    padding: 1rem;
    position: absolute;
    bottom: 45px;
    left: 0;
    right: 0;
    height: 100px;
    gap: .5rem;
  }

  .container-piece {
    width: 100px;
    height: 100%;
    cursor: grab;
    pointer-events: none;
    /* Prevent default touch behaviors */
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  .container-piece:active {
    cursor: grabbing;
  }

  .container-piece svg {
    pointer-events: auto;
    height: 100%;
    width: 100%;
    /* Prevent default touch behaviors during drag */
    touch-action: none;
  }
  .success-message {
    /* position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #4CAF50;
    color: white;
    padding: 2rem;
    border-radius: 8px;
    z-index: 2000; */
  }

  .action-buttons {
    position: absolute;
    top: var(--y);
    left: var(--x);
    transform: translate(-50%, -150%);
    display: flex;
    gap: 4px;
    z-index: 200;
  }

  .action-buttons button {
    pointer-events: auto;
    background: rgba(0,0,0,0.8);
    color: white;
    border: none;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }

  .action-buttons button:hover {
    transform: scale(1.1);
    background: rgba(0,0,0,0.9);
  }

  .debug-panel {
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 1rem;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    max-width: 400px;
    z-index: 1000;
    max-height: 50vh;
    overflow-y: auto;
  }

  .debug-panel h3 {
    margin: 0 0 0.5rem 0;
    color: #4CAF50;
  }

  .debug-panel .debug-item {
    margin: 0.25rem 0;
    line-height: 1.4;
  }

  .debug-panel .match-result {
    padding: 2px 4px;
    margin: 2px 0;
    border-radius: 3px;
  }

  .debug-panel .match-result.success {
    background: rgba(76, 175, 80, 0.3);
  }

  .debug-panel .match-result.failure {
    background: rgba(244, 67, 54, 0.3);
  }
</style>

<div class="top-5 left-5  fixed title z-10 w-max text-title inf-bold mx-auto w-fit bg-white border py-1 px-[14px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]">CHROMOGRAM #1</div>
<div class="top-2 right-5 fixed z-10 text-inter inf-bold">?</div>

  <div class="z-10 bottom-3.5 left-5 fixed text-mini" >Accueil > Les Couleurs > Les Tangrams</div>
  <div class="z-10 fixed text-mini bottom-3.5 right-5" >Crédits</div>

  <div class="z-10 top-25 left-5 fixed text-11" >
    1. Fais glisser une des formes du bas vers le tangram.<br/>
    2. Appuie sur la forme pour la faire pivoter.<br/>
    3. Dépose la forme à son emplacement.<br/>
</div>




<div class="puzzle-wrapper" onpointerdown={unlockAudio}>

  <!-- Puzzle area with padding -->
  <div class="h-full">
    <div class="pt-[80px] puzzle-container {puzzleSolved ? 'puzzle-solved' : ''}"
          bind:this={puzzleContainer}
          use:observeResize
          role="main"
          onpointerdown={() => activePieceId = null} >

    <!-- Target outline -->
    {#each targetPieces as target (target.id)}
      {@const pieceData = PIECES_DATA_WITH_VIEWBOX[target.id]}
      {@const isMagneticTarget = magneticTarget && magneticTarget.id === target.id}
      <div class="target-outline"
        class:magnetic-target={isMagneticTarget}
        style="
          --x: {target.screenX};
          --y: {target.screenY};
          --w: {pieceData.width * puzzleScale}px;
          --h: {pieceData.height * puzzleScale}px;
          --rotation: {target.rotation}deg;
          --scaleX: 1;"
        >
        <svg class="tangram-piece-svg" viewBox={pieceData.viewBox}>
          <polygon points={pieceData.points} fill="#000" opacity="0.1" stroke="{isMagneticTarget ? '#4CAF50' : '#555'}" stroke-width="{isMagneticTarget ? '3' : '2'}" stroke-dasharray="5,5" />
        </svg>
      </div>
    {/each}

    {#each pieces.filter(p => !p.inContainer) as piece (piece.id)}
      {@const pieceData = PIECES_DATA_WITH_VIEWBOX[piece.id]}
      <div
        class="tangram-piece"
        class:active={activePieceId === piece.id}
        style="
          --x: {piece.x};
          --y: {piece.y};
          --w: {pieceData.width * puzzleScale}px;
          --h: {pieceData.height * puzzleScale}px;
          --rotation: {piece.rotation}deg;
          --scaleX: 1;
          --z-index: {activePieceId === piece.id ? 100 : 10};
        "
      >
        {#key piece.animationKey}
          <svg class="tangram-piece-svg" class:wiggling-svg={activePieceId === piece.id} viewBox={pieceData.viewBox}>
            <polygon use:draggable={{ pieceId: piece.id }} points={pieceData.points} fill={pieceData.color} />
          </svg>
        {/key}
      </div>
    {/each}
    </div>
  </div>

  {#if activePiece && !activePiece.inContainer}
    <div
      class="action-buttons"
      style="--x: {activePiece.x}px; --y: {activePiece.y}px;"
      onpointerdown={(e) => e.stopPropagation()}
    >
    </div>
  {/if}

  <div class="pieces-container" bind:this={piecesContainer}>
    {#each pieces.filter(p => p.inContainer) as piece (piece.id)}
      {@const pieceData = PIECES_DATA_WITH_VIEWBOX[piece.id]}
        <div class="container-piece relative z-1">
          <svg viewBox={pieceData.viewBox}>
            <polygon use:draggable={{ pieceId: piece.id }} points={pieceData.points} fill={pieceData.color} />
          </svg>
        </div>
      
    {/each}
  </div>


  {#if puzzleSolved}
    <div class="success-message">Super ! Tu as complété ce tangram !</div>
  {/if}

    <!-- Debug Panel - Only shown when DEBUG_MODE is true -->
  {#if DEBUG_MODE}
    <div class="debug-panel">
      <h3>🔍 Debug Info</h3>
      <div class="debug-item">
        <strong>Last Check:</strong> {debugInfo.lastCheck || 'Never'}
      </div>
      <div class="debug-item">
        <strong>Tolerance:</strong> {debugInfo.tolerance}px
      </div>
      <div class="debug-item">
        <strong>Scale:</strong> {puzzleScale.toFixed(2)}
      </div>
      {#if debugInfo.piecesInContainer.length > 0}
        <div class="debug-item">
          <strong>In Container:</strong> {debugInfo.piecesInContainer.join(', ')}
        </div>
      {/if}

      <h3>📊 Match Results</h3>
      {#each debugInfo.matchResults as result}
        <div class="match-result {result.startsWith('✅') ? 'success' : 'failure'}">
          {result}
        </div>
      {/each}

      {#if debugInfo.matchResults.length === 0}
        <div class="debug-item">Move a piece to see matching status</div>
      {/if}
    </div>
  {/if}
</div>