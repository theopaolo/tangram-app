<script>
	import { goto } from '$app/navigation';
	import { ScanQRCode } from '@kuiper/svelte-scan-qrcode';

	const PIECES_DATA = {
		1: 'Le Grand Triangle',
		2: 'Le Triangle Moyen', 
		3: 'Le Petit Triangle',
		4: 'Le Carré',
		5: 'Le Parallélogramme',
		6: 'Le Grand Trapèze',
		7: 'Le Petit Trapèze'
	};

	// --- STATE ---
	let scanResult = $state('');
	let isScanning = $state(false);
	let scanMessage = $state('');
	let scanStatus = $state('idle'); // 'idle', 'scanning', 'success', 'error'

	// --- FUNCTIONS ---
	function startScanning() {
		isScanning = true;
		scanStatus = 'scanning';
		scanMessage = 'Positionnez le QR code devant la caméra...';
	}

	function stopScanning() {
		isScanning = false;
		scanStatus = 'idle';
		scanMessage = '';
	}

	// --- EFFECTS ---
	// Handle QR scan results - redirect to piece page
	$effect(() => {
		if (scanResult) {
			const scannedId = scanResult.toString().trim();
			if (PIECES_DATA[scannedId]) {
				// Success feedback
				scanStatus = 'success';
				scanMessage = `Pièce trouvée: ${PIECES_DATA[scannedId]}`;
				
				// Redirect after brief delay to show success message
				setTimeout(() => {
					goto(`/piece/${scannedId}`);
				}, 1500);
			} else {
				// Error feedback
				scanStatus = 'error';
				scanMessage = `Code invalide: "${scannedId}". Essayez avec un QR code contenant 1-7.`;
				
				// Reset after delay
				setTimeout(() => {
					scanResult = '';
					scanStatus = 'scanning';
					scanMessage = 'Positionnez le QR code devant la caméra...';
				}, 3000);
			}
		}
	});
</script>

<div class="mx-auto max-w-sm p-4">
	<h1 class="mb-6 text-center text-3xl font-bold">Scanner QR Code</h1>
	
	<!-- Status Message -->
	{#if scanMessage}
		<div class="mb-4 rounded-lg p-3 text-center text-sm" 
			 class:bg-blue-100={scanStatus === 'scanning'}
			 class:bg-green-100={scanStatus === 'success'} 
			 class:bg-red-100={scanStatus === 'error'}
			 class:text-blue-800={scanStatus === 'scanning'}
			 class:text-green-800={scanStatus === 'success'}
			 class:text-red-800={scanStatus === 'error'}>
			{scanMessage}
		</div>
	{/if}
	
	<div class="mb-6 rounded-lg border p-4">
		{#if !isScanning}
			<!-- Scan Button -->
			<div class="text-center">
				<p class="mb-4 text-gray-600">
					Scannez un QR code pour découvrir une pièce du tangram
				</p>
				<button 
					onclick={startScanning}
					class="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
					📷 Commencer le scan
				</button>
			</div>
		{:else}
			<!-- Scanner Interface -->
			<div class="qr-scanner-wrapper">
				<ScanQRCode 
					bind:scanResult 
					options={{
						enableQRCodeReaderButton: true
					}} 
				/>
			</div>
			
			<div class="mt-4 text-center">
				<button 
					onclick={stopScanning}
					class="rounded bg-gray-500 px-4 py-2 text-white text-sm hover:bg-gray-600">
					Arrêter le scan
				</button>
			</div>
		{/if}
	</div>

	<!-- Instructions Section -->
	<div class="mb-6 rounded-lg bg-gray-50 p-4">
		<h2 class="mb-3 text-center font-semibold text-gray-800">💡 Conseils de scan</h2>
		<ul class="space-y-2 text-sm text-gray-600">
			<li class="flex items-center gap-2">
				<span class="text-blue-500">📱</span>
				Tenez votre téléphone bien droit
			</li>
			<li class="flex items-center gap-2">
				<span class="text-green-500">🔍</span>
				Rapprochez-vous du QR code si nécessaire
			</li>
			<li class="flex items-center gap-2">
				<span class="text-yellow-500">💡</span>
				Assurez-vous d'avoir assez de lumière
			</li>
			<li class="flex items-center gap-2">
				<span class="text-purple-500">🎯</span>
				Centrez le QR code dans le cadre
			</li>
		</ul>
	</div>

	<!-- Available Pieces -->
	<div class="text-center">
		<p class="mb-2 text-sm text-gray-500">
			Pièces disponibles: 1-7
		</p>
		<div class="flex flex-wrap justify-center gap-2">
			{#each Object.entries(PIECES_DATA) as [id, name]}
				<span class="rounded bg-gray-100 px-2 py-1 text-xs">
					{id}: {name}
				</span>
			{/each}
		</div>
	</div>
</div>

<style>
	.qr-scanner-wrapper {
		min-height: 300px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>