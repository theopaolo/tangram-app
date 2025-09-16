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
    };

  let tween;

  const cols = 7;
  const rows = 7;
  const w = 5;
  const h = 5;

  const visibleCols = 2.2;
  const viewW = visibleCols * w;
  const viewH = rows * h;

  const offsetX = (cols * w - viewW) / 2;
  const offsetY = (rows * h - viewH) / 2;

  // directions : ↘, ↗, ↖, ↙
  const directions = {
    rightdown: { dx: 1, dy: 1 },
    rightup: { dx: 1, dy: -1 },
    leftup: { dx: -1, dy: -1 },
    leftdown: { dx: -1, dy: 1 }
  };
  let currentDir = directions.rightdown;

function startTween(tiles, dir, speedFactor = 1, inertial = false) {
  tween?.kill();

  tween = gsap.to(tiles, {
    x: `+=${dir.dx * cols * w * 0.5 * speedFactor}`,
    y: `+=${dir.dy * rows * h * 0.5 * speedFactor}`,
    duration: inertial 
      ? gsap.utils.clamp(2, 10, 8 / speedFactor) // swipe rapide → court
      : 40,                                      // load → très lent
    ease: inertial ? "power3.out" : "linear",
    repeat: inertial ? 0 : -1, // en boucle au load, une seule fois au swipe
    yoyo: inertial ? false : true,
    modifiers: {
      x: gsap.utils.unitize(x => parseFloat(x) % (cols * w)),
      y: gsap.utils.unitize(y => parseFloat(y) % (rows * h))
    }
  });
}

  onMount(async () => {
    const mod = await import("gsap");
    gsap = mod.gsap;

    const tiles = document.querySelectorAll(".tile");
    const whole = document.querySelector(".whole");
    const pieces = document.querySelectorAll(".piece");

    // démarre en ↘
startTween(tiles, currentDir, 1, false);
    // --- Swipe detection avec inertie ---
    let startX = 0, startY = 0, startTime = 0;
    whole.addEventListener("touchstart", (e) => {
      const touch = e.changedTouches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    });

    whole.addEventListener("touchend", (e) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const dt = Date.now() - startTime;

      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return; // seuil

      // direction principale
      const horiz = dx > 0 ? "right" : "left";
      const vert = dy > 0 ? "down" : "up";
      const key = horiz + vert;

      if (directions[key]) {
        currentDir = directions[key];

        // vitesse = distance / temps
        const dist = Math.sqrt(dx*dx + dy*dy);
        const speed = dist / dt;
        const speedFactor = gsap.utils.clamp(0.5, 3, speed * 0.5);

        // swipe → inertiel
        startTween(tiles, currentDir, speedFactor, true);
      }
    });

    // double clic → rotation de toutes les pièces
      let clickTimeout;
    let zoomed = false;

      whole.addEventListener("click", () => {
        // attend pour voir si un deuxième clic arrive
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
          // 👉 Action du simple clic
          gsap.to(pieces, {
            rotation: "+=45",
            transformOrigin: "50% 50%",
            duration: 0.4,
            ease: "power2.inOut"
          });
        }, 250); // délai max avant qu’on considère que c’est un "vrai" simple clic
      });

      whole.addEventListener("dblclick", () => {
        clearTimeout(clickTimeout); // empêche l’action du clic simple
        // 👉 Action du double-clic
        const randomRotation = gsap.utils.random(-120, 10);
        gsap.to(pieces, {
          scale: zoomed ? 1 : 1.2,
          rotation: `+=${randomRotation}`,
          transformOrigin: "50% 50%",
          duration: 0.6,
          ease: "power2.inOut"
        });
              zoomed = !zoomed;

      });



    
    // no-scroll
    const preventScroll = (e) => e.preventDefault();
    document.body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventScroll);
    };
  });
</script>

<style>
  body, html{
    overflow: hidden;
    height: 100%;
    overscroll-behavior: none; /* évite le "rebond" sur mobile */
  }
  polygon {
  }
</style>

  <div class="h-svh absolute w-screen z-1">
    <div class="whole h-svh absolute w-screen z-1]">
      <svg
  viewBox={`${offsetX} ${offsetY} ${viewW} ${viewH}`}
  width="100%"
  height="100%"
  preserveAspectRatio="xMidYMid slice"
>
  {#each [-1,0,1] as rr}
    {#each [-1,0,1] as cc}
      <g class="tile" transform={`translate(${cc * cols * w}, ${rr * rows * h})`}>
        {#each Array(rows) as _, r}
          <g transform={`translate(0, ${r * h})`}>
            {#each Array(cols) as _, c}
              <polygon
                fill={PIECES_DATA[2].color}     
                class="piece"
                points="0,0 5,0 5,5"
                transform={`translate(${c * w}, 0)`}
              />
            {/each}
          </g>
        {/each}
      </g>
    {/each}
  {/each}
</svg>
    </div>
  </div>

  <div class="no-select relative z-2 flex flex-col py-[80px] items-center justify-between min-h-svh text-center pointer-events-none">
    <div class="py-[20px] px-[50px] max-w-4/5 text-center height-auto whitespace-pre-line bg-white border border-black drop-shadow-[var(--my-nd-drop-shadow)] pointer-events-none">
      Bravo tu as découvert :
      <div class="text-titre-alt inf-bold my-5 uppercase">
         {PIECES_DATA[2].color_name}
        <!-- {currentPiece?.color_name} -->
      </div>
      À quelle œuvre penses-tu que<br/>cette couleur appartient ?
    </div>

  <div class="pointer-events-auto text-titre-alt inf-bold uppercase py-[25px] px-[30px] w-fit text-center height-auto whitespace-pre-line bg-white border border-black drop-shadow-[var(--my-drop-shadow)]" on:click={() => handleCC('2')}>
      VERIFIE TON HYPOTHÈSE<br/>EN APPUYANT ICI
  </div>
</div>