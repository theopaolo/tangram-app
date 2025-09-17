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
  const rows = 11;
  const w = 10;
  const h = 5;

  const visibleCols = 1.4;
  const viewW = visibleCols * w;
  const viewH = rows * h;

  const gridW = cols * w;
  const gridH = rows * h;

  onMount(async () => {
    const mod = await import("gsap");
    gsap = mod.gsap;

    // Sélections DOM (une seule fois)
    const svg = document.querySelector("svg");
    const wrapper = document.getElementById("zoom-wrapper");
    const whole = document.querySelector(".whole");
    const pieces = document.querySelectorAll(".piece");

    // Rotation infinie du SVG entier
    const svgRotation = gsap.to(svg, {
      scale: -1.5,
      rotate:100,
      transformOrigin: "50% 50%",
      duration: 120,
      yoyo:true,
      ease: "linear",
      repeat: -1
    });

    // Zoom toggle au double clic
    let zoomed = false;
    svg.addEventListener("dblclick", (e) => {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

      gsap.to(wrapper, {
        scale:zoomed ? 1 : 2,
        rotate: zoomed ? -120 : 120,
        svgOrigin: `${svgP.x} ${svgP.y}`,
        duration: 1.2,
        ease: "power2.inOut"
      });

      zoomed = !zoomed;
    });

    // Rotation aléatoire de toutes les pièces au clic
    whole.addEventListener("click", () => {
      gsap.to(pieces, {
        rotate:30,

        y: () => `+=${gsap.utils.random(-10, 10)}`,
        x: () => `+=${gsap.utils.random(-10, 10)}`,
        transformOrigin: "50% 50%",
        duration: 2,
        ease: "power2.inOut"
      });


      // gsap.to(wrapper, {
      //   scale:1,
      // });

    });

    // Bloquer le scroll (mobile)
    const preventScroll = (e) => e.preventDefault();
    document.body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventScroll, { passive: false });

    // Nettoyage quand le composant est démonté
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventScroll);
      svgRotation.kill();
      gsap.globalTimeline.clear();
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
  .row, .whole, #zoom-wrapper, svg {
    will-change: transform;
  }
</style>

<div class="h-svh absolute w-screen z-1">
  <div class="whole h-svh absolute w-screen z-1">
    <svg
      overflow="visible"
      viewBox={`${-viewW / 2} ${-viewH / 2} ${viewW} ${viewH}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <g id="zoom-wrapper" transform={`translate(${-gridW / 2}, ${-gridH / 2})`}>
        {#each Array(rows) as _, r}
          <g class="row" transform={`translate(0, ${r * h})`}>
            {#each Array(cols) as _, c}
              <polygon
                fill={PIECES_DATA[5].color}
                class="piece"
                points="0,5 10,5 5,0"
                transform={`translate(${c * w}, 0)`}
              />
            {/each}
          </g>
        {/each}
      </g>
    </svg>
  </div>
</div>

<div class="no-select relative z-2 flex flex-col py-[80px] items-center justify-between min-h-svh text-center pointer-events-none">
  <div class="py-[20px] px-[50px] max-w-4/5 text-center bg-white border border-black drop-shadow pointer-events-none">
    Bravo tu as découvert :
    <div class="text-titre-alt inf-bold my-5 uppercase">
      {PIECES_DATA[5].color_name}
    </div>
    À quelle œuvre penses-tu que<br/>cette couleur appartient ?
  </div>

  <div
    class="pointer-events-auto text-titre-alt inf-bold uppercase py-[25px] px-[30px] max-w-4/5 text-center height-auto whitespace-pre-line bg-white border border-black drop-shadow-[var(--my-drop-shadow)]"
    onclick={() => handleCC('5')}
  >
      VERIFIE TON HYPOTHÈSE<br/>EN APPUYANT ICI
  </div>
</div>
