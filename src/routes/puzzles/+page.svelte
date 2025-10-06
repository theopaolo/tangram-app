<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Breadcrumb from '$lib/Breadcrumb.svelte';
  import { getAllPuzzles, PIECES_DATA_WITH_VIEWBOX, PIECE_GREY_COLOR } from '$lib/puzzleData.js';
  import { PIECES_DATA } from '$lib/piecesData';

	let refreshTrigger = $state(0);

	// Get all puzzles
	const puzzles = getAllPuzzles();

  // Read progress: includes completed flag and matches
  function getProgress(puzzleId) {
    if (typeof localStorage === 'undefined') return { matches: [], completed: false };
    try {
      const progressKey = `puzzle_${puzzleId}_progress`;
      const saved = localStorage.getItem(progressKey);
      if (!saved) return { matches: [], completed: false };
      const progress = JSON.parse(saved);
      if (progress.puzzleId != puzzleId) return { matches: [], completed: false };
      const matches = Array.isArray(progress.matches)
        ? progress.matches
        : Array.isArray(progress.matchedTargetIds)
          ? progress.matchedTargetIds.map((tid) => ({ targetId: tid, pieceId: null }))
          : [];
      const completed = Boolean(progress.completed) || matches.length === Object.keys(PIECES_DATA).length;
      return { matches, completed };
    } catch (e) {
      return { matches: [], completed: false };
    }
  }

  // Check if a puzzle is completed using saved completed flag (fallback: match count)
  function isPuzzleCompleted(puzzleId) {
    const { completed } = getProgress(puzzleId);
    return completed;
  }

	// Get completed puzzles from progress data
	let completedPuzzles = $derived(puzzles.map(p => p.id).filter(id => isPuzzleCompleted(id)));
	let allPuzzlesCompleted = $derived(completedPuzzles.length === puzzles.length);

	// --- FUNCTIONS ---
	onMount(() => {
		applyCol();

		// Listen for storage changes to refresh colors when returning from puzzle
		if (typeof window !== 'undefined') {
			window.addEventListener('storage', handleStorageChange);
			window.addEventListener('focus', handlePageFocus);
		}

		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('storage', handleStorageChange);
				window.removeEventListener('focus', handlePageFocus);
			}
		};
	});

	function handleStorageChange(e) {
		// Refresh when puzzle progress changes
		if (e.key?.startsWith('puzzle_')) {
			refreshTrigger++;
		}
	}

	function handlePageFocus() {
		// Refresh when returning to the page
		refreshTrigger++;
	}

  // Get the appropriate color for a target slot based on the matched piece that occupies it
  function getPieceColor(targetId, puzzleId, _refreshTrigger) {
    const { matches } = getProgress(puzzleId);
    const match = matches.find((m) => m && m.targetId === targetId);
    if (!match) return PIECE_GREY_COLOR;
    const pieceId = match.pieceId ?? targetId; // fallback to target id if older format
    return PIECES_DATA_WITH_VIEWBOX[pieceId].color;
  }


	function applyCol() {
  	if (typeof document === 'undefined') return; // SSR guard
		Object.keys(PIECES_DATA).forEach((id) => {
			document.documentElement.style.setProperty(
				`--c${id}`, PIECES_DATA[id].color
			);
		});
	}

  // Calculate preview scale for puzzle cards
  function calculatePreviewScale(puzzleData, containerWidth = null, containerHeight = null) {
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

    // Use container dimensions if provided, otherwise use window width as fallback
    const availableWidth = containerWidth || (typeof window !== 'undefined' ? window.innerWidth - 80 : 350); // 80px for padding and margins
    const availableHeight = containerHeight || 520; // Leave some margin from 550px container height

    return Math.min(availableWidth / puzzleWidth, availableHeight / puzzleHeight) * 0.8;
  }

  // Calculate preview position for puzzle pieces
  function calculatePreviewPosition(piece, puzzleData, scale, containerWidth = null, containerHeight = null) {
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

    // Use dynamic center coordinates based on container dimensions
    const availableWidth = containerWidth || (typeof window !== 'undefined' ? window.innerWidth - 80 : 350);
    const availableHeight = containerHeight || 520;
    const previewCenterX = availableWidth / 2;
    const previewCenterY = availableHeight / 2;

    return {
      x: (piece.x - centerX) * scale + previewCenterX,
      y: (piece.y - centerY) * scale + previewCenterY
    };
  }

  function selectPuzzle(id) {
    goto(`/puzzle/${id}`);
  }

	const breadcrumbItems = [
		{ label: 'Accueil', href: '/home' },
		{ label: 'Le Chromogram', href: '/start' },
		{ label: 'Les Tangrams', current: true }
	];

	onMount(async () => {
		// Import scroll freeze utility and unfreeze scroll for puzzles page
		const { unfreezeScroll, freezeScroll } = await import('$lib/utils/scrollFreeze.js');
		unfreezeScroll();

		// Return cleanup function to restore scroll freeze when leaving this page
		return () => {
			freezeScroll();
		};
	});
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
    /* padding: 20px; */
    /* margin-bottom: 40px; */
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
    overflow: hidden;
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

  .puzzle-card:last-of-type{
  border: none !important;
  }
  .blipo{
  animation: blipoColorCycle 4s steps(7) infinite;
  }
@keyframes blipoColorCycle {
  0%, 14% { background-color: var(--c1); }
  14.01%, 28% { background-color: var(--c2); }
  28.01%, 42% { background-color: var(--c3); }
  42.01%, 57% { background-color: var(--c4); }
  57.01%, 71% { background-color: var(--c5); }
  71.01%, 85% { background-color: var(--c6); }
  85.01%, 100% { background-color: var(--c7); }
}
  .complet_1{
    bottom:10%;
    left:10%;
  }
  .complet_2{
    bottom:10%;
    right:10%;
  }
  .complet_3{
    top:10%;
    left:10%;
  }
  .complet_4{
    bottom:10%;
    left:10%;
  }
  .complet_5{
    top:10%;
    left:10%;
  }
  .complet_6{
    top:10%;
    right:10%;
  }
  .complet_7{
    bottom:10%;
    right:10%;
  }
</style>

<!-- Title -->
  <header class="fixed left-5 top-0 z-10 flex items-center pt-4 pb-2 bg-white w-full">
    <a href="/start" class="flex gap-2" aria-label="Retour au Chromogram">
      <img
      src="/images/retour_chromo.svg"
      alt="retour"
      class="h-auto !w-[162px]"
        />
    </a>

    <!-- <a href="/start" class="right-5 absolute" aria-label="Retour au Chromogram">
      <img
      src="/images/retour_chromo.svg"
      alt="retour"
      class="h-auto !w-[162px]"
        />
    </a> -->

  </header>

<!-- Puzzle Selection Screen -->
<!-- <div class="p-5 mt-[90px]"> -->
  <div class="px-10">
    {#if allPuzzlesCompleted}
      <div class="text-center absolute top-[100px] m-auto left-0 right-0 z-1">
        <p>Bravo tu as completé les 7 tangrams  !<br/>Télécharge un fond d'écran !</p>
        <div class="w-[124px] h-[68px] m-auto relative mt-2">
          <div class="blipo w-[26px] h-[42px] bg-black absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex">
            <img style="width:80%;margin:auto" src="/images/tangrams_b&w.svg" alt="tangrams">
          </div>
          <img
            src="/images/fond_ecran_full.png"
            alt=""
            class=""
        />
        </div>
      </div>
    {:else}
      <div class="text-center absolute top-[100px] m-auto left-0 right-0 z-1">
        <p>Voici les 7 tangrams à compléter selon ton envie !<br/>Scrolle pour les découvrir !</p>
      </div>
    {/if}

  <div class="flex flex-col">
    {#each puzzles as puzzle (puzzle.id)}
      {@const previewScale = calculatePreviewScale(puzzle.data)}
      <div class="puzzle-card h-svh border-[#ddd] border-b justify-center flex" role="button" tabindex="0"
          onclick={() => selectPuzzle(puzzle.id)}
          onkeydown={(e) => e.key === 'Enter' && selectPuzzle(puzzle.id)}>
        <div class="puzzle-preview w-full">
          {#each puzzle.data as originalPiece}
            {@const pieceData = PIECES_DATA_WITH_VIEWBOX[originalPiece.id]}
            {@const previewPos = calculatePreviewPosition(originalPiece, puzzle.data, previewScale)}
            {@const pieceColor = getPieceColor(originalPiece.id, puzzle.id, refreshTrigger)}
            <div
              class="tangram-piece"
              style="
                --x: {previewPos.x};
                --y: {previewPos.y};
                --w: {pieceData.width * previewScale}px;
                --h: {pieceData.height * previewScale}px;
                --rotation: {originalPiece.rotation}deg;
                --scaleX: 1;
              "
            >
              <svg class="tangram-piece-svg w-full" viewBox={pieceData.viewBox}>
                <polygon points={pieceData.points} fill={pieceColor} opacity={pieceColor === PIECE_GREY_COLOR ? 1 : 1} />
              </svg>
            </div>
          {/each}

          {#if getProgress(puzzle.id).completed}
            <div class="absolute complet_{puzzle.id}">
              <img
                src="/images/complet_{puzzle.id}.svg"
                alt="complet #{puzzle.id}"
                class=""
              />
            </div>
          {/if}

          <div class="absolute bottom-0 left-0 p-5 text-intro leading-none">#{puzzle.id}</div>

          <!-- <div class="status {puzzle.completed ? 'completed' : 'incomplete'} absolute bottom-0 left-0 right-0 margin-auto p-5 text-intro leading-none"> {puzzle.completed ? 'Terminé' : 'À compléter'}</div> -->

        </div>

        {#if !getProgress(puzzle.id).completed}
          <div class="absolute bottom-[10svh] right-[10svh]">
            <img
              src="/images/clik_tangram.svg"
              alt="enter"
              class=""
            />
          </div>
        {/if}
        <!-- <p>{puzzle.description}</p> -->
        <!-- <div class="status {puzzle.completed ? 'completed' : 'incomplete'}"></div> -->
      </div>
    {/each}
  </div>
</div>

<footer class="fixed bottom-0 left-0 z-40 flex w-full items-center justify-between px-5 py-2">
	<Breadcrumb items={breadcrumbItems} />
</footer>