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

  const PIECES_DATA = {
    1: {  name: 'Le Grand Triangle',color: '#A9BCC4',story: 'Cette pièce représente la majestuosité de la pyramide de Khéops...',artwork: 'Pyramide de Khéops - Égypte Antique',points: '15,15 150,150 285,15' /* Large right triangle*/},
    2: {	name: 'Le Triangle Moyen',	color: '#FFF35C',	story: 'Inspiré des voiles des navires vénitiens...',	artwork: 'Les Marchands de Venise - Canaletto',	points: '15,15 150,150 15,285' /* Large left triangle */ },
    3: { 	name: 'Le Petit Triangle', 	color: '#2B3B6D', 	story: 'Cette petite forme géométrique fait écho...', 	artwork: "Livre d'Heures - Art Médiéval", 	points: '150,150 217,217 217,83' /* Small triangle (top right) */ },
    4: { 	name: 'Le Carré', 	        color: '#7AC142', 	story: "Le carré parfait représente l'équilibre...", 	artwork: 'Le Parthénon - Grèce Antique', 	points: '150,150 217,217 150,285 83,217' /* Square in center */ },
    5: { 	name: 'Le Parallélogramme', 	color: '#6B8FD6', 	story: 'Cette oeuvre fait partie de la série...', 	artwork: 'MC Mitout. Les plus belles heures...', 	points: '217,83 217,217 285,150 285,15' /* Parallelogram (right) */ },
    6: { 	name: 'Le Grand Trapèze', 	color: '#3B5D3A', 	story: 'Inspiré des toitures des pagodes japonaises...', 	artwork: 'Temple Kinkaku-ji - Architecture Japonaise', 	points: '15,285 150,285 83,217' /* Small triangle (bottom left) */ },
    7: { 	name: 'Le Petit Trapèze', 	color: '#8B83D2', 	story: 'Cette dernière pièce représente les rayons...', 	artwork: 'Impression, soleil levant - Claude Monet', 	points: '150,285 285,150 285,285' /* Triangle (bottom right) */ }
  };

  const noFlipPieces = [4,6]; // Les pièces Le Grand Triangle id:1, Le Carré id:4, Le Grand Trapèze id:6 n'on pas besoin de flip

  // --- STATE ---
  let activePieceId = $state(null);
  let importJson = $state('');
  let containerSize = $state({ width: 0, height: 0 });
  let puzzleScale = $state(1);
  let puzzleContainer;

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

        // The new center is simply the current pointer position minus the initial offset.
        piece.x = Math.round(e.clientX - offsetX);
        piece.y = Math.round(e.clientY - offsetY);
      },
      onEnd: (e, wasTap, wasDrag) => {
        if (wasTap) {
          rotateActivePiece();
        } else if (wasDrag) {
          playSound(dropSound);
        }
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

  // function centerPuzzle() {
  //   if (pieces.length === 0) return;
  //   // Find the average center of all piece anchor points (in virtual coords)
  //   const sum = pieces.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  //   const puzzleCenterX = sum.x / pieces.length;
  //   const puzzleCenterY = sum.y / pieces.length;

  //   // Center in virtual space
  //   const offsetX = VIRTUAL_SIZE / 2 - puzzleCenterX;
  //   const offsetY = VIRTUAL_SIZE / 2 - puzzleCenterY;

  //   for (const piece of pieces) {
  //     piece.x = Math.round(piece.x + offsetX);
  //     piece.y = Math.round(piece.y + offsetY);
  //   }
  // }

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

<div class="editor-wrapper" onpointerdown={unlockAudio}>
  <div
    bind:this={puzzleContainer}
    class="editor-canvas"
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
    <div class="flex gap-2">
      <button class="border bg-amber-50 p-2 cursor-pointer text-sm" onclick={handleImport}>Import</button>
      <button class="border bg-amber-50 p-2 cursor-pointer text-sm" onclick={fitPuzzle}>Fit</button>
      <button class="border bg-amber-50 p-2 cursor-pointer text-sm" onclick={exportPuzzleData}>Export</button>
    </div>
  </div>
</div>
