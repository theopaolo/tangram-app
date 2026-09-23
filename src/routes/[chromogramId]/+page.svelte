<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { setActiveChromogram, hasChromogram } from '$lib/chromogramStore.js';
	import { piecesStore } from '$lib/piecesStore.js';
	import { onMount } from 'svelte';

	// Bare set URL (e.g. /chromo-2): switch the active chromogramme set, then
	// land on the hub. Unknown ids just go home. Scanning a specific piece uses
	// the two-segment route /<set>/<pieceId>.
	const chromogramId = $derived($page.params.chromogramId);

	onMount(() => {
		if (hasChromogram(chromogramId)) {
			setActiveChromogram(chromogramId);
			piecesStore.initialize();
			goto('/home');
		} else {
			goto('/');
		}
	});
</script>

<div class="flex min-h-svh items-center justify-center bg-white">
	<div class="text-xl inf-reg">Chargement…</div>
</div>
