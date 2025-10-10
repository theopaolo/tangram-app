<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { piecesStore } from '$lib/piecesStore.js';
	import { PIECES_DATA } from '$lib/piecesData';
	import { onMount } from 'svelte';

	// Extract pieceId from URL params
	const pieceId = $derived($page.params.pieceId);

	onMount(() => {
		// Initialize store
		piecesStore.initialize();

		// Validate piece exists
		if (PIECES_DATA[pieceId]) {
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
