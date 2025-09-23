<script>
	import { goto } from '$app/navigation';
	import OptimizedQRScanner from '$lib/OptimizedQRScanner.svelte';
	import { PIECES_DATA } from '$lib/piecesData';
	import { piecesStore } from '$lib/piecesStore.js';
	import { onMount } from 'svelte';
	import Breadcrumb from '$lib/Breadcrumb.svelte';
	import { isAideOpen } from '$lib/stores/aideStore.js';

	const breadcrumbItems = [
		{ label: 'Accueil', href: '/home' },
		{ label: 'Les Couleurs', href: '/start' },
		{ label: 'Scanner', current: true},
		// { label: 'Les Tangrams', disabled: true }
	];

	let isScanning = $state(true);

	onMount(async () => {
		// Initialize pieces store
		piecesStore.initialize();

		// Import scroll freeze utility
		const { freezeScroll, unfreezeScroll } = await import('$lib/utils/scrollFreeze.js');

		// Freeze scroll when scanner is active
		freezeScroll();

		return () => {
			unfreezeScroll();
		};
	});

	function handleClose() {
		goto('/start');
	}

	function handleQRDetected(event) {
		const { data } = event.detail;
		const scannedId = data.toString().trim();

		if (PIECES_DATA[scannedId]) {
			// Add the scanned piece to the store
			piecesStore.addPiece(scannedId);

			// Brief delay to show success feedback before navigation
			setTimeout(() => {
				goto(`/animation/${scannedId}`);
			}, 1500);
		}
	}

	function handleScannerError(event) {
		// Scanner component handles error display
		console.error('Scanner error:', event.detail.message);
	}
</script>


<style>
	/* html,body{
		height: 100svh;
	} */
	
	.scanner-fullscreen {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 30;
		background: #fff;
	}
</style>



<div class="title text-title inf-bold fixed top-5 left-5 z-40 mx-aut w-max border bg-white px-[14px] py-1 tracking-[4%] drop-shadow-[var(--my-drop-shadow)]">
	CHROMOGRAM #1
</div>

<!-- <div class="fixed top-3 right-5 z-40">
	<button onclick={() => isAideOpen.open()} aria-label="Aide" class="flex bg-transparent border-none cursor-pointer flex flex-row gap-2">
		<img class="mt-2" src="/images/quoi.svg" alt="camera" />
		<div class="text-inter inf-bold">?</div>
	</button>
</div> -->

<div class="scanner-fullscreen">
	<OptimizedQRScanner
		isActive={isScanning}
		targetFPS={30}
		scanAreaSize={250}
		enableMultiScale={true}
		fullscreen={true}
		on:qrdetected={handleQRDetected}
		on:error={handleScannerError}
		on:close={handleClose}
	/>
</div>

<footer class="fixed bottom-0 left-0 z-40 flex w-full items-center justify-between px-5 py-2">
	<Breadcrumb items={breadcrumbItems} />
</footer>