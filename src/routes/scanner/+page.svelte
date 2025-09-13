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
	.scanner-fullscreen {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 50;
		background: #000;
	}
</style>
