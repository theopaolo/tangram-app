<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
// Tangram pieces data with original colors
	import AideContent from '$lib/AideContent.svelte';
	import Breadcrumb from '$lib/Breadcrumb.svelte';
	import { PIECES_DATA } from '$lib/piecesData';
	import { piecesStore } from '$lib/piecesStore.js';
	import { isAideOpen } from '$lib/stores/aideStore.js';

	let totalFound = $state(0);
	let foundPieces = $state([]);
	// --- FUNCTIONS ---
	onMount(() => {
		if (!browser) return;
		
		piecesStore.initialize();
		totalFound = piecesStore.count;
		foundPieces = piecesStore.pieces;
		applyColors();
	});

	function applyColors() {
		if (typeof document === 'undefined') return; // SSR guard

		Object.keys(PIECES_DATA).forEach((id) => {
			const isFound = foundPieces.includes(id);
			document.documentElement.style.setProperty(
				`--c${id}`,
				isFound ? PIECES_DATA[id].color : '#E6E6E6'
			);
		});
	}

	function handleClick(id) {
		if (foundPieces.includes(id)) {
			goto(`/animation_${id}`);
		} else {
			goto('/start/');
		}
	}

	const breadcrumbItems = [
		{ label: 'Accueil', href: '/' },
		{ label: 'Les Tangrams', disabled: true }
	];

	onMount(async () => {
		if (!browser) return;
		
		const preventScroll = (e) => e.preventDefault();
		document.body.style.overflow = 'hidden';
		document.addEventListener('touchmove', preventScroll, { passive: false });

		return () => {
			document.body.style.overflow = '';
			document.removeEventListener('touchmove', preventScroll);
		};
	});
</script>

<div class="title text-title inf-bold fixed top-5 left-5 z-10 mx-aut w-max border bg-white px-[14px] py-1 tracking-[4%] drop-shadow-[var(--my-drop-shadow)]">
	CHROMOGRAM #1
</div>

<div class="fixed top-3 right-13 z-30">
	<button onclick={() => isAideOpen.open()} aria-label="Aide" class="flex bg-transparent border-none cursor-pointer">
		<img src="/images/quoi.svg" alt="camera" />
		<div class="text-inter inf-bold text-white drop-shadow-[var(--my-drop-shadow)]">?</div>
	</button>
</div>

<div class="bloc_one pointer-events-none absolute top-0 left-0 z-30 flex h-svh w-screen flex-col items-center justify-evenly pt-[80px] pb-[80px] text-center" >
	<div class="w-[80dvw]">
		<p>
			{#if totalFound === 0}
				Pars à la recherche des 7 formes du tangram pour débloquer le CHROMOGRAM !
			{:else if totalFound === 7}
				Bravo ! Tu as débloqué toutes les couleurs ! Les puzzles sont maintenant disponibles en
				cliquant en bas de page !
			{:else if totalFound === 1}
				Tu as découvert 1 forme.<br />Rassemble les 7 formes pour débloquer le CHROMOGRAM !
			{:else}
				Tu as déjà découvert {totalFound} formes.<br />Rassemble les 7 formes pour débloquer le
				CHROMOGRAM !
			{/if}
		</p>
	</div>

	<div class="relative h-[80dvw] w-[80dvw]">
		{#if totalFound === 1}
			<div class="absolute top-full left-0 !w-[101px]">
				<img src="/images/couleur.png" alt="couleur" class="" />
			</div>
		{/if}
	</div>

	<div class="relative">
		{#if totalFound !== 7}
			<a href="/scanner" class="pointer-events-auto block">
				<img src="/images/camera.svg" alt="camera" class="m-auto h-auto" />
			</a>
			<div class="absolute top-1/2 left-15 !w-[108.3px] translate-y-[-50%]">
				<img src="/images/arrow_cam.png" alt="camera" class="" />
			</div>
		{:else}
			<div class="text-bouton inf-bold pointer-events-auto z-10 w-fit border bg-white px-[15px] py-[7px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]" >
				ACCÉDER AUX PUZZLES
			</div>
		{/if}
	</div>
</div>

<footer class="fixed bottom-0 left-0 z-40 flex w-full items-center justify-between px-5 py-3">
	<Breadcrumb items={breadcrumbItems} />
</footer>

<div class="conta absolute top-[50%] left-[50%] z-10 flex h-[80dvw] w-[80dvw] -translate-[50%]">
	<div>
		<div class="piece p1">
			<svg viewBox="0 0 7.5 2.5">
				<polygon points="7.5,2.5 2.5,2.5 0,0 5,0" onclick={() => handleClick('1')} />
			</svg>
		</div>

		<div class="piece p2">
			<svg viewBox="0 0 5 5">
				<polygon points="0,0 5,0 5,5" onclick={() => handleClick('2')} />
			</svg>
		</div>

		<div class="piece p3">
			<svg viewBox="0 0 5 10">
				<polygon points="0,10 0,0 5,5" onclick={() => handleClick('3')} />
			</svg>
		</div>

		<div class="piece p4">
			<svg viewBox="0 0 2.5 5">
				<polygon points="2.5,5 2.5,0 0,2.5" onclick={() => handleClick('4')} />
			</svg>
		</div>

		<div class="piece p5">
			<svg viewBox="0 0 10 5">
				<polygon points="0,5 10,5 5,0" onclick={() => handleClick('5')} />
			</svg>
		</div>

		<div class="piece p6">
			<svg viewBox="0 0 5 5">
				<polygon points="0,2.5 2.5,0 5,2.5 2.5,5" onclick={() => handleClick('6')} />
			</svg>
		</div>

		<div class="piece p7">
			<svg viewBox="0 0 5 2.5">
				<polygon points="5,0 0,0 2.5,2.5" onclick={() => handleClick('7')} />
			</svg>
		</div>
	</div>
</div>

<AideContent />

<style>
	.piece polygon {
		fill: var(--cMyPiece);
	}

	/* Empêche le scroll de la page (mobile) :
	body,html {
		overflow: hidden;
		height: 100%;
		overscroll-behavior: none;
	}  */


	/* Une pièce = conteneur absolument positionné + 1 SVG avec viewBox identique */
	.piece {
		position: fixed;
		transform-origin: center;
		will-change: left, top, width, transform;
		pointer-events: none;
		top: initial;
		right: initial;
		bottom: initial;
		left: initial;
		z-index: 10;
	}
	.piece svg {
		display: block;
		height: 100%;
		width: auto;
		overflow: visible;
	}
	.piece polygon {
		stroke: #fff;
		stroke-width: 4;
		vector-effect: non-scaling-stroke;
	}

	svg {
		pointer-events: none; /* le conteneur SVG n’attrape pas le clic */
	}
	svg polygon {
		pointer-events: auto; /* seul le polygon est cliquable */
		cursor: pointer;
	}

	.p1 {
		width: 75%;
		top: 0;
		left: 0;
	}
	.p2 {
		height: 50%;
		top: 0;
		right: 0;
	}
	.p3 {
		height: 100%;
		top: 0;
		left: 0;
	}
	.p4 {
		height: 50%;
		bottom: 0;
		right: 0;
	}
	.p5 {
		width: 100%;
		right: 0;
		bottom: 0;
	}
	.p6 {
		width: 50%;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
	}
	.p7 {
		width: 50%;
		left: 0;
		right: 0;
		top: 25%;
		margin: auto;
	}
	/* Couleurs (optionnel) */
	.p1 polygon {
		fill: var(--c1, #ccffff);
	}
	.p2 polygon {
		fill: var(--c2, #ffe215);
	}
	.p3 polygon {
		fill: var(--c3, #0b4ed1);
	}
	.p4 polygon {
		fill: var(--c4, #7b77d4);
	}
	.p5 polygon {
		fill: var(--c5, #1a5435);
	}
	.p6 polygon {
		fill: var(--c6, #44a635);
	}
	.p7 polygon {
		fill: var(--c7, #1b3c75);
	}
</style>
