<script>
  import { onMount } from 'svelte';
  import createInteractionHandler from '../../lib/interaction.js';

 let pieces = $state([
    { id: 1, x: 50, y: 50, origX: 50, origY: 50, rotation: 0, flipped: false, animationKey: 0 },
    { id: 2, x: 150, y: 50, origX: 150, origY: 50, rotation: 0, flipped: false, animationKey: 0 },
    { id: 3, x: 250, y: 50, origX: 250, origY: 50, rotation: 0, flipped: false, animationKey: 0 },
    { id: 4, x: 350, y: 50, origX: 350, origY: 50, rotation: 0, flipped: false, animationKey: 0 },
    { id: 5, x: 50, y: 150, origX: 50, origY: 150, rotation: 0, flipped: false, animationKey: 0 },
    { id: 6, x: 150, y: 150, origX: 150, origY: 150, rotation: 0, flipped: false, animationKey: 0 },
    { id: 7, x: 250, y: 150, origX: 250, origY: 150, rotation: 0, flipped: false, animationKey: 0 },
  ]);

  // Unit-based coordinate system for perfect alignment
  const UNIT = 27;       // 270px / 10 units
  const OFFSET = 15;     // margin
  const U = (n) => OFFSET + UNIT * n;
  const P = (pts) => pts.map(([x,y]) => `${U(x)},${U(y)}`).join(' ');

  const PIECES_DATA = {
    1: { name: 'Le Grand Triangle', color: '#A9BCC4', story: 'Cette pièce représente la majestuosité de la pyramide de Khéops...', artwork: 'Pyramide de Khéops - Égypte Antique', points: P([[0,0],[5,5],[10,0]]) },
    2: { name: 'Le Triangle Moyen', color: '#FFF35C', story: 'Inspiré des voiles des navires vénitiens...', artwork: 'Les Marchands de Venise - Canaletto', points: P([[0,0],[5,5],[0,10]]) },
    3: { name: 'Le Petit Triangle', color: '#2B3B6D', story: 'Cette petite forme géométrique fait écho...', artwork: "Livre d'Heures - Art Médiéval", points: P([[5,5],[7.5,7.5],[7.5,2.5]]) },
    4: { name: 'Le Carré', color: '#7AC142', story: "Le carré parfait représente l'équilibre...", artwork: 'Le Parthénon - Grèce Antique', points: P([[5,5],[7.5,7.5],[5,10],[2.5,7.5]]) },
    5: { name: 'Le Parallélogramme', color: '#6B8FD6', story: 'Cette oeuvre fait partie de la série...', artwork: 'MC Mitout. Les plus belles heures...', points: P([[7.5,2.5],[7.5,7.5],[10,5],[10,0]]) },
    6: { name: 'Le Grand Trapèze', color: '#3B5D3A', story: 'Inspiré des toitures des pagodes japonaises...', artwork: 'Temple Kinkaku-ji - Architecture Japonaise', points: P([[0,10],[5,10],[2.5,7.5]]) },
    7: { name: 'Le Petit Trapèze', color: '#8B83D2', story: 'Cette dernière pièce représente les rayons...', artwork: 'Impression, soleil levant - Claude Monet', points: P([[5,10],[10,5],[10,10]]) }
  };

  const noFlipPieces = [4,6]; // Les pièces Le Grand Triangle id:1, Le Carré id:4, Le Grand Trapèze id:6 n'on pas besoin de flip

  // --- HYBRID SNAPPING CONSTANTS ---
  const GRID_SIZE = 2; // Fine grid spacing in pixels
  const GRID_SNAP_THRESHOLD = 6; // Distance to start snapping to grid
  const VERTEX_SNAP_DISTANCE = 15; // Distance to snap to another piece's vertex
  const VERTEX_SNAP_PRIORITY = 10; // Vertex snapping takes priority within this distance

  // --- STATE ---
  let activePieceId = $state(null);
  let importJson = $state('');
  let containerSize = $state({ width: 0, height: 0 });
  let puzzleScale = $state(1);
  let puzzleContainer;
  let showGrid = $state(true); // Toggle grid visibility
  let snapIndicator = $state(null); // Show where piece will snap {x, y, type: 'grid'|'vertex'}

  // --- DERIVED STATE ---
  const activePiece = $derived(pieces.find(p => p.id === activePieceId));

  // This helper function does the geometry for us
  function getTransformedPoints(piece, pieceData) {
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

  // Snap position to grid
  function snapToGrid(x, y) {
    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;

    // Only snap if within threshold
    const distX = Math.abs(x - snappedX);
    const distY = Math.abs(y - snappedY);

    return {
      x: distX < GRID_SNAP_THRESHOLD ? snappedX : x,
      y: distY < GRID_SNAP_THRESHOLD ? snappedY : y,
      distance: Math.hypot(distX, distY),
      type: 'grid'
    };
  }

  // Find the closest vertex snap point between active piece and other pieces
  function findVertexSnapPoint(activePiece) {
    if (!activePiece) return null;

    const activeData = PIECES_DATA_WITH_VIEWBOX[activePiece.id];
    const activeVertices = getTransformedPoints(activePiece, activeData);

    let closestSnap = null;
    let minDistance = VERTEX_SNAP_DISTANCE;

    // Check against all other pieces
    for (const otherPiece of pieces) {
      if (otherPiece.id === activePiece.id) continue;

      const otherData = PIECES_DATA_WITH_VIEWBOX[otherPiece.id];
      const otherVertices = getTransformedPoints(otherPiece, otherData);

      // Check all vertex-to-vertex distances
      for (const activeVertex of activeVertices) {
        for (const otherVertex of otherVertices) {
          const distance = Math.hypot(
            activeVertex.x - otherVertex.x,
            activeVertex.y - otherVertex.y
          );

          if (distance < minDistance) {
            minDistance = distance;
            // Calculate the offset needed to snap this vertex to the other
            const offsetX = otherVertex.x - activeVertex.x;
            const offsetY = otherVertex.y - activeVertex.y;
            closestSnap = {
              x: activePiece.x + offsetX,
              y: activePiece.y + offsetY,
              distance: distance,
              type: 'vertex'
            };
          }
        }
      }
    }

    return closestSnap;
  }

  // Hybrid snapping: prioritize vertex snapping, fallback to grid
  function findBestSnapPoint(piece, rawX, rawY) {
    // Try vertex snapping first
    const vertexSnap = findVertexSnapPoint(piece);

    // Try grid snapping
    const gridSnap = snapToGrid(rawX, rawY);

    // If we have a vertex snap within priority distance, use it
    if (vertexSnap && vertexSnap.distance < VERTEX_SNAP_PRIORITY) {
      return vertexSnap;
    }

    // If we have a vertex snap that's closer than grid, use it
    if (vertexSnap && (!gridSnap || vertexSnap.distance < gridSnap.distance)) {
      return vertexSnap;
    }

    // Otherwise use grid snap
    return gridSnap;
  }

  // --- AUDIO ---
  let pickupSound, dropSound;
  let audioUnlocked = false;
  let audioContext;

  onMount(() => {
    pickupSound = new Audio('/snd/tap_01.mp3');
    dropSound = new Audio('/snd/tap_04.mp3');
  });

  function rotateActivePiece() { if (activePiece) { activePiece.rotation = (activePiece.rotation + 45) % 360; activePiece.animationKey += 1; } }
  function flipActivePiece() { if (activePiece) { activePiece.flipped = !activePiece.flipped; activePiece.animationKey += 1; } }

   function exportPuzzleData() {
    // We should export the unscaled "orig" data so it can be re-imported reliably.
    const dataToExport = pieces.map(({ id, origX, origY, rotation, flipped }) => ({ x: origX, y: origY, id, rotation, flipped }));
    const jsonString = JSON.stringify(dataToExport, null, 2);
    console.log(jsonString);
    navigator.clipboard.writeText(jsonString).then(() => {
        alert('Puzzle data copied to clipboard!');
    }, () => {
        alert('Puzzle data logged to console.');
    });
  }

  function handleImport() {
      if (!importJson.trim()) {
        alert('Please paste puzzle data into the text area first.');
        return;
      }
      try {
        const importedData = JSON.parse(importJson);
        if (Array.isArray(importedData) && importedData.length > 0 && 'id' in importedData[0]) {
          pieces = importedData.map(p => ({
            ...p,
            origX: p.x,
            origY: p.y,
            animationKey: 0
          }));

          requestAnimationFrame(() => {
              fitPuzzle();
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
      onDown: (e) => {
        activePieceId = params.pieceId;
        playSound(pickupSound);
        const piece = pieces.find(p => p.id === params.pieceId);
        if (!piece) return;

        // piece.x/y is the center. e.clientX/Y is absolute.
        // We need the offset between the pointer and the piece's center.
        offsetX = e.clientX - piece.x;
        offsetY = e.clientY - piece.y;
      },
      onDrag: (e) => {
        const piece = pieces.find(p => p.id === params.pieceId);
        if (!piece) return;

        // Calculate the new position based on pointer
        const rawX = e.clientX - offsetX;
        const rawY = e.clientY - offsetY;

        piece.x = Math.round(rawX);
        piece.y = Math.round(rawY);
        snapIndicator = null;
      },
      onEnd: (e, wasTap, wasDrag) => {
        const piece = pieces.find(p => p.id === params.pieceId);
        if (!piece) return;

        if (wasTap) {
          rotateActivePiece();
        } else if (wasDrag) {
          playSound(dropSound);
        }

        // Update origX/origY for export purposes
        piece.origX = piece.x;
        piece.origY = piece.y;

        // Clear snap indicator
        snapIndicator = null;
      }
    });

    node.addEventListener('pointerdown', handlePointerDown);
    return {
      destroy: () => node.removeEventListener('pointerdown', handlePointerDown)
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

  function observeResize(node) {
    const observer = new ResizeObserver(entries => {
      // Get the new dimensions from the resize event
      const rect = entries[0].contentRect;
      // Update the container size state
      containerSize.width = rect.width;
      containerSize.height = rect.height;
      // Call fitPuzzle directly from here
      fitPuzzle();
    });
    observer.observe(node);

    return {
      destroy() {
        observer.unobserve(node);
      }
    };
  }

function fitPuzzle() {
  if (pieces.length === 0 || !containerSize.width) return;
  const gutter = -1;

  const allPts = pieces.flatMap(p =>
    getTransformedPoints(
      { ...p, x: p.origX, y: p.origY },
      PIECES_DATA_WITH_VIEWBOX[p.id]
    )
  );
  const xs = allPts.map(p => p.x),
        ys = allPts.map(p => p.y);
  const bounds = {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
  const puzzleWidth  = bounds.maxX - bounds.minX;
  const availableWidth = containerSize.width - gutter * 2;
  const scaleFactor = availableWidth / puzzleWidth;
  puzzleScale = scaleFactor;

  for (const piece of pieces) {
    piece.x = Math.round((piece.origX - bounds.minX) * scaleFactor + gutter);
    piece.y = Math.round((piece.origY - bounds.minY) * scaleFactor + gutter);
  }
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

  .editor-canvas.show-grid {
    background-image:
      repeating-linear-gradient(0deg, transparent, transparent calc(var(--grid-size) * 1px - 1px), #ddd calc(var(--grid-size) * 1px - 1px), #ddd calc(var(--grid-size) * 1px)),
      repeating-linear-gradient(90deg, transparent, transparent calc(var(--grid-size) * 1px - 1px), #ddd calc(var(--grid-size) * 1px - 1px), #ddd calc(var(--grid-size) * 1px));
    background-size: calc(var(--grid-size) * 1px) calc(var(--grid-size) * 1px);
  }

  .tangram-piece {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--w);
    height: var(--h);
    transform: translate(calc(var(--x) * 1px - 50%), calc(var(--y) * 1px - 50%)) rotate(var(--rotation)) scaleX(var(--scaleX));
    cursor: grab;
    transition: transform 0.1s ease;
    pointer-events: none;
    will-change: transform;
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
    /* Prevent default touch behaviors during drag */
    touch-action: none;
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

<div class="editor-wrapper" onpointerdown={unlockAudio}>
  <div
    bind:this={puzzleContainer}
    class="editor-canvas"
    class:show-grid={showGrid}
    style="--grid-size: {GRID_SIZE}"
    onpointerdown={() => activePieceId = null}
    use:observeResize
  >

    {#each pieces as piece (piece.id)}
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
          --scaleX: {piece.flipped ? -1 : 1};
        "
      >
        {#key piece.animationKey}
          <svg
            class="tangram-piece-svg"
            class:wiggling-svg={activePieceId === piece.id}
            viewBox={pieceData.viewBox}
          >
            <polygon
              use:draggable={{ pieceId: piece.id }}
              points={pieceData.points}
              fill={pieceData.color} />
          </svg>
        {/key}
      </div>
    {/each}

    {#if activePiece}
      <div
        class="action-buttons"
        style="--x: {activePiece.x}; --y: {activePiece.y};"
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
    <div class="flex gap-2 items-center">
      <button class="border bg-amber-50 p-2 cursor-pointer text-sm" onclick={handleImport}>Import</button>
      <button class="border bg-amber-50 p-2 cursor-pointer text-sm" onclick={fitPuzzle}>Fit</button>
      <button class="border bg-amber-50 p-2 cursor-pointer text-sm" onclick={exportPuzzleData}>Export</button>
      <button class="border bg-amber-50 p-2 cursor-pointer text-sm" onclick={() => showGrid = !showGrid}>
        {showGrid ? 'Hide' : 'Show'} Grid
      </button>

    </div>
  </div>
</div>
