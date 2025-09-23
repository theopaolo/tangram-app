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
		scrollContainer.addEventListener('scroll', onScrollThrottled, { passive: true });
		scrollContainer.addEventListener('resize', onScrollThrottled);

		updateActiveOnScroll();

		return () => {
			scrollContainer.removeEventListener('scroll', onScrollThrottled);
			scrollContainer.removeEventListener('resize', onScrollThrottled);
		};


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
	function smoothScrollTo(to, duration = SCROLL_MS) {
		const start = scrollContainer.scrollTop;
		const delta = to - start;
		const t0 = performance.now();
		const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

		function step(now) {
			const p = Math.min((now - t0) / duration, 1);
			scrollContainer.scrollTo(0, start + delta * ease(p));
			if (p < 1) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}

	function setActiveAndScroll(i) {
		const el = document.getElementById(`section-${i}`);
		if (!el) return;

		const top =
			el.getBoundingClientRect().top -
			scrollContainer.getBoundingClientRect().top +
			scrollContainer.scrollTop -
			OFFSET;

		smoothScrollTo(top, 800);
	}

	// ——————————————————
	// Scroll spy
	// ——————————————————
	let _raf = 0;

	function updateActiveOnScroll() {
		const y = scrollContainer.scrollTop + OFFSET + 1;
		let nextActive = 0;

		for (let i = 0; i < LABELS.length; i++) {
			const el = document.getElementById(`section-${i}`);
			if (!el) continue;
			const top = el.offsetTop;
			if (y >= top) nextActive = i;
		}
		active = nextActive;
	}

	function onScrollThrottled() {
		if (_raf) return;
		_raf = requestAnimationFrame(() => {
			_raf = 0;
			updateActiveOnScroll();
		});
	}

	$effect(() => {
		pieceId;
		requestAnimationFrame(updateActiveOnScroll);
	});

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
		<header class="sticky top-0 z-10 flex items-center bg-white pt-[30px] pb-[5px]" style="background-color: {selected.size > 2 ? currentPiece?.color : 'white'} ; ">
			{#each LABELS as label, i}
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
			{/each}
			<a href="/start" class="absolute right-0" aria-label="Retour à l'accueil">
				<svg
					width="18"
					height="18"
					viewBox="0 0 18 18"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M17.1421 15.1421L15.0208 17.2635L0.87868 3.12132L3 1L17.1421 15.1421Z"
						fill="black"
					/>
					<path
						d="M2.85786 17.1421L0.736544 15.0208L14.8787 0.87868L17 3L2.85786 17.1421Z"
						fill="black"
					/>
				</svg>
			</a>
		</header>

		<!-- Swiper -->
		<div class="mt-[40px] mb-4 w-full" style="">
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
			<h2 class="text-titre-alt whitespace-pre-line uppercase italic">
				{currentPiece.titre_artwork}
			</h2>
			<p>{currentPiece.artiste} - {currentPiece.date}</p>
			<p class="mt-3">{currentPiece.story}</p>
		</div>

		<!-- QCM simple -->
		<div class="mt-6 mb-15">
			<span class="text-titre-alt inf-bold">Tu avais trouvé cette œuvre ?</span><br />

			<div class="flex mt-2 gap-8">
			<!-- Bah oui ! -->
				<div
					class="relative flex w-max cursor-pointer touch-none text-11 items-center space-x-2 select-none"
					class:selected={selectedAnswer === 0}
					on:click={() => toggleAnswer(0)}
				>
					<!-- <svg width="11" height="6" viewBox="0 0 11 6" class="shrink-0" fill="currentColor">
						<path d="M11 3 6 .113v5.774L11 3ZM0 3v.5h6.5V3H0Zm0-1v.5h6.5V2H0Z" />
					</svg> -->
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


				<!-- Et nan… -->
				<div
					class="relative flex w-max cursor-pointer touch-none text-11 items-center space-x-2 select-none"
					class:selected={selectedAnswer === 1}
					on:click={() => toggleAnswer(1)}
				>
					<!-- <svg width="11" height="6" viewBox="0 0 11 6" class="shrink-0" fill="currentColor">
						<path d="M11 3 6 .113v5.774L11 3ZM0 3v.5h6.5V3H0Zm0-1v.5h6.5V2H0Z" />
					</svg> -->
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
		</div>

		<!-- Bloc "D'après toi..." -->
		<div class="relative mb-15 bg-black border-white border px-5 py-6 pb-10 text-white" id="section-1"   style="background-color: {selected.size > 0 ? currentPiece?.color : 'black'}">
			<img
				src="/images/aro_dapres_bas.svg"
				alt="indic"
				class="absolute right-5 bottom-2 h-auto !w-[105px]"
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


    <div class="min-h-svh">
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

      <div class="mt-5 mb-15 text-center">
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
                class="pointer-events-none mr-2 h-auto !w-[105.96px] max-w-none"
              />
            </div>
          </div>
        </div>
      {:else}
	  <div class="mx-auto w-fit">
        <a href="/puzzles" class="text-bouton inf-bold z-10 border bg-white px-[15px] py-[7px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]" >
          ACCÉDER AUX PUZZLES
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
