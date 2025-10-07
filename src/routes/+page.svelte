<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { PIECES_DATA } from '$lib/piecesData';
	import { piecesStore } from '$lib/piecesStore.js';

	let totalFound = $state(0);
	let foundPieces = $state([]);

	onMount(() => {
		applyColors();
	});

	function applyColors() {
		if (typeof document === 'undefined') return; // SSR guard

		Object.keys(PIECES_DATA).forEach((id) => {
			const color = PIECES_DATA[id].color;

			document.querySelectorAll(`.p${id} polygon`).forEach((el) => {
				el.setAttribute("fill", color);
			});
		});
	}


	let gsap; // SSR-safe

	// === Router de clic pour .bt1 ===
	let bt1Mode = 'enter'; // 'enter' -> toLayout2, puis 'play' -> toLayout3
	const handleBt1 = (e) => (bt1Mode === 'enter' ? toLayout2(e) : '');

	// === Helpers TITLE (inchangé) ===
	let curAngle = -45;
	let curFrac = 0.82;
	let curPlace = 'center';

	function measureBaseWH(el) {
		const clone = el.cloneNode(true);
		clone.style.cssText += `
      position:fixed; left:-99999px; top:0;
      transform:none; transform-origin:center;
      white-space:nowrap; visibility:hidden;
    `;
		document.body.appendChild(clone);
		const r = clone.getBoundingClientRect();
		document.body.removeChild(clone);
		return { w: r.width, h: r.height };
	}

	function fitTitle(angleDeg, targetFrac, place, animate = false) {
		const el = document.querySelector('.title');
		if (!el || !gsap) return;

		curAngle = angleDeg;
		curFrac = targetFrac;
		curPlace = place;

		let scaleValue = 1;
		if (targetFrac !== 1) {
			const { w, h } = measureBaseWH(el);
			const T = window.innerWidth * targetFrac;
			const a = (angleDeg * Math.PI) / 180;
			const denom = Math.abs(w * Math.cos(a)) + Math.abs(h * Math.sin(a)) || 1;
			scaleValue = T / denom;
		}

		const pos =
			place === 'center'
				? { left: '50%', top: '40%', xPercent: -50, yPercent: -40, x: 0, y: 0 }
				: { left: '50%', top: '35px', xPercent: -50, yPercent: 0, x: 0, y: 0 };

		gsap.to(el, {
			...pos,
			rotate: angleDeg,
			scale: scaleValue,
			transformOrigin: 'center center',
			duration: animate ? 0.6 : 0,
			ease: 'power2.inOut'
		});
	}

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

	function toLayout2(e) {
		e?.preventDefault();

		const targetRect = document.querySelector('.bt2').getBoundingClientRect();
		const r = getRects(['.p1', '.p2', '.p3', '.p4', '.p5', '.p6', '.p7']);

		const layout2 = [
			{
				cls: '.p1',
				left: `${-0.15 * r['.p1'].width}px`,
				bottom: `${0.12 * r['.p1'].height}px`,
				top: 'initial',
				right: 'initial',
				rotate: 0,
				width: '71%'
			},
			{
				cls: '.p2',
				left: '100%',
				bottom: '0',
				top: 'initial',
				right: 'initial',
				rotate: 0,
				width: '75%'
			},
			{
				cls: '.p3',
				left: '-100%',
				bottom: '0',
				top: 'initial',
				right: 'initial',
				rotate: 0,
				width: '75%'
			},
			{
				cls: '.p4',
				left: `${-0.6 * r['.p4'].width}px`,
				bottom: 'initial',
				top: '16%',
				right: 'initial',
				rotate: 45,
				width: '40%'
			},
			{
				cls: '.p5',
				left: '56%',
				bottom: 'initial',
				top: '12%',
				right: 'initial',
				rotate: -45,
				width: '70%'
			},
			{
				cls: '.p6',
				left: '64%',
				bottom: '12%',
				top: 'initial',
				right: 'initial',
				rotate: 45,
				width: '48%',
				yPercent: 0,
				y: 0
			},
			{
				cls: '.p7',
				left: '-10%',
				bottom: 'initial',
				top: `${-0.5 * r['.p7'].height}px`,
				right: 'initial',
				rotate: 90,
				width: '75%'
			}
		];

		gsap.to('.piece polygon', { strokeWidth: 0, duration: 0.4 });
		gsap.to('.conta', {
			left: '0',
			top: '0',
			x: 0,
			y: 0,
			transform: 'translate(0%, 0%)',
			width: '100dvw',
			height: '100dvh',
			duration: 0.6,
			ease: 'power2.inOut'
		});
		gsap.to('.intro-intro', { opacity: 1, display: 'block', duration: 0.3, delay: 0.4 });

		gsap.to('.controls', {
			left: '50%',
			right: 'initial',
			xPercent: -50,
			top: targetRect.top + window.scrollY,
			duration: 0.6,
			ease: 'power2.inOut',
			onStart: () => {
				// Effet “slot” puis mot final
				const finalText = 'JOUER';
				const len = finalText.length;
				const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
				const cycles = 5;
				const step = 0.08;
				const randStr = () =>
					Array.from({ length: len }, () => chars[(Math.random() * chars.length) | 0]).join('');

				gsap.to(
					{},
					{
						duration: step,
						repeat: cycles - 1,
						ease: 'none',
						onRepeat: () => {
							gsap.to('.bt1', {
								duration: step,
								text: { value: randStr(), delimiter: '' },
								ease: 'none'
							});
						},
						onComplete: () => {
							gsap.to('.bt1', {
								duration: 0.6,
								text: { value: finalText, delimiter: '' },
								ease: 'none',
								onComplete: () => {
									// ⬅️ Dès maintenant, .bt1 agit comme bt2
									bt1Mode = 'play';
									// Got to page /home with state to indicate transition from index
									goto('/home', { state: { fromIndex: true } });
								}
							});
						}
					}
				);
			}
		});

		apply(layout2);
		fitTitle(0, 1, 'topLeft', true);
	}

	onMount(async () => {
		// Import scroll freeze utility
		const { freezeScroll, unfreezeScroll } = await import('$lib/utils/scrollFreeze.js');

		// Freeze scroll
		freezeScroll();

		// GSAP + TextPlugin (SSR-safe)
		const mod = await import('gsap');
		const TextPlugin = (await import('gsap/TextPlugin')).TextPlugin;
		mod.gsap.registerPlugin(TextPlugin);
		gsap = mod.gsap;

		// init title
		fitTitle(-45, 0.82, 'center', false);

		const onRez = () => fitTitle(curAngle, curFrac, curPlace, false);
		window.addEventListener('resize', onRez);

		return () => {
			unfreezeScroll();
			window.removeEventListener('resize', onRez);
		};
	});
</script>

<div class="h-svh">
	<div
		class="title text-intro inf-bold fixed z-10 mx-auto w-fit w-max border bg-white px-[14px] py-1 tracking-[4%] drop-shadow-[var(--my-drop-shadow)]"
	>
		CHROMOGRAM #1
	</div>

	<div class="controls fixed right-[50px] bottom-[35px] z-20">
		<div
			onclick={handleBt1}
			class="bt1 text-bouton inf-bold z-10 w-fit border bg-white px-[15px] py-[7px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]"
		>
			ENTRER
		</div>
	</div>
</div>

<div
	class="d-none absolute inset-x-0 top-0 z-10 flex h-[100dvh] flex-col items-center justify-evenly px-2 pt-[105px] pb-[25px]"
>
	<div
		class="text-bouton intro-intro height-auto max-w-prose text-center whitespace-pre-line opacity-0"
	>
		CHROMOGRAM ou tangram des couleurs est un jeu proposé par l'artiste Armelle Caron qui se renouvelle à chaque exposition de collection. L'art est habité de mille couleurs. Subtiles, franches, opposées, brutales ou délicates. Elles sont partout et toujours précisément choisies par les artistes.

		Le CHROMOGRAM #1 vous propose de les découvrir dans les salles de l'exposition ALLONS, de les observer avec attention pour révéler toutes leurs nuances.

		Retrouve les œuvres choisies par Armelle Caron à l’aide des 7 QR codes cachés dans l’exposition. Chacun d’eux propose une couleur à retrouver dans une œuvre de la même salle. Débloque ainsi, une à une, les formes du tangram.
	</div>

	<div
		class="bt2 text-bouton inf-bold z-10 w-fit border border-black bg-white px-[15px] py-[7px] tracking-[4%] opacity-0 drop-shadow-[var(--my-drop-shadow)]"
	>
		ENTRER
	</div>
</div>

<div
	class="conta absolute top-1/2 left-1/2 h-[103dvh] w-[103dvh] -translate-x-[60%] -translate-y-1/2"
>
	<div class="piece p1">
		<svg viewBox="0 0 7.5 2.5">
			<polygon points="7.5,2.5 2.5,2.5 0,0 5,0" />
		</svg>
	</div>

	<div class="piece p2">
		<svg viewBox="0 0 5 5">
			<polygon points="0,0 5,0 5,5" />
		</svg>
	</div>

	<div class="piece p3">
		<svg viewBox="0 0 5 10">
			<polygon points="0,10 0,0 5,5" />
		</svg>
	</div>

	<div class="piece p4">
		<svg viewBox="0 0 2.5 5">
			<polygon points="2.5,5 2.5,0 0,2.5" />
		</svg>
	</div>

	<div class="piece p5">
		<svg viewBox="0 0 10 5">
			<polygon points="0,5 10,5 5,0" />
		</svg>
	</div>

	<div class="piece p6">
		<svg viewBox="0 0 5 5">
			<polygon points="0,2.5 2.5,0 5,2.5 2.5,5" />
		</svg>
	</div>

	<div class="piece p7">
		<svg viewBox="0 0 5 2.5">
			<polygon points="5,0 0,0 2.5,2.5" />
		</svg>
	</div>
</div>

<style>
	body,
	html {
		overflow: hidden;
		height: 100%;
		overscroll-behavior: none; /* évite le "rebond" sur mobile */
	}
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
	}
	.piece polygon {
		stroke: #fff;
		stroke-width: 4;
		vector-effect: non-scaling-stroke;
	}
	.p1 {
		width: 75%;
		top: 0;
		left: 0;
		z-index: 10;
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
</style>
