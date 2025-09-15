<script>
	import { goto } from '$app/navigation';
	import OptimizedQRScanner from '$lib/OptimizedQRScanner.svelte';
	import { PIECES_DATA } from '$lib/piecesData';
	import { onMount } from 'svelte';

	let isScanning = $state(true);

	onMount(() => {
		// Prevent scrolling when scanner is active
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = '';
		};
	});

	function handleClose() {
		goto('/start');
	}

	function handleQRDetected(event) {
		const { data } = event.detail;
		const scannedId = data.toString().trim();

		if (PIECES_DATA[scannedId]) {
			// Brief delay to show success feedback before navigation
			setTimeout(() => {
				goto(`/piece/${scannedId}`);
			}, 1500);
		}
	}

	function handleScannerError(event) {
		// Scanner component handles error display
		console.error('Scanner error:', event.detail.message);
	}
</script>

<div
	class="title text-title inf-bold fixed top-5 left-5 z-100 mx-auto w-fit w-max bg-white px-[14px] py-1 tracking-[4%] "
>
	CHROMOGRAM #1
</div>
<div class="text-inter inf-bold fixed top-2 right-5 z-100">?</div>

<div class="fixed top-3 right-13 z-100">
	<img src="/images/quoi.svg" alt="camera" class="" />
</div>

	<div class="text-mini fixed bottom-3.5 left-5 z-100">Accueil > Les Couleurs > Les Tangrams</div>
	<div class="text-mini fixed right-5 bottom-3.5 z-100">Crédits</div>

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

<style>
	.qr-scanner-container{
		border: 2px solid;
	}
	.scanner-fullscreen {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 50;
		background: #fff;
	}
</style>
