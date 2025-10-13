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
		injectPieceStyles();

		piecesStore.initialize();
		totalFound = piecesStore.count;
		foundPieces = piecesStore.pieces;
		applyColors();

	});




	function injectPieceStyles() {
	const style = document.createElement("style");
	style.innerHTML = Object.keys(PIECES_DATA)
		.map(id => `.p${id} polygon { fill: var(--c${id}); }`)
		.join("\n");
	document.head.appendChild(style);
	}




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
			goto(`/animation/${id}`);
		} else {
			goto('/start/');
		}
	}

	const breadcrumbItems = [
		{ label: 'Accueil', href: '/home' },
		{ label: 'Le Chromogram', current: true },
		// { label: 'Les Tangrams', disabled: true }
	];

	onMount(async () => {
		if (!browser) return;

		// Import scroll freeze utility
		const { freezeScroll, unfreezeScroll } = await import('$lib/utils/scrollFreeze.js');

		// Freeze scroll
		freezeScroll();

		return () => {
			unfreezeScroll();
		};
	});
</script>

<div class="title text-title inf-bold fixed top-[20px] left-[20px] z-10 mx-aut w-max border bg-white px-[14px] py-1 tracking-[4%] drop-shadow-[var(--my-drop-shadow)]">
	<a href="/home">CHROMOGRAM #1</a>
</div>

<!-- {#if totalFound !== 7} -->
<div class="fixed top-3 right-5 z-30">
	<button onclick={() => isAideOpen.open()} aria-label="Aide" class="flex bg-transparent border-none cursor-pointer flex flex-row gap-2">
		<!-- <img class="mt-2" src="/images/quoi.svg" alt="quoi" /> -->
		<div class="text-inter inf-bold">?</div>
	</button>
</div>
<!-- {/if} -->


<div class="bloc_one pointer-events-none absolute top-0 left-0 z-30 flex h-svh w-screen flex-col items-center justify-evenly pt-[70px] pb-[40px] text-center" >
	<div class="w-[90dvw]">
		<p>
			{#if totalFound === 0}
				Pars à la recherche des 7 couleurs du tangram pour débloquer le CHROMOGRAM !
			{:else if totalFound === 7}
				Bravo ! Tu as débloqué toutes les couleurs ! Les tangrams sont disponibles en cliquant en bas de page !
			{:else if totalFound === 1}
				Tu as découvert 1 couleur. Rassemble les 7 formes pour débloquer le CHROMOGRAM !
			{:else}
				Tu as déjà découvert {totalFound} couleurs. Rassemble les 7 formes pour débloquer le
				CHROMOGRAM !
			{/if}
		</p>
	</div>

	<div class="relative h-[80dvw] w-[80dvw]">
		{#if totalFound === 1}
			<div class="absolute top-full left-0 !w-[112.2px]">
				<img src="/images/couleur.svg" alt="couleur" class="" />
			</div>
		{/if}
		<!-- {#if totalFound === 7}
			<a href="" class="relative top-7 text-mini text-white inf-bold pointer-events-auto z-10 w-fit border bg-black px-[15px] py-[7px] tracking-[4%] " >
				TÉLÉCHARGE TON FOND D'ECRAN !
			</a>
		{/if} -->
	</div>

	<div class="relative">
		{#if totalFound !== 7}
			<a href="/scanner" class="pointer-events-auto block">
				<svg width="52" height="43" viewBox="0 0 52 43" fill="none" xmlns="http://www.w3.org/2000/svg">
					<g clip-path="url(#clip0_2041_26)">
					<path d="M48 5H45V0H31V5H20V2H9V5H4C1.79 5 0 6.79 0 9V39C0 41.21 1.79 43 4 43H48C50.21 43 52 41.21 52 39V9C52 6.79 50.21 5 48 5ZM26.5 38C19.04 38 13 31.96 13 24.5C13 17.04 19.04 11 26.5 11C33.96 11 40 17.04 40 24.5C40 31.96 33.96 38 26.5 38Z" fill="black"/>
					<path d="M26.5 34C31.7467 34 36 29.7467 36 24.5C36 19.2533 31.7467 15 26.5 15C21.2533 15 17 19.2533 17 24.5C17 29.7467 21.2533 34 26.5 34Z" fill="black"/>
					</g>
				</svg>
			</a>
			{#if totalFound === 0 || totalFound === 1}
				<div class="absolute top-1/2 left-full ml-2 !w-[105.787px] translate-y-[-50%]">
					<img src="/images/arrow_cam.svg" alt="camera" class="" />
				</div>
			{/if}
		{:else}
		
			<div class="pointer-events-auto z-10 h-[43px]">
				<a href="/puzzles" class="mt-[3px] text-bouton inf-bold w-fit border bg-white px-[15px] py-[7px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]" >
					ACCÈDE AUX TANGRAMS
				</a>
			</div>
		{/if}
	</div>
</div>

<footer class="fixed bottom-0 left-0 z-40 flex w-full items-center justify-between px-5 py-2">
	<Breadcrumb items={breadcrumbItems} />
</footer>

<div class="conta mt-2 absolute top-[50%] left-[50%] z-10 flex h-[80dvw] w-[80dvw] -translate-[50%]">
	<div>
		<div class="piece p1">
			<svg viewBox="0 0 7.5 2.5">
				<polygon stroke-linejoin="bevel" points="7.5,2.5 2.5,2.5 0,0 5,0" onclick={() => handleClick('1')} />
			</svg>
		</div>

		<div class="piece p2">
			<svg viewBox="0 0 5 5">
				<polygon stroke-linejoin="bevel" points="0,0 5,0 5,5" onclick={() => handleClick('2')} />
			</svg>
		</div>

		<div class="piece p3">
			<svg viewBox="0 0 5 10">
				<polygon stroke-linejoin="bevel" points="0,10 0,0 5,5" onclick={() => handleClick('3')} />
			</svg>
		</div>

		<div class="piece p4">
			<svg viewBox="0 0 2.5 5">
				<polygon stroke-linejoin="bevel" points="2.5,5 2.5,0 0,2.5" onclick={() => handleClick('4')} />
			</svg>
		</div>

		<div class="piece p5">
			<svg viewBox="0 0 10 5">
				<polygon stroke-linejoin="bevel" points="0,5 10,5 5,0" onclick={() => handleClick('5')} />
			</svg>
		</div>

		<div class="piece p6">
			<svg viewBox="0 0 5 5">
				<polygon stroke-linejoin="bevel" points="0,2.5 2.5,0 5,2.5 2.5,5" onclick={() => handleClick('6')} />
			</svg>
		</div>

		<div class="piece p7">
			<svg viewBox="0 0 5 2.5">
				<polygon stroke-linejoin="bevel" points="5,0 0,0 2.5,2.5" onclick={() => handleClick('7')} />
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
		fill: var(--c1);
	}
	.p2 polygon {
		fill: var(--c2);
	}
	.p3 polygon {
		fill: var(--c3);
	}
	.p4 polygon {
		fill: var(--c4);
	}
	.p5 polygon {
		fill: var(--c5);
	}
	.p6 polygon {
		fill: var(--c6);
	}
	.p7 polygon {
		fill: var(--c7);
	}
</style>
