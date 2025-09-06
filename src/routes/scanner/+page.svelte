<script>
	import { goto } from '$app/navigation';
	import OptimizedQRScanner from '$lib/OptimizedQRScanner.svelte';
	import { PIECES_DATA } from '$lib/piecesData';
	import { piecesStore } from '$lib/piecesStore.js';
	import { onMount } from 'svelte';

	// --- STATE ---
	let isScanning = $state(false);
	let scanMessage = $state('');
	let scanStatus = $state('idle');
	let isFullscreen = $state(false);
	let totalFound = $state(0);
	let foundPieces = $state([]);
	// --- FUNCTIONS ---
	onMount(() => {
		piecesStore.initialize();
		totalFound = piecesStore.count;
		foundPieces = piecesStore.pieces;
	});

	function startScanning() {
		isScanning = true;
		isFullscreen = true;
		scanStatus = 'scanning';
		scanMessage = 'Scanner actif - Recherche de QR codes...';

		// Add a small delay to let the fullscreen animation start
		setTimeout(() => {
			document.body.style.overflow = 'hidden'; // Prevent scroll in fullscreen
		}, 100);
	}

	function stopScanning() {
		isScanning = false;
		isFullscreen = false;
		scanStatus = 'idle';
		scanMessage = '';

		// Restore scroll after animation
		setTimeout(() => {
			document.body.style.overflow = '';
		}, 600);
	}

	// Handle QR code detection from the optimized scanner
	function handleQRDetected(event) {
		const { data } = event.detail;
		const scannedId = data.toString().trim();

		if (PIECES_DATA[scannedId]) {
			// Success feedback
			scanStatus = 'success';
			scanMessage = `Pièce trouvée: ${PIECES_DATA[scannedId].color_name}`;

			// Stop scanning and redirect after brief delay
			setTimeout(() => {
				stopScanning();
				setTimeout(() => {
					goto(`/piece/${scannedId}`);
				}, 600); // Wait for exit animation
			}, 1500);
		} else {
			// Error feedback
			scanStatus = 'error';
			scanMessage = `Code invalide: "${scannedId}". Essayez avec ${Object.keys(PIECES_DATA).join('-')}.`;

			// Reset after delay
			setTimeout(() => {
				scanStatus = 'scanning';
				scanMessage = 'Scanner actif - Recherche de QR codes...';
			}, 3000);
		}
	}

	// Handle scanner errors
	function handleScannerError(event) {
		const { message } = event.detail;
		scanStatus = 'error';
		scanMessage = `Erreur: ${message}`;

		// Auto-retry after a delay
		setTimeout(() => {
			if (isScanning) {
				scanStatus = 'scanning';
				scanMessage = 'Scanner actif - Recherche de QR codes...';
			}
		}, 2000);
	}
</script>

<div class="mx-auto max-w-sm p-4">
	<h1 class="inf-bold btn-primary uppercase mb-6">chromogram #1</h1>

	<!-- Status Message -->
	{#if scanMessage && !isFullscreen}
		<div class="mb-4 p-3 text-center text-sm"
			 class:bg-blue-100={scanStatus === 'scanning'}
			 class:bg-green-100={scanStatus === 'success'}
			 class:bg-red-100={scanStatus === 'error'}
			 class:text-blue-800={scanStatus === 'scanning'}
			 class:text-green-800={scanStatus === 'success'}
			 class:text-red-800={scanStatus === 'error'}>
			{scanMessage}
		</div>
	{/if}

	<div class="mb-6 border p-4 min-h-[400px] flex flex-col justify-center items-center">
		{#if !isScanning}
			<!-- Scan Button -->
			<button
				onclick={startScanning}
				class="btn-primary w-fit">
				Commencer le scan
			</button>
		{:else}
			<!-- Optimized Scanner Interface -->
			<div>
				<OptimizedQRScanner
					isActive={isScanning}
					targetFPS={30}
					scanAreaSize={250}
					enableMultiScale={true}
					fullscreen={isFullscreen}
					on:qrdetected={handleQRDetected}
					on:error={handleScannerError}
					on:close={stopScanning}
				/>
			</div>

			{#if !isFullscreen}
				<div class="mt-4 text-center">
					<button
						onclick={stopScanning}
						class="btn-primary w-fit">
						Fermer le scan
					</button>
				</div>
			{/if}
		{/if}
	</div>

	{#if !isFullscreen}
		<div class="mb-6  bg-black  p-4">
			<h2 class="mb-3 font-semibold text-white">Conseils de scan</h2>
			<ul class="space-y-2 text-sm text-white">
				<li class="flex items-center gap-2">
					Tenez votre téléphone bien droit
				</li>
				<li class="flex items-center gap-2">
					Rapprochez-vous du QR code si nécessaire
				</li>
				<li class="flex items-center gap-2">
					Assurez-vous d'avoir assez de lumière
				</li>
					<li class="flex items-center gap-2">
						Centrez le QR code dans le cadre
					</li>
					<li class="flex items-center gap-2">
						Fonctionne de très près à très loin
					</li>
			</ul>
		</div>


		<div class="text-center">
			<p class="mb-2 text-sm text-gray-500">
				{totalFound} pièces trouvées sur 7 !
			</p>
			<div class="flex flex-wrap justify-center gap-2">
				{#each Object.entries(PIECES_DATA) as [id, data]}

				<span class="px-2 py-1 text-xs"  style="background-color: {foundPieces.includes(id) ? data.color : '#DDD'}">
					{data.color_name}
				</span>

				{/each}
			</div>
		</div>
	{/if}
</div>