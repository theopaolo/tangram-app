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
		{ label: 'Le Chromogram', href: '/start' },
		{ label: 'Scanner', current: true},
		// { label: 'Les Tangrams', disabled: true }
	];

	let isScanning = $state(true);

	// Debug state
	let debugData = $state({
		rawData: null,
		extractedId: null,
		isValid: false,
		timestamp: null,
		fullData: null
	});

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
		const scannedData = data.toString().trim();

		// Extract piece ID from URL format "@https://chromogramrac.com/X/Y"
		// Remove @ if present, then extract the path and get the first number
		let scannedId = null;

		const cleanData = scannedData.replace(/^@/, ''); // Remove leading @

		try {
			// Try to parse as URL
			const url = new URL(cleanData);
			const pathParts = url.pathname.split('/').filter(Boolean); // Remove empty strings
			scannedId = pathParts[0]; // Get first number (e.g., "1" from "/1/1")
		} catch (e) {
			// If not a valid URL, try to extract from plain format "X/Y"
			scannedId = cleanData.split('/')[0];
		}

		// Update debug data
		debugData = {
			rawData: scannedData,
			extractedId: scannedId,
			isValid: !!PIECES_DATA[scannedId],
			timestamp: new Date().toLocaleTimeString(),
			fullData: event.detail
		};

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

	.debug-panel {
		font-family: 'Inf Reg', monospace;
		max-height: calc(100vh - 100px);
		overflow-y: auto;
	}

	.debug-panel h3 {
		font-family: 'Inf Bold', sans-serif;
	}

	.debug-content strong {
		font-family: 'Inf Bold', sans-serif;
	}

	@media (max-width: 640px) {
		.debug-panel {
			max-width: calc(100vw - 100px);
			right: 10px;
		}
	}
</style>



<div class="title text-title inf-bold fixed top-5 left-5 z-40 mx-aut w-max border bg-white px-[14px] py-1 tracking-[4%] drop-shadow-[var(--my-drop-shadow)]">
	<a href="/start">CHROMOGRAM #1</a>
</div>

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

<!-- Debug Panel -->
<div class="debug-panel fixed top-20 right-5 z-50 bg-white border-2 border-black p-3 shadow-lg max-w-xs">
	<h3 class="text-sm font-bold mb-2 inf-bold">QR Debug Info</h3>
	{#if debugData.rawData}
		<div class="debug-content text-xs space-y-1 inf-reg">
			<div>
				<strong>Time:</strong> {debugData.timestamp}
			</div>
			<div>
				<strong>Raw Data:</strong>
				<div class="bg-gray-100 p-1 mt-1 break-all font-mono text-[10px]">
					{debugData.rawData}
				</div>
			</div>
			<div>
				<strong>Extracted ID:</strong>
				<span class="bg-yellow-100 px-1">{debugData.extractedId}</span>
			</div>
			<div>
				<strong>Valid:</strong>
				<span class={debugData.isValid ? 'text-green-600' : 'text-red-600'}>
					{debugData.isValid ? '✓ Yes' : '✗ No'}
				</span>
			</div>
			{#if debugData.fullData}
				<details class="mt-2">
					<summary class="cursor-pointer hover:text-blue-600">Full Event Data</summary>
					<pre class="bg-gray-100 p-1 mt-1 text-[9px] overflow-auto max-h-32">{JSON.stringify(debugData.fullData, null, 2)}</pre>
				</details>
			{/if}
		</div>
	{:else}
		<p class="text-xs text-gray-500 inf-reg">No QR code scanned yet</p>
	{/if}
</div>

<footer class="fixed bottom-0 left-0 z-40 flex w-full items-center justify-between px-5 py-2">
	<Breadcrumb items={breadcrumbItems} />
</footer>