<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Breadcrumb from '$lib/Breadcrumb.svelte';
  import { getAllPuzzles, PIECES_DATA_WITH_VIEWBOX } from '$lib/puzzleData.js';

  const puzzles = getAllPuzzles();

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

  .puzzle-card:last-of-type{
  border: none !important;
  }

  .puzzle-card .status {
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
    font-weight: bold;
  }

  .puzzle-card .status.completed {
    background: #fff;
    color: rgb(0, 0, 0);
  }

  .puzzle-card .status.incomplete {
    background: #fff;
    color: #a6a5a5;
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
			
				<!-- <svg  width="32" height="32" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" >
				<path d="M12.9639 0.700195L13.0068 0.705078C13.0168 0.704069 13.0269 0.700195 13.0371 0.700195H24.9258C25.0915 0.700195 25.2256 0.834315 25.2256 1V25C25.2256 25.0795 25.1939 25.1557 25.1377 25.2119C25.0814 25.2681 25.0053 25.2998 24.9258 25.2998H1C0.83434 25.2998 0.700237 25.1657 0.700195 25V1C0.700195 0.834315 0.834315 0.700195 1 0.700195H12.9639ZM1.72559 24.7002H24.2002L18.7324 19.249C18.7314 19.248 18.7305 19.2471 18.7295 19.2461L12.9629 13.4971L1.72559 24.7002ZM1.2998 24.2764L12.54 13.0713L6.76758 7.21094L1.2998 1.72559V24.2764ZM19.4082 19.0752L24.626 24.2764V13.8408L19.4082 19.0752ZM13.4219 13.042L18.96 18.5967L24.502 13.0713L18.9814 7.46484L13.4219 13.042ZM13.0342 12.5742L18.2275 7.2998H7.74414L13.0342 12.5742ZM19.1816 6.8125H19.2119L24.626 12.2432V1.2998H13.7539L19.1816 6.8125ZM7.14258 6.7002H18.2227L12.8389 1.2998H1.72656L7.14258 6.7002Z" fill="black"/>
				</svg> -->

				<img
				src="/images/retour_chromo.svg"
				alt="retour"
				class="h-auto !w-[162px]"
					/>
			</a>
		</header>

<!-- Puzzle Selection Screen -->
<!-- <div class="p-5 mt-[90px]"> -->
  <div class="px-10">
  <div class="text-center absolute top-[110px] m-auto left-0 right-0 z-1 ">
    <p>Voici les 7 tangrams à compléter selon ton envie !<br/>Scrolle pour les découvrir !</p>
  </div>

  <div class="flex flex-col">
    {#each puzzles as puzzle}
      {@const previewScale = calculatePreviewScale(puzzle.data)}
      <div class="puzzle-card h-svh border-[#ddd] border-b justify-center flex" role="button" tabindex="0"
          onclick={() => selectPuzzle(puzzle.id)} 
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
          <!-- <div class="absolute bottom-0 left-0 p-5 text-intro leading-none">#{puzzle.id}</div> -->

          {#if puzzle.completed}
            <div class="absolute complet_{puzzle.id}">
              <img
                src="/images/complet_{puzzle.id}.svg"
                alt="complet #{puzzle.id}"
                class=""
              />
            </div>
          {:else}
            <!-- rien -->
          {/if}


          <div class="absolute top-0 left-0 p-5 text-intro leading-none">#{puzzle.id}</div>

          <!-- <div class="status {puzzle.completed ? 'completed' : 'incomplete'} absolute bottom-0 left-0 right-0 margin-auto p-5 text-intro leading-none"> {puzzle.completed ? 'Terminé' : 'À compléter'}</div> -->

        </div>
    
        <div class="absolute bottom-[10svh] right-[10svh]">
          <img
            src="/images/clik_tangram.svg"
            alt="enter"
            class=""
          />
        </div>
        <!-- <p>{puzzle.description}</p> -->
        <!-- <div class="status {puzzle.completed ? 'completed' : 'incomplete'}"></div> -->
      </div>
    {/each}
  </div>
</div>

<footer class="fixed bottom-0 left-0 z-40 flex w-full items-center justify-between px-5 py-2">
	<Breadcrumb items={breadcrumbItems} />
</footer>
