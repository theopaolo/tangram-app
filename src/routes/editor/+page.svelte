<script>
  import { onMount } from 'svelte';
  import createInteractionHandler from '../../lib/interaction.js';

  let pieces = $state([
    { id: 1, x: 50, y: 50, rotation: 0, flipped: false, animationKey: 0 },
    { id: 2, x: 150, y: 50, rotation: 0, flipped: false, animationKey: 0 },
    { id: 3, x: 250, y: 50, rotation: 0, flipped: false, animationKey: 0 },
    { id: 4, x: 350, y: 50, rotation: 0, flipped: false, animationKey: 0 },
    { id: 5, x: 50, y: 150, rotation: 0, flipped: false, animationKey: 0 },
    { id: 6, x: 150, y: 150, rotation: 0, flipped: false, animationKey: 0 },
    { id: 7, x: 250, y: 150, rotation: 0, flipped: false, animationKey: 0 },
  ]);

  // --- STATE ---
  let activePieceId = $state(null);
  let importJson = $state('');
  let containerSize = $state({ width: 0, height: 0 });

  let puzzleContainer;
  const VIRTUAL_SIZE = 460;

  // --- DERIVED STATE ---
  const activePiece = $derived(pieces.find(p => p.id === activePieceId));

  let scale = $derived(
    Math.min(containerSize.width, containerSize.height) / VIRTUAL_SIZE || 0
  );

  // This helper function does the geometry for us
  function getTransformedPoints(piece, pieceData) {
    // Center of rotation (from the original 300x300 viewBox)
    const originX = 150;
    const originY = 150;

    const angle = piece.rotation * (Math.PI / 180); // Convert degrees to radians
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const scaleX = piece.flipped ? -1 : 1;

    const basePoints = pieceData.points.split(' ').map(p => p.split(',').map(Number));

    return basePoints.map(([px, py]) => {
      // 1. Move point relative to the origin
      let x = px - originX;
      let y = py - originY;

      // 2. Apply flip
      x *= scaleX;

      // 3. Apply rotation
      const rotatedX = x * cos - y * sin;
      const rotatedY = x * sin + y * cos;

      // 4. Move point back from origin and add the piece's main position
      const finalX = rotatedX + piece.x;
      const finalY = rotatedY + piece.y;

      return { x: finalX, y: finalY };
    });
  }

  // --- AUDIO ---
  let pickupSound, dropSound;
  let audioUnlocked = false;
  let audioContext;

  onMount(() => {
    pickupSound = new Audio('/snd/tap_01.mp3');
    dropSound = new Audio('/snd/tap_04.mp3');
  });

  function rotateActivePiece() {
    if (activePiece) {
      activePiece.rotation = (activePiece.rotation + 45) % 360;
      activePiece.animationKey += 1;
    }
  }

  function flipActivePiece() {
    if (activePiece) {
      activePiece.flipped = !activePiece.flipped;
    }
  }

  function exportPuzzleData() {
    console.log(JSON.stringify(pieces, null, 2));
    alert('Puzzle data has been logged to the console! (Press F12)');
  }

function handleImport() {
    if (!importJson.trim()) {
      alert('Please paste puzzle data into the text area first.');
      return;
    }
    try {
      const importedPieces = JSON.parse(importJson);
      if (Array.isArray(importedPieces) && importedPieces.length > 0 && 'id' in importedPieces[0]) {
        pieces = importedPieces;

        // Double RAF to ensure DOM is fully updated
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            fitPuzzle();
          });
        });

        alert('Puzzle imported successfully!');
      } else {
        alert('Invalid puzzle data format.');
      }
    } catch (e) {
      alert('Failed to parse JSON. Please check the data for errors.');
      console.error("JSON Parse Error:", e);
    }
}


  function draggable(node, params) {
    let offsetX, offsetY;

    const handlePointerDown = createInteractionHandler({
    // onDown: Called when the pointer is first pressed
    onDown: (e) => {
      activePieceId = params.pieceId;
      playSound(pickupSound);

      // Calculate the initial offset for dragging
      const piece = pieces.find(p => p.id === params.pieceId);
      if (!piece) return;
      const rect = params.container.getBoundingClientRect();
      const pointerX = (e.clientX - rect.left) / scale;
      const pointerY = (e.clientY - rect.top) / scale;
      offsetX = pointerX - piece.x;
      offsetY = pointerY - piece.y;
    },

    // onDrag: Called when the pointer moves enough to be a drag
    onDrag: (e) => {
      const piece = pieces.find(p => p.id === params.pieceId);
      if (!piece) return;

      const rect = params.container.getBoundingClientRect();
      const pointerX = (e.clientX - rect.left) / scale;
      const pointerY = (e.clientY - rect.top) / scale;
      piece.x = Math.round(pointerX - offsetX);
      piece.y = Math.round(pointerY - offsetY);
    },

    // onEnd: Called when the pointer is released
    onEnd: (e, wasTap, wasDrag) => {
      if (wasTap) {
        rotateActivePiece(); // Reuse the component method
      } else if (wasDrag) {
        playSound(dropSound);
      }
    }
  });

  node.addEventListener('pointerdown', handlePointerDown);

  return {
    destroy: () => {
      node.removeEventListener('pointerdown', handlePointerDown);
    }
  };
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

  function observeResize(node, onResize) {
    const observer = new ResizeObserver(entries => {
      onResize(entries[0].contentRect);
    });
    observer.observe(node);

    // The destroy function handles cleanup automatically when the component is removed.
    return {
      destroy() {
        observer.unobserve(node);
      }
    };
  }

  function fitPuzzle() {
    if (pieces.length === 0 || !puzzleContainer) return;

    // STEP 1: Compute all transformed vertices for every piece
    const allTransformedPoints = pieces.flatMap(p =>
      getTransformedPoints(p, PIECES_DATA_WITH_VIEWBOX[p.id])
    );

    // STEP 2: Calculate the puzzle's collective bounding box
    const xs = allTransformedPoints.map(p => p.x);
    const ys = allTransformedPoints.map(p => p.y);

    const puzzleBounds = {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    };

    const puzzleWidth = puzzleBounds.maxX - puzzleBounds.minX;
    const puzzleHeight = puzzleBounds.maxY - puzzleBounds.minY;
    const puzzleCenter = {
      x: (puzzleBounds.minX + puzzleBounds.maxX) / 2,
      y: (puzzleBounds.minY + puzzleBounds.maxY) / 2
    };

    // STEP 3: Calculate scale to fit width
    const padding = 0; // padding in virtual units
    const targetWidth = VIRTUAL_SIZE - padding * 2;
    const targetHeight = VIRTUAL_SIZE - padding * 2;
    const scaleFactor = Math.min(targetWidth / puzzleWidth, targetHeight / puzzleHeight);

    // STEP 4: Scale and reposition all pieces
    for (const piece of pieces) {
      // Move to origin, scale, then move to final position
      const dx = piece.x - puzzleCenter.x;
      const dy = piece.y - puzzleCenter.y;

      piece.x = Math.round(VIRTUAL_SIZE / 2 + dx * scaleFactor);
      piece.y = Math.round(VIRTUAL_SIZE / 2 + dy * scaleFactor);
    }
}

  const PIECES_DATA = {
    1: {  name: 'Le Grand Triangle',color: '#A9BCC4',story: 'Cette pièce représente la majestuosité de la pyramide de Khéops...',artwork: 'Pyramide de Khéops - Égypte Antique',points: '15,15 150,150 285,15' /* Large right triangle*/},
    2: {	name: 'Le Triangle Moyen',	color: '#FFF35C',	story: 'Inspiré des voiles des navires vénitiens...',	artwork: 'Les Marchands de Venise - Canaletto',	points: '15,15 150,150 15,285' /* Large left triangle */ },
    3: { 	name: 'Le Petit Triangle', 	color: '#2B3B6D', 	story: 'Cette petite forme géométrique fait écho...', 	artwork: "Livre d'Heures - Art Médiéval", 	points: '150,150 217,217 217,83' /* Small triangle (top right) */ },
    4: { 	name: 'Le Carré', 	color: '#7AC142', 	story: "Le carré parfait représente l'équilibre...", 	artwork: 'Le Parthénon - Grèce Antique', 	points: '150,150 217,217 150,285 83,217' /* Square in center */ },
    5: { 	name: 'Le Parallélogramme', 	color: '#6B8FD6', 	story: 'Cette oeuvre fait partie de la série...', 	artwork: 'MC Mitout. Les plus belles heures...', 	points: '217,83 217,217 285,150 285,15' /* Parallelogram (right) */ },
    6: { 	name: 'Le Grand Trapèze', 	color: '#3B5D3A', 	story: 'Inspiré des toitures des pagodes japonaises...', 	artwork: 'Temple Kinkaku-ji - Architecture Japonaise', 	points: '15,285 150,285 83,217' /* Small triangle (bottom left) */ },
    7: { 	name: 'Le Petit Trapèze', 	color: '#8B83D2', 	story: 'Cette dernière pièce représente les rayons...', 	artwork: 'Impression, soleil levant - Claude Monet', 	points: '150,285 285,150 285,285' /* Triangle (bottom right) */ }
  };

  const noFlipPieces = [4,6]; // Les pièces Le Grand Triangle id:1, Le Carré id:4, Le Grand Trapèze id:6 n'on pas besoin de flip

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

  function centerPuzzle() {
    if (pieces.length === 0) return;
    // Find the average center of all piece anchor points (in virtual coords)
    const sum = pieces.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    const puzzleCenterX = sum.x / pieces.length;
    const puzzleCenterY = sum.y / pieces.length;

    // Center in virtual space
    const offsetX = VIRTUAL_SIZE / 2 - puzzleCenterX;
    const offsetY = VIRTUAL_SIZE / 2 - puzzleCenterY;

    for (const piece of pieces) {
      piece.x = Math.round(piece.x + offsetX);
      piece.y = Math.round(piece.y + offsetY);
    }
  }


</script>

<style>
  .editor-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100dvh - 2rem);
  }

  .toolbar {
    padding: 10px;
    background: #e0e0e0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    flex-shrink: 0;
  }

  .toolbar textarea {
    flex-grow: 1;
    height: 40px;
  }

  .editor-canvas {
    flex-grow: 1;
    position: relative;
    background-color: #f0f0f0;
  }

  .tangram-piece {
    position: absolute;
    top: var(--y);
    left: var(--x);
    width: var(--w);
    height: var(--h);
    transform-origin: 50% 50%;
    transform: translate(-50%, -50%) rotate(var(--rotation)) scaleX(var(--scaleX));
    cursor: grab;
    transition: top 0.2s, left 0.2s, transform 0.2s;
    pointer-events: none;
    will-change: transform, top, left, width, height;
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
    transition: stroke 0.2s, stroke-width 0.2s;
    pointer-events: auto;
  }

  .tangram-piece.active .tangram-piece-svg polygon {
    stroke: #ffb3e6;
    stroke-width: 1px;
    filter: drop-shadow(0 0 2px #ffd6f5) drop-shadow(0 0 1px #ffb3e6);
    transition: filter 0.2s, stroke 0.2s, stroke-width 0.2s;
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
  }

  .action-buttons button:hover {
    transform: scale(1.1);
  }
</style>

<div class="editor-wrapper"  onpointerdown={unlockAudio}>
  <div bind:this={puzzleContainer}
    class="editor-canvas"
    onpointerdown={() => activePieceId = null}
    use:observeResize={(rect) => {
      containerSize.width = rect.width;
      containerSize.height = rect.height;
    }}>


      {#if scale > 0}
        {#each pieces as piece (piece.id)}
          {@const pieceData = PIECES_DATA_WITH_VIEWBOX[piece.id]}
          <div
            class="tangram-piece"
            class:active={activePieceId === piece.id}
            style="
              --x: {piece.x * scale}px;
              --y: {piece.y * scale}px;
              --w: {pieceData.width * scale}px;
              --h: {pieceData.height * scale}px;
              --rotation: {piece.rotation}deg;
              --scaleX: {piece.flipped ? -1 : 1};
            "
          >
            {#key piece.animationKey}
              <svg
                class="tangram-piece-svg wiggling-svg"
                viewBox={pieceData.viewBox}
                name={pieceData.name}
              >
                <polygon
                  use:draggable={{ pieceId: piece.id, container: puzzleContainer }}
                  points={pieceData.points}
                  fill={pieceData.color} />
              </svg>
            {/key}
          </div>
        {/each}
      {/if}

     {#if activePiece}
      <div
        class="action-buttons"
        style="--x: {activePiece.x * scale}px; --y: {activePiece.y * scale}px;"
        onpointerdown={(e) => e.stopPropagation()}
      >
        {#if !noFlipPieces.includes(activePiece.id)}
          <button onclick={flipActivePiece}>↔️</button>
        {/if}
      </div>
    {/if}
  </div>

  <div class="toolbar">
    <textarea bind:value={importJson} placeholder="Paste puzzle data here..."></textarea>
    <div class="flex gap-2">
      <button class="border bg-amber-50 p-2 cursor-pointer text-sm" onclick={handleImport}>Import</button>
      <button class="border bg-amber-50 p-2 cursor-pointer text-sm" onclick={centerPuzzle}>Center Puzzle</button>
      <button class="border bg-amber-50 p-2 cursor-pointer text-sm" onclick={fitPuzzle}>Fit</button>
      <button class="border bg-amber-50 p-2 cursor-pointer text-sm" onclick={exportPuzzleData}>Export</button>
    </div>
  </div>
</div>
