<script>
    import { browser } from '$app/environment';
    import { PIECES_DATA } from '$lib/piecesData';
    import { piecesStore } from '$lib/piecesStore.js';
    import { isAideOpen } from '$lib/stores/aideStore.js';
    import { onDestroy, onMount, tick } from 'svelte';
    import { fly } from 'svelte/transition';

	const TOTAL_BARS = 51;
	const COLORS = [
		PIECES_DATA[1].color,
		PIECES_DATA[2].color,
		PIECES_DATA[3].color,
		PIECES_DATA[4].color,
		PIECES_DATA[5].color,
		PIECES_DATA[6].color,
		PIECES_DATA[7].color
	];
	const EFFECT_RADIUS = 200;

	function handleRestart() {
		piecesStore.initialize();
		piecesStore.clear();
		window.location.reload();
	}

	let container;
	let scrollBox;
	let whiteBars = [];
	let whiteBarWidth = 0;
	let ro;
	let gsap;

	async function ensureGsap() {
		if (!browser) return null;
		if (!gsap) {
			const module = await import('gsap');
			gsap = module.gsap;
		}
		return gsap;
	}

	function setup() {
		whiteBars = Array.from(container.querySelectorAll('.bar.white'));
		const width = container.clientWidth;
		whiteBarWidth = whiteBars.length ? width / whiteBars.length : 0;
	}

	function animateColors(posX) {
		if (!gsap) return;
		const rect = container.getBoundingClientRect();
		const pct = Math.min(Math.max(posX / rect.width, 0), 1);
		const colorIndex = Math.floor(pct * (COLORS.length - 1));

		let closestIndex = 0;
		let minDist = Infinity;
		for (let i = 0; i < whiteBars.length; i += 1) {
			const center = (i + 0.5) * whiteBarWidth;
			const distance = Math.abs(center - posX);
			if (distance < minDist) {
				minDist = distance;
				closestIndex = i;
			}
		}

		for (let i = 0; i < whiteBars.length; i += 1) {
			const bar = whiteBars[i];
			const deltaFromClosest = Math.abs(i - closestIndex);
			const distance = deltaFromClosest * whiteBarWidth;
			const factor =
				deltaFromClosest <= 2
					? 1
					: Math.max(0, 1 - (distance - 2 * whiteBarWidth) / EFFECT_RADIUS);
			const shifted = (colorIndex + deltaFromClosest) % COLORS.length;
			const target = gsap.utils.interpolate('white', COLORS[shifted], factor);

			gsap.to(bar, {
				backgroundColor: target,
				duration: 0.25,
				ease: 'power2.out',
				overwrite: true
			});
		}
	}

	function updateScrollFromX(x, useInertia = false) {
		const rect = container.getBoundingClientRect();
		const pct = Math.min(Math.max(x / rect.width, 0), 1);
		const scrollMax = scrollBox.scrollHeight - scrollBox.clientHeight;
		const targetScroll = pct * scrollMax;
		if (useInertia && gsap) {
			gsap.to(scrollBox, { scrollTop: targetScroll, duration: 0.3, ease: 'power2.out' });
		} else {
			scrollBox.scrollTop = targetScroll;
		}
		animateColors(x);
	}

	function onMouseMove(event) {
		const rect = container.getBoundingClientRect();
		const x = event.clientX - rect.left;
		updateScrollFromX(x, true);
	}

	function onTouchMove(event) {
		if (!event.touches.length) return;
		const rect = container.getBoundingClientRect();
		const x = event.touches[0].clientX - rect.left;
		updateScrollFromX(x, true);
	}

	function onScroll() {
		const scrollMax = scrollBox.scrollHeight - scrollBox.clientHeight;
		const pct = scrollBox.scrollTop / scrollMax;
		const posX = pct * container.clientWidth;
		animateColors(posX);
	}

	function handleClose() {
		isAideOpen.close();
	}

	async function initializeGSAP() {
		if (!container || !scrollBox) return;
		await ensureGsap();
		if (!gsap) return;

		setup();
		container.addEventListener('mousemove', onMouseMove);
		container.addEventListener('touchmove', onTouchMove, { passive: true });
		scrollBox.addEventListener('scroll', onScroll);

		ro = new ResizeObserver(() => {
			setup();
		});
		ro.observe(container);
	}

	onMount(async () => {
		if (!browser) return;
		await ensureGsap();
		// Only initialize if aide is already open
		if ($isAideOpen) {
			await tick();
			initializeGSAP();
		}
	});

	onDestroy(() => {
		container?.removeEventListener('mousemove', onMouseMove);
		container?.removeEventListener('touchmove', onTouchMove);
		scrollBox?.removeEventListener('scroll', onScroll);
		ro?.disconnect();
	});
</script>

{#if $isAideOpen}
<div class="aide-overlay fixed inset-0 z-50" in:fly={{ y: -100, duration: 400 }} out:fly={{ y: -100, duration: 400 }} onintroend={initializeGSAP}>
	<div class="aide-surface z-50">
	<header class="fixed top-[30px] right-5 z-10">
		<button
			type="button"
			class="flex items-center justify-center rounded-full bg-transparent"
			onclick={handleClose}
			aria-label="Fermer l'aide"
		>
		
			<svg width="29" height="29" viewBox="0 0 29 29" fill="white" xmlns="http://www.w3.org/2000/svg">
				<path d="M28.8613 25.8936L26.0347 28.7238L0.173337 2.83019L3 0L28.8613 25.8936Z" fill="white"/>
				<path d="M3.13867 28.8936L0.312005 26.0634L26.1733 0.16981L29 3L3.13867 28.8936Z" fill="white"/>
			</svg>


		</button>
	</header>



	<div class="scroll-box relative text-center" bind:this={scrollBox}>



		<div class="m-auto w-[30px] rotate-45 text-center"><img src="/images/tan.jpg" alt="Tangram" /></div>

		<div style="" class="text-titre-alt mt-10 mb-10 w-full text-center">

			<div class="mb-5 bg-black p-5">
				<div>
					Clique sur l'icone de l'appareil photo pour scanner un QR code.<br />( Valide l’accès à
					l’appareil photo de ton téléphone ).
				</div>
			</div>
			<div class="mb-5 bg-black p-5">
				<div>
					Il y a 7 QR codes à trouver dans les salles de l'exposition correspondants aux 7 formes du tangram.
				</div>
			</div>
			<div class="mb-5 bg-black p-5">
				<div>
					Quand tu scanne un QR code, tu débloques une couleur. Retrouve-la dans une œuvre de la même salle.
				</div>
			</div>
			<div class="mb-5 bg-black p-5">
				<div>
					Les formes se colorent sur ton chromogram au fur et à mesure de ta quête.
				</div>
			</div>
			<div class="mb-5 bg-black p-5">
				<div>
					Complète le tangram en scannant les 7 QR codes cachés et accède aux puzzles.
				</div>
			</div>
			<div class="mb-5 bg-black p-5">
				<div>
					Débloque un fond d'écran conçu par Armelle Caron.
				</div>
			</div>
			<div class="mb-5 bg-black p-5">
				<div>
					Résous selon ton envie les 7 tangrams du CHROMOGRAM.
				</div>
			</div>
		</div>
		<div class="m-auto mt-2 w-[30px] rotate-45 text-center"><img src="/images/tan.jpg" alt="Tangram" /></div>

		<button style="border:1px solid" class="relative mt-12 mb-14 text-black text-bouton inf-bold z-0 w-fit bg-white px-5 py-3 tracking-[4%] drop-shadow-[var(--my-drop-shadow)]" onclick={handleRestart}>
			<div class="leading-[1.5] rounded-full absolute top-1 left-2 bg-black text-white h-5 w-5">!</div>CLIQUE ICI POUR<br/>RECOMMENCER LE JEU À ZÉRO
		</button>
	</div>

	<div class="striped-container fixed bottom-0 left-0" bind:this={container}>
		{#each Array(TOTAL_BARS) as _, i}
			<div class="bar" class:white={i % 2 === 0} class:black={i % 2 !== 0}></div>
		{/each}
	</div>
</div>
</div>
{/if}

<style>
	.aide-overlay {
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);
	}

	.aide-surface {
		position: relative;
		min-height: 100svh;
		background: #fff;
		color: #fff;
		will-change: transform;
	}

	header {
		mix-blend-mode: difference;
	}

	.scroll-box {
		height: 100svh;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		/* padding: 60px 20px 20vh; */
		padding-left:20px ;
		padding-right:20px ;
		padding-bottom: 15svh;
		padding-top:29px;
	}

	.striped-container {
		display: flex;
		width: 100%;
		height: 15svh;
		touch-action: none;
	}

	.bar {
		flex: 1;
	}

	.white {
		background: #fff;
	}

	.black {
		background: #000;
	}

	button {
		cursor: pointer;
		border: none;
	}

	button:focus {
		outline: 2px solid rgba(255, 255, 255, 0.6);
		outline-offset: 3px;
	}
</style>
