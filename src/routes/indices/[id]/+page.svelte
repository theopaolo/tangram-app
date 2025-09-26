<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { piecesStore } from '$lib/piecesStore.js';
	import { PIECES_DATA } from '$lib/piecesData';

	const PIECES_ENTRIES = Object.entries(PIECES_DATA);

	let foundPieces = $derived($piecesStore);

	let scrollContainer = $state(null);

	import { register } from 'swiper/element/bundle';
	register();
	let swiperEl = $state(null);

	onMount(() => {
		if (swiperEl) {
			Object.assign(swiperEl, {
				slidesPerView: 1,
				speed: 500,
				loop: true,
				pagination: {
					clickable: true
				},
				navigation: true
			});
			// Appliquer les variables CSS
			swiperEl.style.setProperty('--swiper-navigation-color', currentPiece.color);
			swiperEl.style.setProperty('--swiper-navigation-size', '0');
			swiperEl.style.setProperty('--swiper-pagination-bullet-inactive-opacity', '1');
			swiperEl.style.setProperty('--swiper-pagination-bullet-inactive-color', 'white');
			swiperEl.style.setProperty('--swiper-pagination-color', 'black');
			swiperEl.style.setProperty('--swiper-pagination-bullet-size', '10px');

			swiperEl.initialize();
		}
		// Scroll spy
		// scrollContainer.addEventListener('scroll', onScrollThrottled, { passive: true });
		// scrollContainer.addEventListener('resize', onScrollThrottled);

		// updateActiveOnScroll();

		// return () => {
		// 	scrollContainer.removeEventListener('scroll', onScrollThrottled);
		// 	scrollContainer.removeEventListener('resize', onScrollThrottled);
		// };


	});



	// ——————————————————
	// CONSTANTES
	// ——————————————————
	const LABELS = ["L'oeuvre", "D'après toi...", 'La Couleur'];
	const OFFSET = 90;
	const SCROLL_MS = 800;

	let gsap;
	let gsapReady;
	let circleEl = $state(null);

	onMount(async () => {
		// Import scroll freeze utility and unfreeze scroll for indices page
		const { unfreezeScroll, freezeScroll } = await import('$lib/utils/scrollFreeze.js');
		unfreezeScroll();

		gsapReady = import('gsap').then((m) => (gsap = m.gsap ?? m.default ?? m));
		piecesStore.initialize();
		hasInitialized = true;

		// Return cleanup function to restore scroll freeze when leaving this page
		return () => {
			freezeScroll();
		};
	});

	async function expand() {
		if (!gsap) await gsapReady;
		if (circleEl) gsap.to(circleEl, { scale: 9, duration: 3, ease: 'power3.out' });
	}
	async function shrink() {
		if (!gsap) await gsapReady;
		if (circleEl) gsap.to(circleEl, { scale: 1, duration: 4, ease: 'elastic.out(1, 0.3)' });
	}

	let active = $state(0);
	let hasInitialized = $state(false);

	let pieceId = $derived(page.params.id);
	let currentPiece = $derived(PIECES_DATA[pieceId]);
	let totalPiece = $derived(Number($piecesStore?.length ?? 0));

	// ——————————————————
	// Smooth scroll dans le container
	// ——————————————————
	// function smoothScrollTo(to, duration = SCROLL_MS) {
	// 	const start = scrollContainer.scrollTop;
	// 	const delta = to - start;
	// 	const t0 = performance.now();
	// 	const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

	// 	function step(now) {
	// 		const p = Math.min((now - t0) / duration, 1);
	// 		scrollContainer.scrollTo(0, start + delta * ease(p));
	// 		if (p < 1) requestAnimationFrame(step);
	// 	}
	// 	requestAnimationFrame(step);
	// }

	// function setActiveAndScroll(i) {
	// 	const el = document.getElementById(`section-${i}`);
	// 	if (!el) return;

	// 	const top =
	// 		el.getBoundingClientRect().top -
	// 		scrollContainer.getBoundingClientRect().top +
	// 		scrollContainer.scrollTop -
	// 		OFFSET;

	// 	smoothScrollTo(top, 800);
	// }

	// ——————————————————
	// Scroll spy
	// ——————————————————
	// let _raf = 0;

	// function updateActiveOnScroll() {
	// 	const y = scrollContainer.scrollTop + OFFSET + 1;
	// 	let nextActive = 0;

	// 	for (let i = 0; i < LABELS.length; i++) {
	// 		const el = document.getElementById(`section-${i}`);
	// 		if (!el) continue;
	// 		const top = el.offsetTop;
	// 		if (y >= top) nextActive = i;
	// 	}
	// 	active = nextActive;
	// }

	// function onScrollThrottled() {
	// 	if (_raf) return;
	// 	_raf = requestAnimationFrame(() => {
	// 		_raf = 0;
	// 		updateActiveOnScroll();
	// 	});
	// }

	// $effect(() => {
	// 	pieceId;
	// 	requestAnimationFrame(updateActiveOnScroll);
	// });

	function navigateToPiece(id) {
		goto(`/indices/${id}`);
		scrollContainer.scrollTo(0, 0);	
	}

	function capturePiece() {
		if (pieceId) piecesStore.addPiece(pieceId);
	}

	let selected = $state(new Set());
	function toggle(i) {
		const s = new Set(selected);
		s.has(i) ? s.delete(i) : s.add(i);
		selected = s;
	}
	$effect(() => {
		pieceId;
		selected = new Set();
	});

	let selectedAnswer = $state(null);
	function toggleAnswer(i) {
		selectedAnswer = selectedAnswer === i ? null : i;
	}
	$effect(() => {
		pieceId;
		selectedAnswer = null;
	});
</script>

{#if currentPiece}
<div bind:this={scrollContainer} class="scroll-container" style="background-color: {selected.size > 2 ? currentPiece?.color : 'white'}; color: {selected.size > 2 ? 'white' : 'black'}">
	<div class="p-5 pt-0" id="section-0">
		<!-- Header / onglets -->
		<header class="sticky left-0 top-0 z-10 flex items-center pt-[20px] mix-blend-difference">
			<!-- {#each LABELS as label, i}
				<button
					type="button"
					on:click={() => setActiveAndScroll(i)}
					class="text-11 mr-[20px] w-fit border px-[11px] py-1 tracking-[4%] transition-colors"
					class:bg-black={active === i}
					class:bg-white={active !== i}
					class:text-white={active === i}
					class:text-black={active !== i}
					class:border-black={active === i}
				>
					{label}
				</button>
			{/each} -->

			<a href="/start" class="" aria-label="Retour à l'accueil">
				<!-- <svg width="33" height="22" viewBox="0 0 33 22" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M32.83 8.84H7.68L13.69 2.83L10.86 0L2.85 8.01L2.83 7.99L0 10.82L0.02 10.84L0 10.86L2.83 13.69L2.85 13.67L10.87 21.69L13.7 18.86L7.68 12.84H32.83V8.84Z" fill="white"/>
				</svg> -->

					<svg fill="none" height="29" viewBox="0 0 28 29" width="28" xmlns="http://www.w3.org/2000/svg"><path d="m17.1387 2.83008-8.98929 9.00002h19.84569l.0049 4h-20.88281l9.88281 9.8935-2.8271 2.8301-14.0879391-14.1055.0156251-.0166-.100586-.1015 14.3125-14.3301z" fill="#fff"/></svg>
				<!-- <svg
					width="29"
					height="29"
					viewBox="0 0 29 29"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M28.8613 25.8936L26.0347 28.7238L0.173337 2.83019L3 0L28.8613 25.8936Z"
						fill="black"
					/>
					<path
						d="M3.13867 28.8936L0.312005 26.0634L26.1733 0.16981L29 3L3.13867 28.8936Z"
						fill="black"
					/>
				</svg> -->
			</a>
		</header>

		<!-- Swiper -->
		<div class="mt-5 mb-4 w-full" style="">
			<swiper-container bind:this={swiperEl}>
				{#each currentPiece.images as img, i (i)}
					<swiper-slide>
						<img
							class="object-contain"
							src={img.src}
							alt={img.credits ?? `image ${i + 1}`}
						/>
						{#if img.credits}
							<p class="text-mini text-right italic pt-1 py-0 px-1">{img.credits}</p>
						{/if}
					</swiper-slide>
				{/each}
			</swiper-container>
		</div>

		<!-- Infos oeuvre -->
		<div class="flex flex-col">
			<h2 class="text-dixsept whitespace-pre-line uppercase italic">
				{currentPiece.titre_artwork}
			</h2>
			<p>{currentPiece.artiste} - {currentPiece.date}</p>
			<p class="mt-3">{currentPiece.story}</p>
		</div>

		<!-- <div class="mt-6 mb-15">
			<span class="text-titre-alt inf-bold">Tu avais trouvé cette œuvre ?</span><br />

			<div class="flex mt-2 gap-8">
				<div
					class="relative flex w-max cursor-pointer touch-none text-11 items-center space-x-2 select-none"
					class:selected={selectedAnswer === 0}
					on:click={() => toggleAnswer(0)}
				>
					<span
					style="background-color: {selected.size > 2 ? currentPiece?.color : ''}"
					class="opacity-40 py-1 px-5 border rounded-full m-0 text-{selected.size > 2 ? 'white' : 'black'}"
					class:bg-black={selectedAnswer === 0}
					class:opacity-100={selectedAnswer === 0}
					class:text-white={selectedAnswer === 0}
					>Bah oui !</span>

					<div class="absolute mt-[2px] ml-[4px] m-auto left-full">
						{#if selectedAnswer === 0}
							<svg
								width="17"
								height="17"
								stroke="white"
								strokeWidth="1"
								viewBox="0 0 15 15"
								fill={currentPiece.color}
								class="shrink-0 m-auto"
							>
								<path
									d="M13.025 2.88117c-.3193-.31937-.6983-.57272-1.1155-.74557C11.4924 1.96275 11.0453 1.87378 10.5937 1.87378c-.4516 0-.89868.08897-1.31585.26182-.41716.17285-.79617.4262-1.1154.74557l-.6625.6625-.6625-.6625C6.19264 2.23636 5.3181 1.87411 4.4062 1.87411s-1.78644.36225-2.43125 1.00706C1.33014 3.52598.967896 4.40052.967896 5.31242c0 .9119.362244 1.78644 1.007054 2.43125l5.525 5.525 5.525-5.525c.3193-.31922.5727-.69824.7455-1.1154.1729-.41717.2618-.8643.2618-1.31585 0-.45155-.0889-.89869-.2618-1.31585-.1728-.41716-.4262-.79618-.7455-1.1154Z"
								/>
							</svg>
						{/if}
					</div>
				</div>


				<div
					class="relative flex w-max cursor-pointer touch-none text-11 items-center space-x-2 select-none"
					class:selected={selectedAnswer === 1}
					on:click={() => toggleAnswer(1)}
				>
					<span
					style="background-color: {selected.size > 2 ? currentPiece?.color : ''}"
					class="opacity-40 py-1 px-5 border rounded-full m-0 text-{selected.size > 2 ? 'white' : 'black'}"
					class:bg-black={selectedAnswer === 1}
					class:opacity-100={selectedAnswer === 1}
					class:text-white={selectedAnswer === 1}
					>Et nan…</span>

					<div class="absolute mt-[2px] ml-[4px] m-auto left-full">
					{#if selectedAnswer === 1}
						<svg
							width="17"
							height="17"
							viewBox="0 0 15 15"
							stroke="white"
							strokeWidth="1"
							fill={currentPiece.color}
							class="shrink-0 m-auto"
						>
							<path
								d="M13.025 2.88117c-.3193-.31937-.6983-.57272-1.1155-.74557C11.4924 1.96275 11.0453 1.87378 10.5937 1.87378c-.4516 0-.89868.08897-1.31585.26182-.41716.17285-.79617.4262-1.1154.74557l-.6625.6625-.6625-.6625C6.19264 2.23636 5.3181 1.87411 4.4062 1.87411s-1.78644.36225-2.43125 1.00706C1.33014 3.52598.967896 4.40052.967896 5.31242c0 .9119.362244 1.78644 1.007054 2.43125l5.525 5.525 5.525-5.525c.3193-.31922.5727-.69824.7455-1.1154.1729-.41717.2618-.8643.2618-1.31585 0-.45155-.0889-.89869-.2618-1.31585-.1728-.41716-.4262-.79618-.7455-1.1154Z"
							/>
						</svg>
					{/if}
				</div>


				</div>


			</div>
		</div> -->

		<!-- Bloc "D'après toi..." -->
		<div class="relative mt-15 mb-16 bg-black border-white border px-5 py-6 pb-10 text-white" id="section-1"   style="background-color: {selected.size > 0 ? currentPiece?.color : 'black'}">
			<img
				src="/images/aro_dapres_bas.svg"
				alt="indic"
				class="absolute right-5 bottom-2 h-auto !w-[97.9px]"
			/>
			<div class="text-titre-alt inf-bold bah mb-4">{currentPiece.dapres_toi}</div>

			{#if Array.isArray(currentPiece?.dapres) && currentPiece.dapres.length}
				{#each currentPiece.dapres as line, i (i)}
					<div
						class="flex cursor-pointer touch-none items-center gap-2 select-none"
						class:selected={selected.has(i)}
						on:click={() => toggle(i)}
					>
						<svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
							<rect x="4" width="5" height="5" transform="rotate(45 4 0)" />
						</svg>
						<span class:underline={selected.has(i)}>{line}</span>
						{#if selected.has(i)}
							<svg
								width="15"
								height="15"
								viewBox="0 0 15 15"
								fill="#fff"
								class="shrink-0"
							>
								<path
									d="M13.025 2.88117c-.3193-.31937-.6983-.57272-1.1155-.74557C11.4924 1.96275 11.0453 1.87378 10.5937 1.87378c-.4516 0-.89868.08897-1.31585.26182-.41716.17285-.79617.4262-1.1154.74557l-.6625.6625-.6625-.6625C6.19264 2.23636 5.3181 1.87411 4.4062 1.87411s-1.78644.36225-2.43125 1.00706C1.33014 3.52598.967896 4.40052.967896 5.31242c0 .9119.362244 1.78644 1.007054 2.43125l5.525 5.525 5.525-5.525c.3193-.31922.5727-.69824.7455-1.1154.1729-.41717.2618-.8643.2618-1.31585 0-.45155-.0889-.89869-.2618-1.31585-.1728-.41716-.4262-.79618-.7455-1.1154Z"
								/>
							</svg>
						{/if}
					</div>
				{/each}
			{/if}
		</div>


    <div class="mb-25">
      <!-- Bloc Couleur (GSAP press & hold) -->
      <div
        id="section-2"
        class="relative overflow-hidden border px-5 py-4"
        on:pointerdown|preventDefault={expand}
        on:pointerup={shrink}
        on:pointerleave={shrink}
        on:pointercancel={shrink}
      >
        <div class="text-titre-alt inf-bold relative z-[1] mb-5 uppercase">
          {currentPiece?.color_name}
        </div>

        <div class="flex items-center gap-5">
          <div
            bind:this={circleEl}
            class="relative z-0 h-20 w-20 border border-white origin-center touch-none rounded-full select-none"
            style="background-color: {currentPiece?.color};"
          />
          <div class="relative z-[1] leading-6">
            <span class="inf-bold">hexadécimale</span> : {currentPiece?.color}<br /><br />
            <span class="inf-bold">rvb</span> : {currentPiece?.rvb}<br /><br />
            <span class="inf-bold">cmjn</span> : {currentPiece?.cmjn}
          </div>
        </div>
      </div>

      <!-- Progress / navigation par couleurs -->
      <div class="m-auto mt-17 mb-10 h-px w-2/3 bg-black"></div>

      <div class="flex justify-center gap-[4vw]">
        {#each PIECES_ENTRIES as [id, data] (id)}
          <span
            class="rounded-full px-[3vw] py-[3vw] border-white border"
            style="background-color: {foundPieces.includes(id) ? data.color : '#E3E3E3'}"
            title={data.color_name}
            on:click={() => foundPieces.includes(id) && navigateToPiece(id)}
          />
        {/each}
      </div>

      <div class="mt-5 mb-15 text-center text-titre-alt">
        <p>
          {#if totalPiece === 0}
            Tu n'as découvert aucune couleur
          {:else if totalPiece === 1}
            Tu as déjà découvert 1 couleur sur 7 !
          {:else if totalPiece === 7}
            Bravo, Tu as découvert toutes les couleurs !
          {:else}
            Tu as déjà découvert {totalPiece} couleurs sur 7 !
          {/if}
        </p>
      </div>

      {#if totalPiece !== 7}
        <div class="relative flex items-center justify-center">
          <div class="relative inline-block">
            <a href="/scanner" class="block">
				<svg width="52" height="43" viewBox="0 0 52 43" fill="none" xmlns="http://www.w3.org/2000/svg">
					<g clip-path="url(#clip0_2041_26)">
					<path style="fill: {selected.size > 2 ? 'white' : 'black'}" d="M48 5H45V0H31V5H20V2H9V5H4C1.79 5 0 6.79 0 9V39C0 41.21 1.79 43 4 43H48C50.21 43 52 41.21 52 39V9C52 6.79 50.21 5 48 5ZM26.5 38C19.04 38 13 31.96 13 24.5C13 17.04 19.04 11 26.5 11C33.96 11 40 17.04 40 24.5C40 31.96 33.96 38 26.5 38Z" fill="black"/>
					<path style="fill: {selected.size > 2 ? 'white' : 'black'}" d="M26.5 34C31.7467 34 36 29.7467 36 24.5C36 19.2533 31.7467 15 26.5 15C21.2533 15 17 19.2533 17 24.5C17 29.7467 21.2533 34 26.5 34Z" fill="black"/>
					</g>
				</svg>
            </a>
            <div class="absolute top-1/2 right-full -translate-y-1/2 pr-2">
              <img
                src="/images/indic_camera_oeuvre.svg"
                alt="gauche"
                class="pointer-events-none mr-2 h-auto !w-[116.556px] max-w-none"
              />
            </div>
          </div>
        </div>
      {:else}
	  <div class="mx-auto w-fit">
        <a href="/puzzles" class="text-bouton inf-bold z-10 border bg-white px-[15px] py-[7px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]" >
          ACCÉDER AUX TANGRAMS
        </a>
	  </div>
      {/if}
    </div>
  </div>
</div>
{/if}


<style>
	.scroll-container {
		height: 100vh;
		overflow-y: auto;
		overflow-x: hidden;
		scroll-behavior: auto; /* on gère le smoothScroll manuellement */
	}
	.bah::first-line {
		padding-right: 40px !important;
	}
	.swiper-button-next svg,
	.swiper-button-prev svg {
		width: 15px !important;
		height: auto !important;
	}
	.swiper-button-prev,
	.swiper-button-next {
		color: red; /* Couleur de la flèche (SVG currentColor) */
		font-size: 15px; /* Modifie la taille de l'icône flèche */
		width: 24px;
		height: 24px;
	}
</style>
