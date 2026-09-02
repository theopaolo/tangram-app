<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	let gsap;

	import { goto } from '$app/navigation';
	import { activeArtworks } from '$lib/chromogramStore.js';
	import { piecesStore } from '$lib/piecesStore.js';

	// Get piece ID from URL params
	const pieceId = $derived($page.params.id);
	const currentPiece = $derived($activeArtworks[pieceId]);

	let totalFound = $state(0);
	let foundPieces = $state([]);

	// --- FUNCTIONS ---
	onMount(() => {
		piecesStore.initialize();
		totalFound = piecesStore.count;
		foundPieces = piecesStore.pieces;
	});

	function handleCC(id) {
		if (foundPieces.includes(id)) {
			goto(`/indices/${id}`);
		}
	}

	// Animation-specific configuration based on piece ID
	const getAnimationConfig = (id) => {
		switch (id) {
			case '1':
				return {
					cols: 5,
					rows: 16,
					w: 7.5,
					h: 2.5,
					rowGap: -0.02,
					visibleCols: 2.6,
					shape: '7.5,2.5 2.5,2.5 0,0 5,0'
				};
			case '2':
				return {
					cols: 7,
					rows: 7,
					w: 5,
					h: 5,
					rowGap: 0,
					visibleCols: 2.2,
					shape: '0,0 5,0 5,5'
				};
			case '3':
				return {
					cols: 11,
					rows: 5,
					w: 5,
					h: 10,
					rowGap: 0,
					visibleCols: 2.2,
					shape: '0,10 0,0 5,5'
				};
			case '4':
				return {
					cols: 9,
					rows: 9,
					w: 2.5,
					h: 5,
					rowGap: 0,
					visibleCols: 4.3,
					shape: '2.5,5 2.5,0 0,2.5'
				};
			case '5':
				return {
					cols: 11,
					rows: 11,
					w: 10,
					h: 5,
					rowGap: 0,
					visibleCols: 1.4,
					shape: '0,5 10,5 5,0'
				};
			case '6':
				return {
					cols: 7,
					rows: 9,
					w: 5,
					h: 5,
					rowGap: 0,
					visibleCols: 2.3,
					shape: '0,2.5 2.5,0 5,2.5 2.5,5'
				};
			case '7':
				return {
					cols: 9,
					rows: 15,
					w: 5,
					h: 2.5,
					rowGap: 0,
					visibleCols: 2.5,
					shape: '5,0 0,0 2.5,2.5'
				};
			default:
				return {
					cols: 11,
					rows: 5,
					w: 5,
					h: 10,
					rowGap: 0,
					visibleCols: 2.2,
					shape: '0,10 0,0 5,5'
				};
		}
	};

	const config = $derived(getAnimationConfig(pieceId));
	const rowPitch = $derived(config.h + config.rowGap);
	const viewW = $derived(config.visibleCols * config.w);
	const viewH = $derived(config.rows * rowPitch);
	const gridW = $derived(config.cols * config.w);
	const gridH = $derived(config.rows * config.h);

	onMount(async () => {
		const mod = await import('gsap');
		gsap = mod.gsap;

		const svg = document.querySelector('svg');
		const whole = document.querySelector('.whole');
		const pieces = document.querySelectorAll('.piece');
		const tiles = document.querySelectorAll('.tile');
		const wrapper = document.getElementById('zoom-wrapper');

		let zoomed = false;

		// Tap vs double tap : petit délai pour que le tap simple
		// ne se déclenche pas aussi pendant un double tap.
		// 180 ms : le minimum pour attraper un double clic sans que
		// la latence du simple clic soit trop sensible.
		let tapTimeout;
		const addTapHandlers = (el, onTap, onDoubleTap) => {
			el?.addEventListener('click', () => {
				clearTimeout(tapTimeout);
				tapTimeout = setTimeout(onTap, 180);
			});
			el?.addEventListener('dblclick', (e) => {
				clearTimeout(tapTimeout);
				onDoubleTap(e);
			});
		};

		// Animation logic based on piece ID
		switch (pieceId) {
			case '1': // Respiration — pulsation radiale depuis le centre
				gsap.to(pieces, {
					scale: 0.55,
					transformOrigin: '50% 50%',
					duration: 3,
					ease: 'sine.inOut',
					yoyo: true,
					repeat: -1,
					stagger: { each: 0.06, grid: [config.rows, config.cols], from: 'center' }
				});

				addTapHandlers(
					whole,
					// Tap : onde de rotation depuis le centre — angle et sens différents à chaque tap
					() => {
						const angle = gsap.utils.random([-1, 1]) * gsap.utils.random(45, 200);
						gsap.to(pieces, {
							rotation: `+=${angle}`,
							transformOrigin: '50% 50%',
							duration: gsap.utils.random(0.8, 1.6),
							ease: 'power2.inOut',
							stagger: { each: 0.02, grid: [config.rows, config.cols], from: 'center' }
						});
					},
					// Double tap : zoom + rotation d'ensemble dans le même mouvement —
					// angle et sens tirés au sort, retour à plat au dézoom
					() => {
						gsap.to(svg, {
							scale: zoomed ? 1 : 2,
							rotation: zoomed ? 0 : gsap.utils.random([-1, 1]) * gsap.utils.random(60, 180),
							transformOrigin: '50% 50%',
							duration: 1.2,
							ease: 'power2.inOut'
						});
						zoomed = !zoomed;
					}
				);
				break;

			case '2': // Éclosion (variante) — les triangles s'écartent doucement puis se recomposent
				gsap.to(pieces, {
					x: () => `+=${gsap.utils.random(-config.w * 0.4, config.w * 0.4)}`,
					y: () => `+=${gsap.utils.random(-config.h * 0.4, config.h * 0.4)}`,
					rotation: () => `+=${gsap.utils.random(-120, 120)}`,
					transformOrigin: '50% 50%',
					duration: 3,
					ease: 'sine.inOut',
					yoyo: true,
					repeat: -1,
					repeatRefresh: true,
					repeatDelay: 0.5,
					stagger: { each: 0.015, from: 'random' }
				});

				addTapHandlers(
					whole,
					// Tap : frisson — contraction rapide des pièces
					() => {
						gsap.fromTo(
							pieces,
							{ scale: 1 },
							{
								scale: 0.4,
								transformOrigin: '50% 50%',
								duration: 0.3,
								ease: 'power2.out',
								yoyo: true,
								repeat: 1,
								overwrite: 'auto',
								stagger: { each: 0.003, from: 'random' }
							}
						);
					},
					// Double tap : zoom sur le point touché
					(e) => {
						const pt = svg.createSVGPoint();
						pt.x = e.clientX;
						pt.y = e.clientY;
						const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

						gsap.to(wrapper, {
							scale: zoomed ? 1 : 2,
							svgOrigin: `${svgP.x} ${svgP.y}`,
							duration: 1.2,
							ease: 'power2.inOut'
						});
						zoomed = !zoomed;
					}
				);
				break;

			case '3': // Algues — balancement organique porté par le courant
				const sway = gsap.fromTo(
					pieces,
					{ rotation: -7 },
					{
						rotation: 7,
						transformOrigin: '50% 100%',
						duration: 6.5,
						ease: 'sine.inOut',
						yoyo: true,
						repeat: -1,
						stagger: { each: 0.12, grid: [config.rows, config.cols], from: 'start' }
					}
				);

				// Glissement — en plus du balancement, chaque algue dérive lentement
				// autour de sa place, portée par le courant
				gsap.to(pieces, {
					x: () => `+=${gsap.utils.random(-config.w * 0.4, config.w * 0.4)}`,
					y: () => `+=${gsap.utils.random(-config.h * 0.12, config.h * 0.12)}`,
					duration: () => gsap.utils.random(9, 14),
					ease: 'sine.inOut',
					yoyo: true,
					repeat: -1,
					repeatRefresh: true,
					stagger: { each: 0.04, grid: [config.rows, config.cols], from: 'start' }
				});

				// Travelling latéral — la fenêtre ne montre que ~2 colonnes sur 11 :
				// toute la nappe dérive lentement pour faire défiler les autres, puis revient
				gsap.to(document.querySelectorAll('.row'), {
					x: -(gridW - viewW),
					duration: 80,
					ease: 'sine.inOut',
					yoyo: true,
					repeat: -1
				});

				addTapHandlers(
					whole,
					// Tap : bourrasque — un coup de courant traverse la nappe dans un sens
					// tiré au sort. Chaque algue se couche avec sa propre amplitude et son
					// propre tempo, puis revient toujours à la verticale (pas de skew
					// résiduel même en cliquant en rafale), pendant que le balancement
					// s'emballe et se calme
					() => {
						const dir = gsap.utils.random([-1, 1]);
						gsap.fromTo(
							sway,
							{ timeScale: 2 },
							{ timeScale: 1, duration: 3, ease: 'power2.out', overwrite: 'auto' }
						);
						gsap.to(pieces, {
							keyframes: [
								{
									skewX: () => dir * gsap.utils.random(12, 32),
									duration: 0.7,
									ease: 'sine.out'
								},
								{
									skewX: 0,
									duration: () => gsap.utils.random(0.9, 1.6),
									ease: 'sine.inOut'
								}
							],
							transformOrigin: '50% 100%',
							overwrite: 'auto',
							stagger: {
								each: 0.018,
								grid: [config.rows, config.cols],
								from: dir === 1 ? 'start' : 'end'
							}
						});
					},
					// Double tap : plongée inclinée dans les algues
					() => {
						gsap.to(svg, {
							scale: zoomed ? 1 : 2.6,
							rotation: zoomed ? 0 : 12,
							transformOrigin: '50% 50%',
							duration: 1.2,
							ease: 'power2.inOut'
						});
						zoomed = !zoomed;
					}
				);
				break;

			case '4': // Engrenages — rotation lente du plateau, contre-rotation des pièces
				const plateau = gsap.to(svg, {
					rotation: 360,
					transformOrigin: '50% 50%',
					duration: 240,
					ease: 'none',
					repeat: -1
				});

				const gears = gsap.to(pieces, {
					rotation: -360,
					transformOrigin: '50% 50%',
					duration: 24,
					ease: 'none',
					repeat: -1
				});

				addTapHandlers(
					whole,
					// Tap : les engrenages s'emballent puis reprennent leur rythme
					() => {
						gsap.fromTo(
							gears,
							{ timeScale: 6 },
							{ timeScale: 1, duration: 3, ease: 'power3.out', overwrite: 'auto' }
						);
					},
					// Double tap : zoom au centre, le plateau ralentit tant qu'on est zoomé
					() => {
						gsap.to(wrapper, {
							scale: zoomed ? 1 : 3,
							transformOrigin: '50% 50%',
							duration: 1.2,
							ease: 'power2.inOut'
						});
						gsap.to(plateau, {
							timeScale: zoomed ? 1 : 0.15,
							duration: 1.2,
							ease: 'power2.inOut'
						});
						zoomed = !zoomed;
					}
				);
				break;

			case '5': // Éclosion — le motif se disperse doucement puis se recompose
				gsap.to(pieces, {
					x: () => `+=${gsap.utils.random(-config.w * 0.5, config.w * 0.5)}`,
					y: () => `+=${gsap.utils.random(-config.h * 0.5, config.h * 0.5)}`,
					rotation: () => `+=${gsap.utils.random(-150, 150)}`,
					transformOrigin: '50% 50%',
					duration: 3.5,
					ease: 'sine.inOut',
					yoyo: true,
					repeat: -1,
					repeatRefresh: true,
					repeatDelay: 0.6,
					stagger: { each: 0.012, from: 'random' }
				});

				addTapHandlers(
					whole,
					// Tap : frisson — contraction rapide des pièces
					() => {
						gsap.fromTo(
							pieces,
							{ scale: 1 },
							{
								scale: 0.4,
								transformOrigin: '50% 50%',
								duration: 0.3,
								ease: 'power2.out',
								yoyo: true,
								repeat: 1,
								overwrite: 'auto',
								stagger: { each: 0.003, from: 'random' }
							}
						);
					},
					// Double tap : zoom sur le point touché
					(e) => {
						const pt = svg.createSVGPoint();
						pt.x = e.clientX;
						pt.y = e.clientY;
						const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

						gsap.to(wrapper, {
							scale: zoomed ? 1 : 2,
							svgOrigin: `${svgP.x} ${svgP.y}`,
							duration: 1.2,
							ease: 'power2.inOut'
						});
						zoomed = !zoomed;
					}
				);
				break;

			case '6': // Mosaïque — retournements en damier, effet de persiennes
				const evens = Array.from(pieces).filter((_, i) => i % 2 === 0);
				const odds = Array.from(pieces).filter((_, i) => i % 2 === 1);

				// Retournements décalés pièce par pièce (stagger) : jamais toute une
				// moitié du damier à plat au même instant — moins de clignotement
				const flipEvens = gsap.to(evens, {
					scaleY: -1,
					transformOrigin: '50% 50%',
					duration: 1.2,
					ease: 'power2.inOut',
					yoyo: true,
					repeat: -1,
					repeatDelay: 1.1,
					stagger: { each: 0.03, from: 'start' }
				});
				const flipOdds = gsap.to(odds, {
					scaleY: -1,
					transformOrigin: '50% 50%',
					duration: 1.2,
					ease: 'power2.inOut',
					yoyo: true,
					repeat: -1,
					repeatDelay: 1.1,
					delay: 0.85,
					stagger: { each: 0.03, from: 'start' }
				});

				addTapHandlers(
					whole,
					// Tap : vague de rotation depuis les bords — les persiennes se calment
					// le temps de la vague pour éviter l'effet stroboscopique
					() => {
						[flipEvens, flipOdds].forEach((flip) => {
							gsap.fromTo(
								flip,
								{ timeScale: 0.35 },
								{ timeScale: 1, duration: 2, ease: 'power2.in', overwrite: 'auto' }
							);
						});
						gsap.to(pieces, {
							rotation: '+=90',
							transformOrigin: '50% 50%',
							duration: 0.8,
							ease: 'back.inOut(1.4)',
							stagger: { each: 0.01, grid: [config.rows, config.cols], from: 'edges' }
						});
					},
					// Double tap : recul pour voir toute la nappe
					() => {
						gsap.to(wrapper, {
							scale: zoomed ? 1 : 0.5,
							transformOrigin: '50% 50%',
							duration: 1.2,
							ease: 'power2.inOut'
						});
						zoomed = !zoomed;
					}
				);
				break;

			case '7': // Spirale — rotations en phase décalée depuis le centre, moiré hypnotique
				gsap.to(pieces, {
					rotation: '+=360',
					transformOrigin: '50% 50%',
					duration: 12,
					ease: 'none',
					repeat: -1,
					stagger: { each: 0.1, grid: [config.rows, config.cols], from: 'center' }
				});

				addTapHandlers(
					whole,
					// Tap : pulsation radiale qui traverse la spirale
					() => {
						gsap.fromTo(
							pieces,
							{ scale: 1 },
							{
								scale: 0.5,
								transformOrigin: '50% 50%',
								duration: 0.4,
								ease: 'sine.inOut',
								yoyo: true,
								repeat: 1,
								overwrite: 'auto',
								stagger: { each: 0.015, grid: [config.rows, config.cols], from: 'center' }
							}
						);
					},
					// Double tap : zoom sur le point touché
					(e) => {
						const pt = svg.createSVGPoint();
						pt.x = e.clientX;
						pt.y = e.clientY;
						const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

						gsap.to(wrapper, {
							scale: zoomed ? 1 : 2.5,
							svgOrigin: `${svgP.x} ${svgP.y}`,
							duration: 1.2,
							ease: 'power2.inOut'
						});
						zoomed = !zoomed;
					}
				);
				break;

			default:
				// Repli : rotation lente de l'ensemble
				gsap.to(pieces, {
					rotation: '+=360',
					transformOrigin: '50% 50%',
					duration: 180,
					ease: 'none',
					repeat: -1
				});
		}

		// --- Import scroll freeze utility ---
		const { freezeScroll, unfreezeScroll } = await import('$lib/utils/scrollFreeze.js');

		// Freeze scroll on mobile
		freezeScroll();

		// --- Cleanup quand le composant est démonté ---
		return () => {
			unfreezeScroll();
			gsap.globalTimeline.clear();
		};
	});
</script>

{#if currentPiece}
	<div class="absolute z-1 h-svh w-screen">
		<div class="whole absolute z-1 h-svh w-screen">
			{#if pieceId === '2' || pieceId === '4' || pieceId === '5' || pieceId === '6' || pieceId === '7'}
				<!-- Animations 2,4,5,6,7: Have zoom wrapper -->
				<svg
					overflow="visible"
					viewBox={`${-viewW / 2} ${-viewH / 2} ${viewW} ${viewH}`}
					width="100%"
					height="100%"
					preserveAspectRatio="xMidYMid slice"
				>
					<g id="zoom-wrapper" transform={`translate(${-gridW / 2}, ${-gridH / 2})`}>
						{#each Array(config.rows) as _, r}
							<g class="row" transform={`translate(0, ${r * config.h})`}>
								{#each Array(config.cols) as _, c}
									<polygon
										fill={currentPiece.color}
										class="piece"
										points={config.shape}
										transform={`translate(${c * config.w}, 0)`}
									/>
								{/each}
							</g>
						{/each}
					</g>
				</svg>
			{:else if pieceId === '1'}
				<svg
					overflow="visible"
					viewBox={`0 0 ${viewW} ${viewH}`}
					width="100%"
					height="100%"
					preserveAspectRatio="xMidYMid slice"
				>
					<g transform={`translate(${(viewW - gridW) / 2}, ${(viewH - gridH) / 2})`}>
						{#each Array(config.rows) as _, r}
							<g class="row" transform={`translate(0, ${r * rowPitch})`}>
								{#each Array(config.cols) as _, c}
									<polygon
										fill={currentPiece.color}
										class="piece"
										points={config.shape}
										transform={`translate(${c * config.w}, 0)`}
									/>
								{/each}
							</g>
						{/each}
					</g>
				</svg>
			{:else}
				<!-- Animations 1,3: Basic row structure -->
				<svg
					overflow="visible"
					viewBox={`0 0 ${viewW} ${viewH}`}
					width="100%"
					height="100%"
					preserveAspectRatio="xMidYMid slice"
				>
					{#each Array(config.rows) as _, r}
						<g class="row" transform={`translate(0, ${r * rowPitch})`}>
							{#each Array(config.cols) as _, c}
								<polygon
									fill={currentPiece.color}
									class="piece"
									points={config.shape}
									transform={`translate(${c * config.w}, 0)`}
								/>
							{/each}
						</g>
					{/each}
				</svg>
			{/if}
		</div>
	</div>

	<div
		class="no-select pointer-events-none relative z-2 flex min-h-svh flex-col items-center justify-between py-[70px] text-center"
	>
		<div
			class="pointer-events-none max-w-4/5 border border-black bg-white px-[50px] py-[20px] text-center drop-shadow"
		>
			Bravo tu as découvert
			<div class="text-titre-alt inf-bold my-5 uppercase">
				{currentPiece.color_name}
			</div>
			Retrouve l’œuvre choisie par Armelle<br />qui correspond à cette couleur.
			<!-- À quelle œuvre penses-tu que<br/>cette couleur appartient ? -->
		</div>

		<button
			class="text-titre-alt inf-bold height-auto pointer-events-auto max-w-4/5 border border-black bg-white px-[30px] py-[25px] text-center whitespace-pre-line uppercase drop-shadow-[var(--my-drop-shadow)]"
			onclick={() => handleCC(pieceId)}
			tabindex="0"
			onkeydown={(e) => e.key === 'Enter' && handleCC(pieceId)}
		>
			VERIFIE TON HYPOTHÈSE<br />EN APPUYANT ICI
		</button>
	</div>
{:else}
	<div class="flex min-h-svh items-center justify-center">
		<div class="text-center">
			<h1 class="mb-4 text-2xl font-bold">Pièce non trouvée</h1>
			<p>La pièce {pieceId} n'existe pas.</p>
			<button onclick={() => goto('/start')} class="mt-4 rounded bg-blue-500 px-4 py-2 text-white">
				Retour au début
			</button>
		</div>
	</div>
{/if}

<style>
	polygon {
		will-change: transform;
	}
	.row,
	.whole {
		will-change: transform;
	}
</style>
