<script>
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	// Props
	let {
		isActive = false,
		scanAreaSize = 250,
		targetFPS = 30,
		enableMultiScale = true,
		fullscreen = false
	} = $props();

	// Event dispatcher
	const dispatch = createEventDispatcher();

	// State
	let videoElement;
	let canvasElement;
	let scanAreaElement;
	let stream = null;
	let worker = null;
	let animationId = null;
	let isProcessing = false;
	let lastScanTime = 0;
	let scanInterval = 1000 / targetFPS; // Convert FPS to milliseconds

	// Visual feedback state
	let isDetecting = $state(false);
	let hasQRCode = $state(false);
	let scanIndicatorOpacity = $state(0);

	// Initialize Web Worker
	function initializeWorker() {
		try {
			worker = new Worker(new URL('/src/lib/qrWorker.js', import.meta.url), {
				type: 'module'
			});

			worker.onmessage = function (e) {
				const { success, data, location, error } = e.data;
				isProcessing = false;

				if (success && data) {
					hasQRCode = true;
					dispatch('qrdetected', { data, location });
					// Flash green indicator
					flashIndicator('success');
				} else {
					hasQRCode = false;
					if (error) {
						console.warn('QR Worker error:', error);
					}
					// Show red border for failed detection
					flashIndicator('error');
				}
			};

			worker.onerror = function (error) {
				console.error('QR Worker error:', error);
				isProcessing = false;
				hasQRCode = false;
				flashIndicator('error');
			};
		} catch (error) {
			console.error('Failed to create QR Worker:', error);
		}
	}

	// Flash scan indicator with success/error feedback
	function flashIndicator(type) {
		scanIndicatorOpacity = 1;

		// Set indicator color based on result
		if (scanAreaElement) {
			scanAreaElement.style.borderColor = type === 'success' ? '#10b981' : '#ef4444';
		}

		// Fade out after 200ms
		setTimeout(() => {
			scanIndicatorOpacity = 0.3;
			if (scanAreaElement) {
				scanAreaElement.style.borderColor = hasQRCode ? '#10b981' : '#ef4444';
			}
		}, 200);
	}

	// Single area scan (fallback method)
	function scanSingleArea(ctx, videoWidth, videoHeight, scale = 0.6) {
		const scanSize = Math.min(videoWidth, videoHeight) * scale;
		const startX = (videoWidth - scanSize) / 2;
		const startY = (videoHeight - scanSize) / 2;

		const imageData = ctx.getImageData(startX, startY, scanSize, scanSize);

		worker.postMessage({
			imageData: imageData.data,
			width: scanSize,
			height: scanSize
		});
	}

	// Multi-scale scanning for better range detection
	function scanMultipleAreas(ctx, videoWidth, videoHeight) {
		// Define scan areas from large to small (close to far range)
		const scanScales = [
			0.9, // Very close range - QR fills most of frame
			0.75, // Close range
			0.6, // Normal range (original)
			0.45, // Far range
			0.3 // Very far range
		];

		let currentScaleIndex = 0;

		function tryScanAtScale() {
			if (currentScaleIndex >= scanScales.length) {
				// No QR code found at any scale
				isProcessing = false;
				hasQRCode = false;
				flashIndicator('error');
				return;
			}

			const scale = scanScales[currentScaleIndex];
			const scanSize = Math.min(videoWidth, videoHeight) * scale;
			const startX = (videoWidth - scanSize) / 2;
			const startY = (videoHeight - scanSize) / 2;

			const imageData = ctx.getImageData(startX, startY, scanSize, scanSize);

			// Store current attempt info for the worker response
			worker.currentScale = scale;
			worker.scaleIndex = currentScaleIndex;

			worker.postMessage({
				imageData: imageData.data,
				width: scanSize,
				height: scanSize,
				scale: scale
			});

			currentScaleIndex++;
		}

		// Override worker message handler for multi-scale
		const originalHandler = worker.onmessage;

		worker.onmessage = function (e) {
			const { success, data, location, error } = e.data;

			if (success && data) {
				// Found QR code! Restore original handler and dispatch
				worker.onmessage = originalHandler;
				isProcessing = false;
				hasQRCode = true;
				dispatch('qrdetected', { data, location });
				flashIndicator('success');
			} else {
				// No QR at this scale, try next one
				tryScanAtScale();
			}
		};

		// Start with first scale
		tryScanAtScale();
	}

	// Start camera stream
	async function startCamera() {
		try {
			// Check if getUserMedia is supported
			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				throw new Error('Camera API not supported in this browser');
			}

			stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: 'environment', // Use back camera if available
					width: { ideal: 1280 },
					height: { ideal: 720 }
				}
			});

			if (videoElement) {
				videoElement.srcObject = stream;
				videoElement.play();

				// Start scanning once video is loaded
				videoElement.onloadedmetadata = () => {
					startScanning();
				};
			}
		} catch (error) {
			console.error('Error accessing camera:', error);

			let errorMessage = 'Unable to access camera';

			// Provide more specific error messages
			if (error.name === 'NotAllowedError') {
				errorMessage = 'Camera access denied. Please allow camera permissions and refresh.';
			} else if (error.name === 'NotFoundError') {
				errorMessage = 'No camera found on this device.';
			} else if (error.name === 'NotSupportedError') {
				errorMessage = 'Camera not supported on this device.';
			} else if (error.name === 'NotReadableError') {
				errorMessage = 'Camera is already in use by another application.';
			} else if (error.name === 'SecurityError') {
				errorMessage = 'Camera access requires HTTPS. Try accessing via https://192.168.1.17:5173';
			} else if (error.message) {
				errorMessage = error.message;
			}

			dispatch('error', { message: errorMessage });
		}
	}

	// Stop camera stream
	function stopCamera() {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}

		if (animationId) {
			cancelAnimationFrame(animationId);
			animationId = null;
		}
	}

	// Start the scanning loop
	function startScanning() {
		if (!canvasElement || !videoElement) return;

		const ctx = canvasElement.getContext('2d');

		function scan() {
			if (!isActive) return;

			const now = performance.now();

			// Throttle scanning to target FPS
			if (now - lastScanTime >= scanInterval && !isProcessing) {
				lastScanTime = now;

				// Set canvas size to match video
				const { videoWidth, videoHeight } = videoElement;
				canvasElement.width = videoWidth;
				canvasElement.height = videoHeight;

				// Draw current video frame to canvas
				ctx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);

				// Multi-scale scanning for better close/far range detection
				if (worker && !isProcessing) {
					isProcessing = true;
					isDetecting = true;

					if (enableMultiScale) {
						// Try multiple scan areas from large to small
						scanMultipleAreas(ctx, videoWidth, videoHeight);
					} else {
						// Single scan area (original behavior)
						scanSingleArea(ctx, videoWidth, videoHeight, 0.6);
					}
				}
			}

			// Continue scanning
			animationId = requestAnimationFrame(scan);
		}

		scan();
	}

	// Reactive effects - must be before lifecycle hooks
	$effect(() => {
		if (isActive) {
			startCamera();
		} else {
			stopCamera();
			hasQRCode = false;
			isDetecting = false;
		}
	});

	// Lifecycle management
	onMount(() => {
		initializeWorker();
	});

	onDestroy(() => {
		stopCamera();
		if (worker) {
			worker.terminate();
			worker = null;
		}
	});
</script>

<div class="qr-scanner-container bg-black" class:active={isActive} class:fullscreen>
	<!-- Video element (hidden, used for capturing frames) -->
	<video bind:this={videoElement} class="bg-[#ccc] qr-video border-2 drop-shadow-[var(--my-drop-shadow)]" autoplay muted playsinline></video>

	<!-- Canvas element (hidden, used for image processing) -->
	<canvas bind:this={canvasElement} class="qr-canvas"></canvas>

	<!-- Visual overlay with scan area -->
	<div class="scan-overlay">
		<!-- Scan area indicator -->
		<div
			bind:this={scanAreaElement}
			class="scan-area"
			class:fullscreen-area={fullscreen}
			style="width: {fullscreen ? '80vmin' : scanAreaSize + 'px'}; height: {fullscreen
				? '80vmin'
				: scanAreaSize + 'px'}; opacity: {scanIndicatorOpacity}"
		>
			<!-- Corner brackets -->
			<div class="scan-corners">
				<div class="corner corner-tl"></div>
				<div class="corner corner-tr"></div>
				<div class="corner corner-bl"></div>
				<div class="corner corner-br"></div>
			</div>


			<!-- Success indicator -->
			{#if hasQRCode}
				<div class="success-indicator">
					<div class="checkmark">✓</div>
				</div>
			{/if}
		</div>

		<!-- Status text -->
		<div class="scan-status absolute bottom-0 left-2">
			{#if hasQRCode}
				<span class="status-success">QR-Code détecté</span>
			{:else if isDetecting}
				<span class="status-scanning">Attente QR-Code</span>
			{:else}
				<span class="status-idle">...</span>
			{/if}
		</div>

		<!-- Fullscreen close button -->
		{#if fullscreen}
			<button
				class="close-button fixed right-5 top-0 flex items-center"
				onclick={() => dispatch('close')}
				aria-label="Fermer le scanner"
			>
			
			 <svg width="30" height="30" fill="black" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
				<path d="M17.1421 15.1421L15.0208 17.2635L0.87868 3.12132L3 1L17.1421 15.1421Z"/>
				<path d="M2.85786 17.1421L0.736544 15.0208L14.8787 0.87868L17 3L2.85786 17.1421Z"/>
			</svg>
			
			</button>
		{/if}
	</div>
</div>

<style>
	
	.qr-scanner-container {
		border: 2px solid;
		position: relative;
		width: 100%;
		height: 400px;
		overflow: hidden;
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 1;
	}

	.qr-scanner-container.fullscreen {
		position: fixed;
		top: 110px;
		left: 10vw;
		width: 80vw;
		height: calc(100svh - 210px);
		border-radius: 0;
		z-index: 50;
		background: #fff;
		overflow: visible;
	}

	.qr-video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		position: absolute;
		top: 0;
		left: 0;
	}

	.qr-canvas {
		display: none;
	}

	.close-button {
		z-index: 20;
		margin-top: 2rem;
		pointer-events: auto;
	}

	.scan-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		z-index: 10;
	}

	.scan-area {
		position: relative;
		border: 1px solid transparent;
		border-radius: 4px;
		transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(1px);
		max-width: min(80vw, 80vh);
		max-height: min(80vw, 80vh);
	}

	.scan-area.fullscreen-area {
		border-width: 1px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.05);
	}

	.scan-corners {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}


	.success-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 60px;
		height: 60px;
		background: rgba(16, 185, 129, 0.9);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: pulse 0.6s ease-out;
	}

	.checkmark {
		color: white;
		font-size: 24px;
		font-weight: bold;
	}

	.scan-status {
		margin-top: 20px;
		padding: 5px;
		color: white;
		text-align: center;
		transition: all 0.3s ease;
		font-family: 'Inf Reg';
	}

	.fullscreen .scan-status {
		
	}

	.status-success {
		color: #fb4af8;
	}

	.status-scanning {
		color: #01a707;
	}

	.status-idle {
		color: #9a5499;
	}


	@keyframes pulse {
		0% {
			transform: translate(-50%, -50%) scale(0.5);
			opacity: 0;
		}
		50% {
			transform: translate(-50%, -50%) scale(1.1);
			opacity: 1;
		}
		100% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 1;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 480px) {
		.qr-scanner-container {
			height: 300px;
		}
	}
</style>
