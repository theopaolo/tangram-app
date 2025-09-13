<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state'; // SvelteKit (Svelte 5) : store page
  import { onMount } from 'svelte';
  import { piecesStore } from '$lib/piecesStore.js';

  // `Object.entries` reste pareil
  import { PIECES_DATA } from '$lib/piecesData';
  const PIECES_ENTRIES = Object.entries(PIECES_DATA);

  // Si tu veux dériver une version réactive du store
  let foundPieces = $derived($piecesStore);

  // import function to register Swiper custom elements
  // import { Pagination } from 'swiper/modules';
  // register Swiper custom elements
   import { register } from 'swiper/element/bundle';
  register();
  let swiperEl;
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
  });

  // ——————————————————
  // CONSTANTES
  // ——————————————————
  const LABELS = ["L'oeuvre", "D'après toi...", "La Couleur"];
  const OFFSET = 90;       // px à laisser au-dessus (navbar, marge…)
  const SCROLL_MS = 800;   // durée pour la version polyfill (fallback)

  // ——————————————————
  // DONNÉES
  // ——————————————————
 


  // ——————————————————
  // GSAP (import dynamique côté client)
  // ——————————————————
  let gsap;
  let gsapReady;
  let circleEl;

onMount(() => {
  gsapReady = import('gsap').then((m) => (gsap = m.gsap ?? m.default ?? m));

  // Initialize pieces store
  piecesStore.initialize();

  hasInitialized = true;

  // — Scroll-Spy listeners
  window.addEventListener('scroll', onScrollThrottled, { passive: true });
  window.addEventListener('resize', onScrollThrottled);
  // Calcul initial (au cas où on n'est pas en haut de page)
  updateActiveOnScroll();

  // Cleanup
  return () => {
    window.removeEventListener('scroll', onScrollThrottled);
    window.removeEventListener('resize', onScrollThrottled);
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

  // ——————————————————
  // ETAT (runes Svelte 5)
  // ——————————————————
  let active = $state(0);
  let hasInitialized = $state(false);

  let pieceId = $derived(page.params.id);
  let currentPiece = $derived(PIECES_DATA[pieceId]);
  let totalPiece = $derived( Number($piecesStore?.length ?? 0) );


  // ——————————————————
// Smooth scroll util
// ——————————————————
function smoothScrollTo(to, duration = SCROLL_MS) {
  const start = window.scrollY;
  const delta = to - start;
  const t0 = performance.now();
  const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

  function step(now) {
    const p = Math.min((now - t0) / duration, 1);
    window.scrollTo(0, start + delta * ease(p));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function setActiveAndScroll(i) {
//   active = i;
  const el = document.getElementById(`section-${i}`);
  if (!el) return;

  const top = el.getBoundingClientRect().top + window.pageYOffset - OFFSET;
  smoothScrollTo(top, 800); // toujours 800 ms
}


// ——————————————————
// Scroll-Spy : met à jour `active` selon la position scroll
// ——————————————————
let _raf = 0;

function updateActiveOnScroll() {
  // Ligne de référence = haut de la fenêtre + OFFSET
  const y = window.scrollY + OFFSET + 1;
  let nextActive = 0;

  for (let i = 0; i < LABELS.length; i++) {
    const el = document.getElementById(`section-${i}`);
    if (!el) continue;
    // offsetTop = position absolue du haut de la section
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
  pieceId; // réagit au changement de pièce
  requestAnimationFrame(updateActiveOnScroll);
});



  // ——————————————————
  // ROUTING
  // ——————————————————
  function navigateToPiece(id) {
    goto(`/indices/${id}`);
  }

  // ——————————————————
  // CAPTURE
  // ——————————————————
  function capturePiece() {
    if (pieceId) {
      piecesStore.addPiece(pieceId);
    }
  }

  // ——————————————————
  // SÉLECTIONS
  // ——————————————————
  // Multi-sélection (liste "D’après toi")
  let selected = $state(new Set());
  function toggle(i) {
    const s = new Set(selected);
    s.has(i) ? s.delete(i) : s.add(i);
    selected = s;
  }
  // Reset quand on change de pièce
  $effect(() => {
    pieceId;
    selected = new Set();
  });

  // Sélection unique (Bah oui / Et nan…)
  let selectedAnswer = $state(null); // 0 | 1 | null
  function toggleAnswer(i) {
    selectedAnswer = selectedAnswer === i ? null : i;
  }
  $effect(() => {
    pieceId;
    selectedAnswer = null;
  });
</script>

<style>

.bah::first-line{
  padding-right: 40px!important;
}
.swiper-button-next svg ,.swiper-button-prev svg{
  width: 15px!important;
  height: auto!important;
}
.swiper-button-prev,
.swiper-button-next {
  color: red;        /* Couleur de la flèche (SVG currentColor) */
  font-size: 15px;   /* Modifie la taille de l'icône flèche */
  width: 24px;
  height: 24px;
}


</style>


{#if currentPiece}
  <div class="p-5 pt-0" id="section-0">
    <!-- Header / onglets -->
    <header class="flex sticky z-10 bg-white top-0 pt-[30px] items-center pb-[5px]">
      {#each LABELS as label, i}
        <button
          type="button"
          on:click={() => setActiveAndScroll(i)}
          class="mr-[20px] text-11 w-fit tracking-[4%] border py-1 px-[11px] transition-colors"
          class:bg-black={active === i}
          class:bg-white={active !== i}
          class:text-white={active === i}
          class:text-black={active !== i}
          class:border-black={active === i}
        >
          {label}
        </button>
      {/each}
	  <div class="absolute right-0">
		<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M17.1421 15.1421L15.0208 17.2635L0.87868 3.12132L3 1L17.1421 15.1421Z" fill="black"/>
			<path d="M2.85786 17.1421L0.736544 15.0208L14.8787 0.87868L17 3L2.85786 17.1421Z" fill="black"/>
		</svg>
	  </div>
    </header>

    <!-- Visuel -->
    <div class="mt-[40px] mb-4 w-full" style="background-color: {currentPiece.color};">

        <swiper-container bind:this={swiperEl}>
          <swiper-slide><img class="aspect-3/2 object-cover" src="/images/dd.jpg" /></swiper-slide>
          <swiper-slide><img class="aspect-3/2 object-cover" src="/images/dd.jpg" /></swiper-slide>
          <swiper-slide><img class="aspect-3/2 object-cover" src="/images/dd.jpg" /></swiper-slide>
        </swiper-container>
    </div>

    <!-- Infos oeuvre -->
    <div class="flex flex-col">
      <h2 class="text-titre-alt uppercase italic whitespace-pre-line">{currentPiece.titre_artwork}</h2>
      <p>{currentPiece.artiste} - {currentPiece.date}</p>
      <p class="mt-3">{currentPiece.story}</p>
    </div>

    <!-- QCM simple -->
    <div class="mt-6 mb-15">
      <span class="text-titre-alt inf-bold">Tu avais trouvé cette oeuvre ?</span><br/>

      <!-- Bah oui ! -->
      <div
        class="flex items-center space-x-2 cursor-pointer w-max select-none touch-none"
        class:selected={selectedAnswer === 0}
        on:click={() => toggleAnswer(0)}
      >
        <svg width="11" height="6" viewBox="0 0 11 6" class="shrink-0" fill="currentColor">
          <path d="M11 3 6 .113v5.774L11 3ZM0 3v.5h6.5V3H0Zm0-1v.5h6.5V2H0Z"/>
        </svg>
        <span class:underline={selectedAnswer === 0}>Bah oui !</span>
        {#if selectedAnswer === 0}
          <svg width="15" height="15" viewBox="0 0 15 15" fill={currentPiece.color} class="shrink-0">
            <path d="M13.025 2.88117c-.3193-.31937-.6983-.57272-1.1155-.74557C11.4924 1.96275 11.0453 1.87378 10.5937 1.87378c-.4516 0-.89868.08897-1.31585.26182-.41716.17285-.79617.4262-1.1154.74557l-.6625.6625-.6625-.6625C6.19264 2.23636 5.3181 1.87411 4.4062 1.87411s-1.78644.36225-2.43125 1.00706C1.33014 3.52598.967896 4.40052.967896 5.31242c0 .9119.362244 1.78644 1.007054 2.43125l5.525 5.525 5.525-5.525c.3193-.31922.5727-.69824.7455-1.1154.1729-.41717.2618-.8643.2618-1.31585 0-.45155-.0889-.89869-.2618-1.31585-.1728-.41716-.4262-.79618-.7455-1.1154Z"/>
          </svg>
        {/if}
      </div>

      <!-- Et nan… -->
      <div
        class="flex items-center space-x-2 cursor-pointer w-max select-none touch-none"
        class:selected={selectedAnswer === 1}
        on:click={() => toggleAnswer(1)}
      >
        <svg width="11" height="6" viewBox="0 0 11 6" class="shrink-0" fill="currentColor">
          <path d="M11 3 6 .113v5.774L11 3ZM0 3v.5h6.5V3H0Zm0-1v.5h6.5V2H0Z"/>
        </svg>
        <span class:underline={selectedAnswer === 1}>Et nan…</span>
        {#if selectedAnswer === 1}
          <svg width="15" height="15" viewBox="0 0 15 15" fill={currentPiece.color} class="shrink-0">
            <path d="M13.025 2.88117c-.3193-.31937-.6983-.57272-1.1155-.74557C11.4924 1.96275 11.0453 1.87378 10.5937 1.87378c-.4516 0-.89868.08897-1.31585.26182-.41716.17285-.79617.4262-1.1154.74557l-.6625.6625-.6625-.6625C6.19264 2.23636 5.3181 1.87411 4.4062 1.87411s-1.78644.36225-2.43125 1.00706C1.33014 3.52598.967896 4.40052.967896 5.31242c0 .9119.362244 1.78644 1.007054 2.43125l5.525 5.525 5.525-5.525c.3193-.31922.5727-.69824.7455-1.1154.1729-.41717.2618-.8643.2618-1.31585 0-.45155-.0889-.89869-.2618-1.31585-.1728-.41716-.4262-.79618-.7455-1.1154Z"/>
          </svg>
        {/if}
      </div>
    </div>

    <!-- Bloc "D'après toi..." -->
    <div class="bg-black text-white px-5 py-6 pb-10 relative mb-15" id="section-1">
      <img src="/images/aro_dapres_bas.svg" alt="indic" class="!w-[105px] h-auto absolute right-5 bottom-2" />
      <div class="text-titre-alt inf-bold mb-4 bah">{currentPiece.dapres_toi}</div>

      {#if Array.isArray(currentPiece?.dapres) && currentPiece.dapres.length}
        {#each currentPiece.dapres as line, i (i)}
          <div
            class="flex items-center cursor-pointer gap-2 select-none touch-none"
            class:selected={selected.has(i)}
            on:click={() => toggle(i)}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
              <rect x="4" width="5" height="5" transform="rotate(45 4 0)" />
            </svg>
            <span class:underline={selected.has(i)}>{line}</span>
            {#if selected.has(i)}
              <svg width="15" height="15" viewBox="0 0 15 15" fill={currentPiece.color} class="shrink-0">
                <path d="M13.025 2.88117c-.3193-.31937-.6983-.57272-1.1155-.74557C11.4924 1.96275 11.0453 1.87378 10.5937 1.87378c-.4516 0-.89868.08897-1.31585.26182-.41716.17285-.79617.4262-1.1154.74557l-.6625.6625-.6625-.6625C6.19264 2.23636 5.3181 1.87411 4.4062 1.87411s-1.78644.36225-2.43125 1.00706C1.33014 3.52598.967896 4.40052.967896 5.31242c0 .9119.362244 1.78644 1.007054 2.43125l5.525 5.525 5.525-5.525c.3193-.31922.5727-.69824.7455-1.1154.1729-.41717.2618-.8643.2618-1.31585 0-.45155-.0889-.89869-.2618-1.31585-.1728-.41716-.4262-.79618-.7455-1.1154Z"/>
              </svg>
            {/if}
          </div>
        {/each}
      {/if}
    </div>

    <!-- Bloc Couleur (GSAP press & hold) -->
    <div
      id="section-2"
      class="border px-5 py-4 relative overflow-hidden"
      on:pointerdown|preventDefault={expand}
      on:pointerup={shrink}
      on:pointerleave={shrink}
      on:pointercancel={shrink}
    >
      <div class="relative z-[1] text-titre-alt inf-bold mb-5 uppercase">
        {currentPiece?.color_name}
      </div>

      <div class="flex gap-5 items-center">
        <div
          bind:this={circleEl}
          class="relative z-0 w-20 h-20 rounded-full origin-center select-none touch-none"
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
    <div class="mt-17 mb-10 w-2/3 h-px bg-black m-auto"></div>

    <div class="flex justify-center gap-5">
   
{#each PIECES_ENTRIES as [id, data] (id)}
  <span
    class="rounded-full px-[11px] py-[11px]"
    style="cursor: pointer; background-color: {foundPieces.includes(id) ? data.color : '#E3E3E3'}"
    title={data.color_name}
    on:click={() => navigateToPiece(id)}
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
        <div class="relative flex justify-center items-center mb-100">
          <div class="relative inline-block">
            <img src="/images/camera.svg" alt="centrée" class="mx-auto !w-[52px] h-auto" />
            <div class="absolute top-1/2 right-full -translate-y-1/2 pr-2">
            <img  src="/images/indic_camera_oeuvre.svg" alt="gauche" class="!w-[105.96px] h-auto max-w-none pointer-events-none mr-2" />
            </div>
          </div>
        </div>
        {/if}



  </div>
{/if}