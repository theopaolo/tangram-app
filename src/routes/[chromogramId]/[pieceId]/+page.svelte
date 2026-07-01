<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { piecesStore } from '$lib/piecesStore.js';
	import { setActiveChromogram, getArtworks, getActiveArtworks, hasChromogram } from '$lib/chromogramStore.js';
	import { onMount } from 'svelte';

	// Extract params from URL
	const chromogramId = $derived($page.params.chromogramId);
	const pieceId = $derived($page.params.pieceId);

	onMount(() => {
		// Switch to the scanned set so progress + colours are scoped to it.
		const knownSet = hasChromogram(chromogramId);
		if (knownSet) setActiveChromogram(chromogramId);

		// Initialize store (now keyed to the active set)
		piecesStore.initialize();

		// Validate piece exists within the resolved set
		const artworks = knownSet ? getArtworks(chromogramId) : getActiveArtworks();
		if (artworks[pieceId]) {
			// Add piece to store (saves to localStorage)
			piecesStore.addPiece(pieceId);

			// Redirect to index page
			goto('/');
		}
	});
</script>

<!-- Loading state while redirecting -->
<div class="flex items-center justify-center min-h-svh bg-white">
	<div class="text-center">
		<div class="text-xl inf-reg">Chargement...</div>
	</div>
</div>
