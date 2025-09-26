<script>
	import { browser } from '$app/environment';
	import { PIECES_DATA } from '$lib/piecesData';
	import { isCreditsOpen } from '$lib/stores/creditsStore.js';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let gsap;
	const VARS = [
		PIECES_DATA[1].color,
		PIECES_DATA[2].color,
		PIECES_DATA[3].color,
		PIECES_DATA[4].color,
		PIECES_DATA[5].color,
		PIECES_DATA[6].color,
		PIECES_DATA[7].color
	];
	let COLORS = [];
	let currentIndex = 0;
	let tl;

	function handleClose() {
		isCreditsOpen.close();
	}

	function makeTimeline(startIndex = 0) {
		if (tl) tl.kill();

		tl = gsap.timeline({ repeat: -1 });

		const orderedColors = [
			...COLORS.slice(startIndex + 1),
			...COLORS.slice(0, startIndex + 1)
		];


		
		orderedColors.forEach((color) => {
			tl.to('.animated-bg', {
				backgroundColor: color,
				duration: 1,
				ease: 'power2.inOut'
			});
			tl.to({}, { duration: 2.5 });
		});
	}

	function nextColor() {
		if (!gsap || !tl) return;

		tl.pause();
		currentIndex = (currentIndex + 1) % COLORS.length;

		gsap.to('.animated-bg', {
			backgroundColor: COLORS[currentIndex],
			duration: 0.2,
			ease: 'power2.inOut',
			onComplete: () => {
				makeTimeline(currentIndex);
			}
		});
	}

	async function initializeGSAP() {
		if (!browser) return;
		
		const mod = await import('gsap');
		gsap = mod.gsap;

		COLORS = VARS;

		// Set initial color
		gsap.set('.animated-bg', { backgroundColor: COLORS[0] });

		// Create timeline
		makeTimeline();

		// Add event listeners
		document.addEventListener('click', nextColor);
		document.addEventListener('touchstart', nextColor);
	}

	onMount(() => {
		if (!browser) return;
		
		if ($isCreditsOpen) {
			initializeGSAP();
		}
	});

	onDestroy(() => {
		if (!browser) return;
		
		if (tl) tl.kill();
		document.removeEventListener('click', nextColor);
		document.removeEventListener('touchstart', nextColor);
	});
</script>

{#if $isCreditsOpen}
<div class="credits-overlay fixed inset-0 z-50" in:fly={{ y: 100, duration: 400 }} out:fly={{ y: 100, duration: 400 }}>
	<div class="credits-surface z-50" onintroend={initializeGSAP}>
		<!-- Animated background -->
		<div class="animated-bg" style="background-color: {VARS[0]}"></div>

		<main>
			<header>
				<div class="text-mini text-center py-2 fixed w-full z-10 top-0">
					Une remarque / une question :
					<a class="underline" href="mailto:museedartcontemporain@laregion.fr">museedartcontemporain@laregion.fr</a>
				</div>
				<button
					type="button"
					class="fixed z-10 right-5 top-[30px] bg-transparent border-none cursor-pointer"
					onclick={handleClose}
					aria-label="Fermer les crédits"
				>
					<svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M28.8613 25.8936L26.0347 28.7238L0.173337 2.83019L3 0L28.8613 25.8936Z" fill="white"/>
						<path d="M3.13867 28.8936L0.312005 26.0634L26.1733 0.16981L29 3L3.13867 28.8936Z" fill="white"/>
					</svg>
				</button>
			</header>

			<div class="absolute left-0 p-5 w-full text-center" style="top: 11%;">
				<span class="text-title inf-bold">CHROMOGRAM</span><br />
				Une proposition d'Armelle Caron
			</div>

			<div class="absolute top-0 left-0 flex text-center flex-col items-center justify-center h-svh m-auto p-5 w-full">
				<div class="w-full relative top-[-0%]">
					<div class="w-[80vw] m-auto text-titre-alt">
						<img src="/images/mrac_logo.svg" alt="MRAC Logo" />
						146 Av. de la Plage - 34410 Sérignan<br/>+33 4 67 17 88 95
					</div>
				</div>
			</div>

			<footer class="text-mini p-5 pb-4 fixed w-full text-center bottom-0">
				Architecture / Développement : Théo Goedert<br />
				Conception / Design / Programmation : Stéphane Kouchian<br />
				Typographie : Infini, Sandrine Nugue / CNAP<br />
				Remerciements à Mathilde Ruiz Sidobre
				<div class="w-[40vw] m-auto mt-5">
					<img src="/images/logos.svg" alt="Partner Logos" />
				</div>
			</footer>
		</main>
	</div>
</div>
{/if}

<style>
	.credits-overlay {
	backdrop-filter: blur(2px);
	}

	.credits-surface {
		position: relative;
		width: 100%;
		height: 100%;
		color: #fff;
		will-change: transform;
	}

	main {
		width: 100%;
		margin: 0;
		min-height: 100svh;
		color: #fff;
	}

	.animated-bg {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: -1;
		/* background-color: #000; */
	}

	button {
		color: white;
	}

	button:focus {
		outline: 2px solid rgba(255, 255, 255, 0.6);
		outline-offset: 3px;
	}
</style>
