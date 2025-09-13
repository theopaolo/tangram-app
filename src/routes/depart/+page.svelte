<script>
	import { onMount } from 'svelte';
	import Breadcrumb from '$lib/Breadcrumb.svelte';
	import { setShapesLayout } from '$lib/shapesStore.js';
	import { piecesStore } from '$lib/piecesStore.js';

	let showStaticTangram = $state(false);
	let found = $state(false);
	// Tangram pieces data with original colors
	const PIECES_DATA = {
		1: { color: '#A9BCC4' }, // Le Grand Triangle
		2: { color: '#FFF35C' }, // Le Triangle Moyen
		3: { color: '#2B3B6D' }, // Le Petit Triangle
		4: { color: '#7AC142' }, // Le Carré
		5: { color: '#6B8FD6' }, // Le Parallélogramme
		6: { color: '#3B5D3A' }, // Le Grand Trapèze
		7: { color: '#8B83D2' } // Le Petit Trapèze
	};

	// Function to get piece color (original if found, green if not)
	function getPieceColor(pieceId) {
		return piecesStore.hasPiece(pieceId.toString()) ? PIECES_DATA[pieceId].color : '#7AC142';
	}

	onMount(() => {
		// Initialize pieces store
		piecesStore.initialize();
		found = piecesStore.count;
		// Ensure shapes are set to depart layout (for animation continuity)
		setShapesLayout('depart', { animate: false });

		// Wait 600ms for animation to complete before showing static tangram
		setTimeout(() => {
			showStaticTangram = true;
		}, 600);
	});

	// Breadcrumb configuration
	const breadcrumbItems = [
		{ label: 'Accueil', href: '/' },
		{ label: 'Les Couleurs', current: true },
		{ label: 'Les Tangrams', disabled: true }
	];
</script>

<div
	class="whole text-corps flex h-screen flex-col items-center justify-evenly px-[20px] py-[70px] text-center"
>
	<div
		class="text-title inf-bold margin-auto fixed top-[20px] left-[20px] w-fit border bg-white px-[14px] py-1 tracking-[4%] drop-shadow-(--my-drop-shadow)"
	>
		CHROMOGRAM #1
	</div>

	<div class="py-[30px]">
		Pars à la recherche des 7 formes du Tangram pour débloquer le CHROMOGRAM !
	</div>

	<div class="tangram-container w-full px-[30px]">
		{#if showStaticTangram}
			<svg viewBox="0 0 300 300" class="mx-auto h-auto w-full max-w-[300px] -rotate-90">
				<polygon
					points="15,15 150,150 285,15"
					fill={getPieceColor(1)}
					stroke="#fff"
					stroke-width="1"
				/>
				<polygon
					points="15,15 150,150 15,285"
					fill={getPieceColor(2)}
					stroke="#fff"
					stroke-width="1"
				/>
				<polygon
					points="150,150 217,217 217,83"
					fill={getPieceColor(3)}
					stroke="#fff"
					stroke-width="1"
				/>
				<polygon
					points="150,150 217,217 150,285 83,217"
					fill={getPieceColor(4)}
					stroke="#fff"
					stroke-width="1"
				/>
				<polygon
					points="217,83 217,217 285,150 285,15"
					fill={getPieceColor(5)}
					stroke="#fff"
					stroke-width="1"
				/>
				<polygon
					points="15,285 150,285 83,217"
					fill={getPieceColor(6)}
					stroke="#fff"
					stroke-width="1"
				/>
				<polygon
					points="150,285 285,150 285,285"
					fill={getPieceColor(7)}
					stroke="#fff"
					stroke-width="1"
				/>
			</svg>
		{/if}
		<div class="text-mini text-right">{found} / 7</div>
	</div>

	<a class="py-[30px]" href="/scanner">
		<img src="/images/camera.svg" alt="camera icon" />
	</a>

	<Breadcrumb items={breadcrumbItems} />
</div>
