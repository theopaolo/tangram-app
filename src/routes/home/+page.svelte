<script>
	import { onMount } from 'svelte';
	import { goto, preloadCode } from '$app/navigation';

	let gsap; // SSR-safe
	let found = $state([]);

	// Tangram pieces data with original colors
	import { PIECES_DATA } from '$lib/piecesData';
	import { piecesStore } from '$lib/piecesStore.js';

	let totalFound = $state(0);
	let foundPieces = $state([]);
	// --- FUNCTIONS ---
	onMount(() => {
		applyCol();
		piecesStore.initialize();
		totalFound = piecesStore.count;
		foundPieces = piecesStore.pieces;
	});


	function applyCol() {
  	if (typeof document === 'undefined') return; // SSR guard
		Object.keys(PIECES_DATA).forEach((id) => {
			document.documentElement.style.setProperty(
				`--c${id}`, PIECES_DATA[id].color
			);
		});
	}

	function applyColors() {
		Object.keys(PIECES_DATA).forEach((id) => {
			const isFound = foundPieces.includes(id);
			document.documentElement.style.setProperty(
				`--c${id}`,
				isFound ? PIECES_DATA[id].color : '#E6E6E6'
			);
		});
	}

	// === Router de clic pour .bt1 ===
	let bt1Mode = 'enter'; // 'enter' -> toLayout3, puis 'play' -> toLayout
	const handleBt1 = (e) => (bt1Mode === 'enter' ? (toLayout3(e), applyColors()) : '');

	onMount(() => {
		found = localStorage.getItem('found')?.split(',').filter(Boolean) || [];
		console.log('found', found);
	});

	function apply(layout, contaWidth, contaHeight) {
		if (contaWidth || contaHeight) {
			gsap.to('.conta', {
				width: contaWidth,
				height: contaHeight,
				duration: 0.6,
				ease: 'power2.inOut'
			});
		}
		layout.forEach((item, i) => {
			const { cls, ...props } = item;
			gsap.to(cls, {
				...props,
				duration: 0.6,
				ease: 'power2.inOut',
				delay: i * 0.03
			});
		});
	}

	function getRects(selectors) {
		const rects = {};
		selectors.forEach((sel) => (rects[sel] = document.querySelector(sel)?.getBoundingClientRect()));
		return rects;
	}

	function toLayout3(e) {
		e?.preventDefault();
		// Hauteur de référence : même hauteur que .bt2
		const targetRect = document.querySelector('.bt2').getBoundingClientRect();
		const targetY = targetRect.top + window.scrollY;

		// 1) .conta : 30dvh × 30dvh, centrée H, et alignée à la hauteur de .bt2
		gsap.to('.conta', {
			width: '80dvw',
			height: '80dvw',
			left: '50%',
			xPercent: -50, // équivaut à translateX(-60%)
			// top: targetY,
			// rcent: 0,       // on aligne le bord haut sur la hauteur de .bt2
			top: '50%',
			yPercent: -50, // on aligne le bord haut sur la hauteur de .bt2
			x: 0,
			y: 0,
			duration: 0.6,
			ease: 'power2.inOut',
			onComplete: () => {
				goto('/start');
			}
		});
		gsap.to('.piece polygon', {
			delay: 0.4,
			strokeWidth: 4,
			strokeLinejoin: 'bevel',
			duration: 0.2,
			ease: 'power2.inOut'
		});

		gsap.to('.title', {
			left: '20px',
			top: '20px',
			// xPercent: 0,
			duration: 0.6,
			ease: 'power2.inOut'
		});
		gsap.fromTo(".title",{
			x: "-50%",
			fontSize: "1.75rem"
		},{
			x: 0,
			fontSize: "1.188rem",
		});




		// gsap.to(".text-bouton", {
		//   width:"100%",
		//   height:"100%",
		//   duration: 0.6,
		//   ease: "power2.inOut"
		// });
		gsap.to('.controls , .meme', {
			opacity: 0,
			display: 'none',
			// width:"75%",
			// top: "50%",
			// yPercent: -50,
			// x: 0,
			// y: 0,
			duration: 0.2,
			ease: 'power2.inOut'
		});
		gsap.to('.bloc_one', {
			opacity: 1,
			display: 'flex',
			delay: 0.4,
			duration: 0.4,
			ease: 'power2.inOut'
		});

		// gsap.to(".controls .text-bouton", {
		//   padding:"20px",
		// });
		// gsap.to(".text-bouton span", {
		//   opacity:0,
		// });

		// 3) Pièces : retour EXACT aux valeurs de ton CSS initial
		const layoutInitial = [
			{
				cls: '.p1',
				left: 0,
				top: 0,
				right: 'initial',
				bottom: 'initial',
				width: '75%',
				rotate: 0,
				height: 'initial'
			},
			{
				cls: '.p2',
				left: 'initial',
				top: 0,
				right: 0,
				bottom: 0,
				height: '50%',
				rotate: 0,
				width: 'initial'
			},
			{
				cls: '.p3',
				left: 0,
				top: 0,
				right: 0,
				bottom: 0,
				height: '100%',
				rotate: 0,
				width: 'initial'
			},
			{
				cls: '.p4',
				left: 'initial',
				top: 'initial',
				right: 0,
				bottom: 0,
				rotate: 0,
				width: 'initial',
				height: '50%'
			},
			{
				cls: '.p5',
				left: 0,
				top: 'initial',
				right: 'initial',
				bottom: 0,
				width: '100%',
				rotate: 0,
				height: 'initial'
			},
			{
				cls: '.p6',
				left: 'initial',
				top: 'initial',
				right: 0,
				bottom: 0,
				width: '50%',
				rotate: 0,
				yPercent: -50,
				height: 'initial'
			},
			{
				cls: '.p7',
				left: 0,
				right: 0,
				top: '25%',
				bottom: 'initial',
				width: '50%',
				rotate: 0,
				height: 'initial'
			}
		];
		apply(layoutInitial);

		// 4) Titre : retour à l’état initial
		// fitTitle(-45, 0.82, "center", true);

		// (Optionnel) si tu veux que bt1 redevienne "enter" après retour :
		// bt1Mode = 'enter';
	}

	function toLayout2Instant() {
		const r = getRects(['.p1', '.p2', '.p3', '.p4', '.p5', '.p6', '.p7']);

		const layout2 = [
			{
				cls: '.p1',
				left: `${-0.15 * r['.p1'].width}px`,
				bottom: `${0.12 * r['.p1'].height}px`,
				width: '71%'
			},
			{ cls: '.p2', width: '75%' },
			{ cls: '.p3', width: '75%' },
			{ cls: '.p4', left: `${-0.6 * r['.p4'].width}px`, rotate: 45, width: '40%' },
			{ cls: '.p5', rotate: -45, width: '70%' },
			{ cls: '.p6', width: '48%', rotate: 45 },
			{ cls: '.p7', top: `${-0.5 * r['.p7'].height}px`, rotate: 90, width: '75%' }
		];

		gsap.set('.conta', {
			width: '100dvw',
			height: '100dvh'
		});
		gsap.set('.controls', {
			top: document.querySelector('.bt2').getBoundingClientRect().top + window.scrollY
		});

		// appliquer layout instantanément
		layout2.forEach((item) => {
			const { cls, ...props } = item;
			gsap.set(cls, props);
		});
	}

	onMount(async () => {
		// Import scroll freeze utility
		const { freezeScroll, unfreezeScroll } = await import('$lib/utils/scrollFreeze.js');

		// Freeze scroll
		freezeScroll();

		// Preload start page for better performance
		preloadCode('/start');

		const mod = await import('gsap');
		gsap = mod.gsap;

		// Import dynamique du TextPlugin
		// const { TextPlugin } = await import('gsap/TextPlugin');
		// gsap.registerPlugin(TextPlugin);

		// aller directement au layout2 sans animation
		toLayout2Instant();

		return () => {
			unfreezeScroll();
		};
	});
</script>

<div class="">
	<div
		class="title text-intro inf-bold fixed top-[35px] left-[50%] z-1000 mx-auto w-max -translate-x-1/2 transform border bg-white px-[14px] py-1 tracking-[4%] drop-shadow-[var(--my-drop-shadow)]"
	>
			<a href="/">CHROMOGRAM #1</a>

	</div>
	<div class="controls fixed right-[initial] bottom-[35px] left-[50%] z-20 -translate-x-[50%]">
		<div
			onclick={handleBt1}
			class="bt1 text-bouton inf-bold z-10 w-fit border bg-white px-[15px] py-[7px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]"
		>
			<span>JOUER</span>
		</div>
	</div>
</div>

<div class="bloc_one absolute top-0 left-0 z-40 flex hidden h-svh w-screen flex-col items-center justify-evenly  pt-[70px] pb-[40px] text-center opacity-0">
	<div class="w-[90dvw]">
		<p>
			{#if totalFound === 0}
				Pars à la recherche des 7 couleurs du tangram pour débloquer le CHROMOGRAM !
			{:else if totalFound === 7}
				Bravo ! Tu as débloqué toutes les couleurs ! Les tangrams sont disponibles en cliquant en bas de page !<br/>
			{:else if totalFound === 1}
				Tu as découvert 1 couleur. Rassemble les 7 formes pour débloquer le CHROMOGRAM !
			{:else}
				Tu as déjà découvert {totalFound} couleurs. Rassemble les 7 formes pour débloquer le
				CHROMOGRAM !
			{/if}
		</p>
	</div>
	<div class="h-[80dvw] bg-transparent"></div>

	<div>
		<svg width="52" height="43" viewBox="0 0 52 43" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g clip-path="url(#clip0_2041_26)">
			<path d="M48 5H45V0H31V5H20V2H9V5H4C1.79 5 0 6.79 0 9V39C0 41.21 1.79 43 4 43H48C50.21 43 52 41.21 52 39V9C52 6.79 50.21 5 48 5ZM26.5 38C19.04 38 13 31.96 13 24.5C13 17.04 19.04 11 26.5 11C33.96 11 40 17.04 40 24.5C40 31.96 33.96 38 26.5 38Z" fill="black"/>
			<path d="M26.5 34C31.7467 34 36 29.7467 36 24.5C36 19.2533 31.7467 15 26.5 15C21.2533 15 17 19.2533 17 24.5C17 29.7467 21.2533 34 26.5 34Z" fill="black"/>
			</g>
		</svg>
	</div>

</div>

<div
	class="meme d-none absolute inset-x-0 top-0 z-10 flex h-[100dvh] flex-col items-center justify-evenly px-2 pt-[105px] pb-[25px]"
>
	<div class="text-bouton intro-intro height-auto max-w-prose text-center whitespace-pre-line">
		CHROMOGRAM ou tangram des couleurs est un jeu proposé par l'artiste Armelle Caron qui se renouvelle à chaque exposition de collection. L'art est habité de mille couleurs. Subtiles, franches, opposées, brutales ou délicates. Elles sont partout et toujours précisément choisies par les artistes.

		Le CHROMOGRAM #1 vous propose de les découvrir dans les salles de l'exposition ALLONS, de les observer avec attention pour révéler toutes leurs nuances.

		Retrouve les œuvres choisies par Armelle Caron à l’aide des 7 QR codes cachés dans l’exposition. Chacun d’eux propose une couleur à retrouver dans une œuvre de la même salle. Débloque ainsi, une à une, les formes du tangram.
	</div>

	<div
		class="bt2 text-bouton inf-bold z-10 w-fit border border-black bg-white px-[15px] py-[7px] tracking-[4%] opacity-0 drop-shadow-[var(--my-drop-shadow)]"
	>
		<span>JOUER</span>
	</div>
</div>

<footer class="fixed bottom-0 left-0 z-40 flex w-full items-center justify-between px-5 py-2">

</footer>

<div class="conta mt-2 absolute top-0 left-0 flex h-[103dvh] w-[103dvh] translate-0 flex-col justify-around">
	<div>
		<div class="piece p1">
			<svg viewBox="0 0 7.5 2.5">
				<polygon stroke-linejoin="bevel" points="7.5,2.5 2.5,2.5 0,0 5,0" />
			</svg>
		</div>

		<div class="piece p2">
			<svg viewBox="0 0 5 5">
				<polygon stroke-linejoin="bevel" points="0,0 5,0 5,5" />
			</svg>
		</div>

		<div class="piece p3">
			<svg viewBox="0 0 5 10">
				<polygon stroke-linejoin="bevel" points="0,10 0,0 5,5" />
			</svg>
		</div>

		<div class="piece p4">
			<svg viewBox="0 0 2.5 5">
				<polygon stroke-linejoin="bevel" points="2.5,5 2.5,0 0,2.5" />
			</svg>
		</div>

		<div class="piece p5">
			<svg viewBox="0 0 10 5">
				<polygon stroke-linejoin="bevel" points="0,5 10,5 5,0" />
			</svg>
		</div>

		<div class="piece p6">
			<svg viewBox="0 0 5 5">
				<polygon stroke-linejoin="bevel" points="0,2.5 2.5,0 5,2.5 2.5,5" />
			</svg>
		</div>

		<div class="piece p7">
			<svg viewBox="0 0 5 2.5">
				<polygon stroke-linejoin="bevel" points="5,0 0,0 2.5,2.5" />
			</svg>
		</div>
	</div>
</div>

<style>
	.piece polygon {
		/* fill: var(--cMyPiece); */
		transition: fill 0.4s ease-in 0.2s; /* durée 0.2s, delay 0.4s */
	}
	body,
	html {
		overflow: hidden;
		height: 100%;
		overscroll-behavior: none; /* évite le "rebond" sur mobile */
	}
	/* Une pièce = conteneur absolument positionné + 1 SVG avec viewBox identique */
	.piece {
		position: fixed;
		transform-origin: center;
		will-change: left, top, width, transform;
		pointer-events: auto; /* mets à auto si tu veux rendre cliquable la pièce */
		top: initial;
		right: initial;
		bottom: initial;
		left: initial;
	}
	.piece svg {
		display: block;
		height: 100%;
		width: auto;
		overflow: visible;
		fill:#fff;
	}
	.piece polygon {
		stroke: #fff;
		stroke-width: 0;
		vector-effect: non-scaling-stroke;
		fill:#fff;
	}
	.p1 {
		width: 75%;
		top: initial;
		right: initial;
		left: 0;
		z-index: 10;
	}
	.p2 {
		left: 100%;
		bottom: 0;
		height: 50%;
		top: initial;
		right: initial;
		z-index: 100;
	}
	.p3 {
		height: 100%;
		top: 0;
		right: initial;
		bottom: initial;
		left: -100%;
	}
	.p4 {
		width: initial;
		height: 50%;
		bottom: initial;
		right: initial;
		top: initial;
		left: initial;
		top: 16%;
		z-index: 10;
		rotate: 0;
	}
	.p5 {
		left: 56%;
		top: 12%;
		bottom: initial;
		width: 100%;
		right: initial;
	}
	.p6 {
		top: initial;
		right: initial;
		bottom: 12%;
		left: 64%;
		width: 50%;
		transform: translateY(0);
	}
	.p7 {
		width: 50%;
		left: -10%;
		bottom: initial;
		right: initial;
		top: 25%;
		margin: auto;
		z-index: 1;
		/* transform: translateY(-50%); */
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