<script>
  import { goto } from '$app/navigation';
  import { getAllPuzzles, PIECES_DATA_WITH_VIEWBOX } from '$lib/puzzleData.js';

  const puzzles = getAllPuzzles();

  // Calculate preview scale for puzzle cards
  function calculatePreviewScale(puzzleData) {
    // Get transformed points for all pieces
    const allVertices = puzzleData.flatMap(pieceState => {
      const pieceData = PIECES_DATA_WITH_VIEWBOX[pieceState.id];
      const originX = 150, originY = 150;
      const angle = pieceState.rotation * (Math.PI / 180);
      const cos = Math.cos(angle), sin = Math.sin(angle);
      const basePoints = pieceData.points.split(' ').map((p) => p.split(',').map(Number));

      return basePoints.map(([px, py]) => {
        let x = px - originX, y = py - originY;
        const rx = x * cos - y * sin;
        const ry = x * sin + y * cos;
        return { x: rx + pieceState.x, y: ry + pieceState.y };
      });
    });

    const xs = allVertices.map(p => p.x);
    const ys = allVertices.map(p => p.y);
    const bounds = {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };

    const puzzleWidth = bounds.maxX - bounds.minX;
    const puzzleHeight = bounds.maxY - bounds.minY;
    const previewSize = 220; // Available space in preview

    return Math.min(previewSize / puzzleWidth, previewSize / puzzleHeight) * 0.8;
  }

  // Calculate preview position for puzzle pieces
  function calculatePreviewPosition(piece, puzzleData, scale) {
    // Get transformed points for all pieces to find bounds
    const allVertices = puzzleData.flatMap(pieceState => {
      const pieceData = PIECES_DATA_WITH_VIEWBOX[pieceState.id];
      const originX = 150, originY = 150;
      const angle = pieceState.rotation * (Math.PI / 180);
      const cos = Math.cos(angle), sin = Math.sin(angle);
      const basePoints = pieceData.points.split(' ').map((p) => p.split(',').map(Number));

      return basePoints.map(([px, py]) => {
        let x = px - originX, y = py - originY;
        const rx = x * cos - y * sin;
        const ry = x * sin + y * cos;
        return { x: rx + pieceState.x, y: ry + pieceState.y };
      });
    });

    const xs = allVertices.map(p => p.x);
    const ys = allVertices.map(p => p.y);
    const bounds = {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const previewCenterX = 125; // Half of 250px preview width
    const previewCenterY = 125; // Half of 250px preview height

    return {
      x: (piece.x - centerX) * scale + previewCenterX,
      y: (piece.y - centerY) * scale + previewCenterY
    };
  }

  function selectPuzzle(id) {
    goto(`/puzzle/${id}`);
  }
</script>

<style>
 

  /* Puzzle selection styles */
  .puzzle-selection {
    position: absolute;
    inset: 0;
    z-index: 15;
    background: white;
    display: flex;
    flex-direction: column;
    padding-top: 120px;
  }

  .puzzle-gallery {
    display: flex;
    overflow-x: auto;
    gap: 2rem;
    padding: 2rem;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .puzzle-gallery::-webkit-scrollbar {
    display: none;
  }

  .puzzle-card {
    padding: 20px;
    margin-bottom: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    scroll-snap-align: center;
  }

  .puzzle-preview {
    width: 100%;
    height: 550px;
    position: relative;
    margin-bottom: 1rem;
    overflow: hidden;
    background: #f2f2f2;
  }

  .puzzle-preview .tangram-piece {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--w);
    height: var(--h);
    transform: translate(calc(var(--x) * 1px - 50%), calc(var(--y) * 1px - 50%)) rotate(var(--rotation)) scaleX(var(--scaleX));
    pointer-events: none;
  }

  .tangram-piece-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }

  .tangram-piece-svg polygon {
    stroke: transparent;
    stroke-width: 0;
    pointer-events: auto;
  }

  .puzzle-card h3 {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .puzzle-card p {
    font-size: 0.9rem;
    text-align: center;
    color: #666;
    margin-bottom: 1rem;
  }

  .puzzle-card .status {
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
    font-weight: bold;
  }

  .puzzle-card .status.completed {
    background: #4CAF50;
    color: white;
  }

  .puzzle-card .status.incomplete {
    background: #e0e0e0;
    color: #666;
  }

  /* .selection-header {
    text-align: center;
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .selection-header h2 {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 1rem;
  } 

  .selection-header p {
    font-size: 1rem;
    line-height: 1.6;
    color: #333;
  }
    */
</style>

<!-- Title -->
<div class="">
	<div
		class="title text-title inf-bold fixed top-5 left-5 z-100 mx-aut w-max border bg-white px-[14px] py-1 tracking-[4%] drop-shadow-[var(--my-drop-shadow)] s-W8Sv8E2Q9PhB"
	>
		CHROMOGRAM #1
	</div>
</div>

<!-- Navigation breadcrumb -->
<div class="z-100 bottom-3.5 left-5 fixed text-mini cursor-pointer">
  Accueil > Les Couleurs > Les Tangrams
</div>
<div class="z-100 fixed text-mini bottom-3.5 right-5 cursor-pointer">Crédits</div>

<!-- Puzzle Selection Screen -->
<div class="p-5 mt-[90px]">
  <div class="text-center">
    <h2>Voici les tangrams à compléter !</h2>
    <p>Tu peux choisir dans quel ordre tu veux commencer.<br/>
       Scrolle pour découvrir les 7 tangrams et appuie sur un d'eux pour commencer à le colorer !</p>
  </div>

  <div class="flex flex-col">
    {#each puzzles as puzzle}
      {@const previewScale = calculatePreviewScale(puzzle.data)}
      <div class="puzzle-card" onclick={() => selectPuzzle(puzzle.id)} role="button" tabindex="0"
           onkeydown={(e) => e.key === 'Enter' && selectPuzzle(puzzle.id)}>
        <div class="puzzle-preview w-full">
          {#each puzzle.data as piece}
            {@const pieceData = PIECES_DATA_WITH_VIEWBOX[piece.id]}
            {@const previewPos = calculatePreviewPosition(piece, puzzle.data, previewScale)}
            <div
              class="tangram-piece"
              style="
                --x: {previewPos.x};
                --y: {previewPos.y};
                --w: {pieceData.width * previewScale}px;
                --h: {pieceData.height * previewScale}px;
                --rotation: {piece.rotation}deg;
                --scaleX: 1;
              "
            >
              <svg class="tangram-piece-svg w-full" viewBox={pieceData.viewBox}>
                <polygon points={pieceData.points} fill={pieceData.color} />
              </svg>
            </div>
          {/each}
          <div class="absolute bottom-0 left-0 p-5 text-intro leading-none">{puzzle.id}</div>

        </div>
        <!-- <p>{puzzle.description}</p> -->
        <div class="status {puzzle.completed ? 'completed' : 'incomplete'}">
          {puzzle.completed ? 'Terminé' : 'À compléter'}
        </div>
      </div>
    {/each}
  </div>

  <div class="text-center mt-8">
    <p class="text-mini">Les autres Tangrams<br/>sont dessous</p>
  </div>
</div>
