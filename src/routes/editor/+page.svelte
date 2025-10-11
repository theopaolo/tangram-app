<script>
  import { onMount } from 'svelte';
  import createInteractionHandler from '../../lib/interaction.js';
  import { PIECES_DATA_WITH_VIEWBOX as SHARED_PIECES_DATA_WITH_VIEWBOX } from '../../lib/puzzleData.js';

let pieces = $state([
   { id: 1, x: 50, y: 50, rotation: 0, flipped: false, animationKey: 0 },
   { id: 2, x: 150, y: 50, rotation: 0, flipped: false, animationKey: 0 },
   { id: 3, x: 250, y: 50, rotation: 0, flipped: false, animationKey: 0 },
   { id: 4, x: 350, y: 50, rotation: 0, flipped: false, animationKey: 0 },
   { id: 5, x: 50, y: 150, rotation: 0, flipped: false, animationKey: 0 },
   { id: 6, x: 150, y: 150, rotation: 0, flipped: false, animationKey: 0 },
   { id: 7, x: 250, y: 150, rotation: 0, flipped: false, animationKey: 0 },
  ]);

  // Use shared, canonical pieces data (with viewBox, width, height)
  const PIECES_DATA_WITH_VIEWBOX = SHARED_PIECES_DATA_WITH_VIEWBOX;

  const noFlipPieces = [1,4,5,6]; // Les pièces 1, 4, 5, 6 n'ont pas besoin de flip

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


  onMount(() => {
    // Add keyboard event listener for arrow keys
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });

  function rotateActivePiece() { if (activePiece) { activePiece.rotation = (activePiece.rotation + 45) % 360; activePiece.animationKey += 1; } }
  function rotateActivePieceCounterClockwise() { if (activePiece) { activePiece.rotation = (activePiece.rotation - 45 + 360) % 360; activePiece.animationKey += 1; } }
  function flipActivePiece() { if (activePiece && !noFlipPieces.includes(activePiece.id)) { activePiece.flipped = !activePiece.flipped; activePiece.animationKey += 1; } }

  // Precise movement with arrow keys
  function moveActivePiece(dx, dy) {
    if (!activePiece) return;
    activePiece.x += dx;
    activePiece.y += dy;
    activePiece.animationKey += 1;
  }

  // Handle arrow key presses and spacebar rotation
  function handleKeyDown(event) {
    if (!activePiece) return;

    const moveAmount = event.shiftKey ? 10 : 1; // Shift = 10px, normal = 1px

    switch(event.key) {
      case 'ArrowUp':
        event.preventDefault();
        moveActivePiece(0, -moveAmount);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveActivePiece(0, moveAmount);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveActivePiece(-moveAmount, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveActivePiece(moveAmount, 0);
        break;
      case ' ':
        event.preventDefault();
        if (event.shiftKey) {
          rotateActivePieceCounterClockwise();
        } else {
          rotateActivePiece();
        }
        break;
    }
  }

   function exportPuzzleData() {
    // Export current positions directly - what you see is what you get
    const dataToExport = pieces.map(({ id, x, y, rotation, flipped }) => ({
      id,
      rotation,
      flipped,
      x: Math.round(x),
      y: Math.round(y)
    }));
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
          // Import positions directly - no transformation
          pieces = importedData.map(p => ({
            ...p,
            animationKey: 0
          }));
          // Reset scale to 1.0 for consistency
          puzzleScale = 1;
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

        // Calculate the new raw position based on pointer
        const rawX = e.clientX - offsetX;
        const rawY = e.clientY - offsetY;

        // Live preview snapping: compute best snap but keep piece following pointer; show indicator
        const previewPiece = { ...piece, x: Math.round(rawX), y: Math.round(rawY) };
        const bestSnap = findBestSnapPoint(previewPiece, previewPiece.x, previewPiece.y);

        piece.x = previewPiece.x;
        piece.y = previewPiece.y;
        snapIndicator = bestSnap ? { x: bestSnap.x, y: bestSnap.y, type: bestSnap.type } : null;
      },
      onEnd: (e, wasTap, wasDrag) => {
        const piece = pieces.find(p => p.id === params.pieceId);
        if (!piece) return;

        if (wasTap) {
          rotateActivePiece();
        } else if (wasDrag) {
          // Commit to snap target if available
          if (snapIndicator) {
            piece.x = Math.round(snapIndicator.x);
            piece.y = Math.round(snapIndicator.y);
          }
        }

        // Clear snap indicator
        snapIndicator = null;
      }
    });

    node.addEventListener('pointerdown', handlePointerDown);
    return {
      destroy: () => node.removeEventListener('pointerdown', handlePointerDown)
    };
  }


function getPieceGreyShade(id) {
  const shades = [
'#000000', // 1 - noir pur
  '#080808', // 2 - noir dense
  '#111111', // 3 - noir profond
  '#1a1a1a', // 4 - gris charbon
  '#242424', // 5 - gris anthracite
  '#2e2e2e', // 6 - gris foncé
  '#383838'  // 7 - gris acier foncé
  ];
  return shades[(id - 1) % shades.length];
}


  function observeResize(node) {
    const observer = new ResizeObserver(entries => {
      // Get the new dimensions from the resize event
      const rect = entries[0].contentRect;
      // Update the container size state
      containerSize.width = rect.width;
      containerSize.height = rect.height;
    });
    observer.observe(node);

    return {
      destroy() {
        observer.unobserve(node);
      }
    };
  }

  // Get the bounding box of all pieces in their current positions
  function getPuzzleBounds() {
    if (pieces.length === 0) return null;

    const allPts = pieces.flatMap(p =>
      getTransformedPoints(p, PIECES_DATA_WITH_VIEWBOX[p.id])
    );
    const xs = allPts.map(p => p.x);
    const ys = allPts.map(p => p.y);

    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  }

  // Center puzzle horizontally
  function centerHorizontally() {
    const bounds = getPuzzleBounds();
    if (!bounds) return;

    // Get current container size (fallback to reading from DOM if not set)
    const width = containerSize.width || puzzleContainer?.clientWidth || 0;
    if (!width) return;

    const puzzleCenterX = (bounds.minX + bounds.maxX) / 2;
    const screenCenterX = width / 2;
    const offsetX = screenCenterX - puzzleCenterX;

    for (const piece of pieces) {
      piece.x += offsetX;
    }
  }

  // Center puzzle vertically
  function centerVertically() {
    const bounds = getPuzzleBounds();
    if (!bounds) return;

    // Get current container size (fallback to reading from DOM if not set)
    const height = containerSize.height || puzzleContainer?.clientHeight || 0;
    if (!height) return;

    const puzzleCenterY = (bounds.minY + bounds.maxY) / 2;
    const screenCenterY = height / 2;
    const offsetY = screenCenterY - puzzleCenterY;

    for (const piece of pieces) {
      piece.y += offsetY;
    }
  }

  // Center both horizontally and vertically
  function centerBoth() {
    centerHorizontally();
    centerVertically();
  }

  // Auto-fit scale to fit the puzzle in view (visual only)
  function autoFitScale() {
    const bounds = getPuzzleBounds();
    if (!bounds) return;

    // Get current container size (fallback to reading from DOM if not set)
    const width = containerSize.width || puzzleContainer?.clientWidth || 0;
    const height = containerSize.height || puzzleContainer?.clientHeight || 0;
    if (!width || !height) return;

    const gutter = 40;
    const availableWidth = width - gutter * 2;
    const availableHeight = height - gutter * 2;

    // Calculate scale that fits the puzzle
    const scaleX = availableWidth / bounds.width;
    const scaleY = availableHeight / bounds.height;
    const newScale = Math.min(scaleX, scaleY);

    puzzleScale = newScale;
  }

  // Adjust scale manually (visual only, doesn't move pieces)
  function adjustScale(delta) {
    const newScale = Math.max(0.1, puzzleScale + delta);
    puzzleScale = newScale;
  }

  // Move all pieces by a delta
  function moveAllPieces(dx, dy) {
    for (const piece of pieces) {
      piece.x += dx;
      piece.y += dy;
    }
  }

</script>

<style>
  .editor-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100dvh - 2rem);
    position: relative;
  }

  .main-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
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
    background-color: red;
    overflow: visible;

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



  .snap-indicator {
    position: absolute;
    width: 10px;
    height: 10px;
    transform: translate(calc(var(--x) * 1px - 50%), calc(var(--y) * 1px - 50%));
    pointer-events: none;
    z-index: 150;
  }

  .snap-indicator .dot {
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    margin: 1px;
    background: #0ea5e9; /* sky-500 for grid */
  }

  .snap-indicator.vertex .dot {
    background: #22c55e; /* green-500 for vertex */
  }
.vertical,
.horizontal {
  position: absolute;
  background: rgba(255, 255, 255, 0.472);
  z-index: 1;
}

/* Trait vertical : centré horizontalement */
.vertical {
  width: 1px;
  height: 100%;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
}

/* Trait horizontal : centré verticalement */
.horizontal {
  width: 100%;
  height: 1px;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}
</style>

<div class="editor-wrapper">
      <span class="vertical"></span>
  <span class="horizontal"></span>
  <div class="main-content">
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
              viewBox={pieceData.viewBox}
            >
              <polygon
                use:draggable={{ pieceId: piece.id }}
                points={pieceData.points}
                fill={getPieceGreyShade(piece.id)} />
            </svg>
          {/key}
        </div>
      {/each}


      {#if snapIndicator}
        <div
          class="snap-indicator {snapIndicator.type === 'vertex' ? 'vertex' : 'grid'}"
          style="--x: {snapIndicator.x}; --y: {snapIndicator.y};"
        >
          <div class="dot"></div>
        </div>
      {/if}
    </div>

    <div class="toolbar">
      <textarea bind:value={importJson} placeholder="Paste puzzle data here..."></textarea>
      <div class="flex gap-2 items-center flex-wrap">
        <button class="border bg-amber-50 p-2 cursor-pointer text-sm" onclick={handleImport}>Import</button>
        <button class="border bg-amber-50 p-2 cursor-pointer text-sm" onclick={exportPuzzleData}>Export</button>
        <div class="border-l border-gray-400 h-6 mx-1"></div>

        <!-- Position Controls -->
        <span class="text-xs text-gray-600">Position:</span>
        <button class="border bg-blue-50 p-2 cursor-pointer text-sm" onclick={() => moveAllPieces(0, -5)}>↑</button>
        <button class="border bg-blue-50 p-2 cursor-pointer text-sm" onclick={() => moveAllPieces(-5, 0)}>←</button>
        <button class="border bg-blue-50 p-2 cursor-pointer text-sm" onclick={() => moveAllPieces(5, 0)}>→</button>
        <button class="border bg-blue-50 p-2 cursor-pointer text-sm" onclick={() => moveAllPieces(0, 5)}>↓</button>
        <button class="border bg-blue-100 p-2 cursor-pointer text-xs" onclick={centerBoth}>Center</button>

        <div class="border-l border-gray-400 h-6 mx-1"></div>

        <!-- Scale Controls -->
        <span class="text-xs text-gray-600">Scale:</span>
        <button class="border bg-green-50 p-2 cursor-pointer text-sm" onclick={() => adjustScale(-0.1)}>−</button>
        <span class="text-sm px-2 min-w-[3rem] text-center">{puzzleScale.toFixed(2)}x</span>
        <button class="border bg-green-50 p-2 cursor-pointer text-sm" onclick={() => adjustScale(0.1)}>+</button>
        <button class="border bg-green-100 p-2 cursor-pointer text-xs" onclick={autoFitScale}>Auto Fit</button>

        <div class="border-l border-gray-400 h-6 mx-1"></div>
        <button class="border bg-amber-50 p-2 cursor-pointer text-sm" onclick={() => showGrid = !showGrid}>
          {showGrid ? 'Hide' : 'Show'} Grid
        </button>
      </div>
    </div>
  </div>

</div>