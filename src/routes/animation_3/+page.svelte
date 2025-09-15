<script>
  import { onMount } from "svelte";
  let gsap;
  
  import { goto } from '$app/navigation';
  import { PIECES_DATA } from '$lib/piecesData';
	import { piecesStore } from '$lib/piecesStore.js';

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

  const cols = 11;
  const rows = 5;
  const w = 5;   // largeur triangle
  const h = 10;  // hauteur triangle

  const visibleCols = 2.2;
  const viewW = visibleCols * w;
  const viewH = rows * h;

  onMount(async () => {
    const mod = await import("gsap");
    gsap = mod.gsap;

    // Sélections uniques
    const rowsEls = document.querySelectorAll(".row");
    const svg = document.querySelector("svg");
    const whole = document.querySelector(".whole");
    const pieces = document.querySelectorAll(".piece");

      // Durée totale d’un aller-retour (en secondes ici)
      const cycleDuration = 60; 

      gsap.ticker.add(() => {
        const now = performance.now() / 1000; // secondes
        const cycle = now % cycleDuration;    // 0 → cycleDuration
        const t = cycle / cycleDuration;      // 0 → 1 normalisé

        // onde triangulaire limitée à 0.7
        let progress;
        if (t < 0.5) {
          // phase aller : 0 → 0.7
          progress = (t / 0.5) * 0.7;
        } else {
          // phase retour : 0.7 → 0
          progress = 0.7 * (1 - (t - 0.5) / 0.5);
        }

        rowsEls.forEach((row, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          const x = (dir === -1 ? progress : 0.7 - progress) * (viewW - cols * w);
          row.setAttribute("transform", `translate(${x}, ${i * h})`);
        });
      });




    // --- Zoom + rotation aléatoire au double tap ---
    let zoomed = false;
    whole.addEventListener("dblclick", (e) => {
      const randomRotation = gsap.utils.random(-120, 200);
      gsap.to(svg, {
        scale: zoomed ? 1 : 0.7,
        rotation: `+=${randomRotation}`,
        transformOrigin: "50% 50%",
        duration: 1.2,
        ease: "power2.inOut"
      });
      zoomed = !zoomed;
    });

    // --- Rotation continue au clic maintenu ---
    pieces.forEach((polygon) => {
      const rotateTween = gsap.to(polygon, {
        rotation: "+=360",
        transformOrigin: "50% 50%",
        duration: 2,
        ease: "linear",
        repeat: -1,
        paused: true
      });

      // desktop
      polygon.addEventListener("mousedown", () => rotateTween.play());
      polygon.addEventListener("mouseup", () => rotateTween.pause());
      polygon.addEventListener("mouseleave", () => rotateTween.pause());

      // mobile
      polygon.addEventListener("touchstart", () => rotateTween.play());
      polygon.addEventListener("touchend", () => rotateTween.pause());
      polygon.addEventListener("touchcancel", () => rotateTween.pause());
    });

    // --- Pas de scroll sur mobile ---
    const preventScroll = (e) => e.preventDefault();
    document.body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventScroll, { passive: false });

    // --- Cleanup quand le composant est démonté ---
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventScroll);
      gsap.globalTimeline.clear();
      gsap.ticker.remove();
    };
  });
</script>

<style>
  body, html {
    overflow: hidden;
    height: 100%;
    overscroll-behavior: none;
  }
  polygon {
    will-change: transform;
  }
  .row, .whole {
    will-change: transform;
  }
</style>

<div class="h-svh absolute w-screen z-1">
  <div class="whole h-svh absolute w-screen z-1">
    <svg
      overflow="visible"
      viewBox={`0 0 ${viewW} ${viewH}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      {#each Array(rows) as _, r}
        <g class="row" transform={`translate(0, ${r * h})`}>
          {#each Array(cols) as _, c}
            <polygon
              fill={PIECES_DATA[3].color}
              class="piece"
              points="0,10 0,0 5,5"
              transform={`translate(${c * w}, 0)`}
            />
          {/each}
        </g>
      {/each}
    </svg>
  </div>
</div>

<div class="no-select relative z-2 flex flex-col py-[80px] items-center justify-between min-h-svh text-center pointer-events-none">
  <div class="py-[20px] px-[50px] w-fit text-center bg-white border border-black drop-shadow pointer-events-none">
    Bravo tu as découvert :
    <div class="text-titre-alt inf-bold my-5 uppercase">
     {PIECES_DATA[3].color_name}
    </div>
    À quelle œuvre penses-tu que<br/>cette couleur appartient ?
  </div>

  <div class="pointer-events-auto text-titre-alt inf-bold uppercase py-[25px] px-[30px] w-fit text-center height-auto whitespace-pre-line bg-white border border-black drop-shadow-[var(--my-drop-shadow)]" on:click={() => handleCC('3')}>
      VERIFIE TON HYPOTHÈSE<br/>EN APPUYANT ICI
  </div>
</div>