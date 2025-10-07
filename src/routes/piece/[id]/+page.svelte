<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { piecesStore } from '$lib/piecesStore.js';
	import { onMount } from 'svelte';


	import { PIECES_DATA } from '$lib/piecesData';

	// --- DERIVED STATE --- (Principle 2: DRY)
	// Let Svelte derive state from the reactive `page` store.
	let pieceId = $derived(page.params.id);
	let currentPiece = $derived(PIECES_DATA[pieceId]);
	let totalPiece = $derived(piecesStore.length);

	// --- LIFECYCLE & EFFECTS ---
	onMount(() => {
		piecesStore.initialize();
	});


	// --- FUNCTIONS ---
	function capturePiece() {
		if (pieceId) {
			piecesStore.addPiece(pieceId);
		}
	}

	// --- (Principle 3: Trust Reactivity)
	// This function only changes the source of truth (the URL).
	function navigateToPiece(id) {
		goto(`/piece/${id}`);
	}
</script>

{#if currentPiece}
	<div class="max-w-sm border p-4">
		<h2 class="mb-4 text-4xl">
			{currentPiece.name}
		</h2>

		<div class="mb-4 h-80 w-full" style="background-color: {currentPiece.color};">
			<img src="" alt="" />
		</div>
<!-- 
		<div class="mb-4 flex flex-col gap-4">
			<p>{currentPiece.artwork}</p>
			<p>{currentPiece.story}</p>
		</div>

		<svg viewBox="0 0 300 300" width="100%" preserveAspectRatio="xMidYMid meet" class="-rotate-90">
			{#each Object.entries(PIECES_DATA) as [id, piece]}
				<polygon
					points={piece.points}
					fill={piece.color}
					stroke="#fff"
					stroke-width="1"
					style="cursor: pointer;"
					onclick={() => navigateToPiece(id)}
				>
					<title>{piece.name}</title>
				</polygon>
			{/each}
		</svg> -->

		<div class="mx-auto flex flex-col gap-2 border-t border-gray-600 pt-8 text-center">
		

			<button class="cursor-pointer border" onclick={capturePiece}> Capturer la piece </button>

			<p>id: {pieceId} found: {$piecesStore.join(', ')} total: {totalPiece}</p>
		</div>
	</div>
{/if}
