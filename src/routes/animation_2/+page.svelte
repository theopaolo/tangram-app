<script>
  import { onMount } from "svelte";
  let gsap;
  let tween;

  const cols = 21;
  const rows = 21;
  const w = 5;
  const h = 5;

  const visibleCols = 2.8;
  const viewW = visibleCols * w;
  const viewH = rows * h;

  const offsetX = (cols * w - viewW) / 2;
  const offsetY = (rows * h - viewH) / 2;

  // directions : ↘, ↗, ↖, ↙
  const directions = [
    { dx: 1, dy: 1 },   // ↘
    { dx: 1, dy: -1 },  // ↗
    { dx: -1, dy: -1 }, // ↖
    { dx: -1, dy: 1 }   // ↙
  ];
  let currentDir = 0;

  function startTween(tiles, dir) {
    if (tween) tween.kill();

    tween = gsap.to(tiles, {
      x: `+=${dir.dx * cols * w}`,
      y: `+=${dir.dy * rows * h}`,
      duration: 40,
      ease: "linear",
      repeat: -1,
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
    const svg = document.querySelector("svg");

    // démarre en ↘
    startTween(tiles, directions[currentDir]);

    // clic simple → change de direction
    svg.addEventListener("click", () => {
      currentDir = (currentDir + 1) % directions.length;
      startTween(tiles, directions[currentDir]);
    });

    // double clic → rotation de toutes les formes
    svg.addEventListener("dblclick", () => {
      const pieces = document.querySelectorAll(".piece");
      gsap.to(pieces, {
        rotation: "+=180",
        transformOrigin: "50% 50%",
        duration: 1.2,
        ease: "power2.inOut",
      });
    });

    // clic sur une seule pièce → rotation individuelle
    // document.querySelectorAll(".piece").forEach(polygon => {
    //   polygon.addEventListener("click", e => {
    //     e.stopPropagation();
    //     gsap.to(polygon, {
    //       rotation: "+=180",
    //       transformOrigin: "50% 50%",
    //       duration: 1,
    //       ease: "power2.inOut"
    //     });
    //   });
    // });

  });
</script>

<style>
  body, html{
    overflow: hidden;
    height: 100%;
    overscroll-behavior: none; /* évite le "rebond" sur mobile */
  }
  polygon {
    fill: var(--c2, #1B3C75);
  }
</style>

  <div class="h-screen absolute w-screen z-1">
    <div class="h-screen absolute w-screen z-1]">
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

  <div class="no-select relative z-2 flex flex-col py-[80px] items-center justify-between min-h-screen text-center pointer-events-none">
    <div class="py-[20px] px-[50px] w-fit text-center height-auto whitespace-pre-line bg-white border border-black drop-shadow-[var(--my-nd-drop-shadow)] pointer-events-none">
      Bravo tu as découvert :
      <div class="text-titre-alt inf-bold my-5 uppercase">
        LE VERT FORÊT<br/>SCINTILLANTE
        <!-- {currentPiece?.color_name} -->
      </div>
      À quelle œuvre penses-tu que<br/>cette couleur appartient ?
    </div>

    <div class="text-titre-alt inf-bold uppercase py-[25px] px-[30px] w-fit text-center height-auto whitespace-pre-line bg-white border border-black drop-shadow-[var(--my-drop-shadow)]">
        VERIFIE TON HYPOTHÈSE<br/>EN APPUYANT ICI
    </div>
  </div>