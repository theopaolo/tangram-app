<script>
  import { onMount } from "svelte";
  let gsap, Draggable, InertiaPlugin;

  let container;
  let grid;
  let zoomed = false;

  const cols = 20;
  const rows = 20;
  const size = 50; // taille polygone en px

  const svgW = cols * size;
  const svgH = rows * size;
  onMount(async () => {
    const mod = await import("gsap/all");
    gsap = mod.gsap;
    Draggable = mod.Draggable;
    InertiaPlugin = mod.InertiaPlugin;

    gsap.registerPlugin(Draggable, InertiaPlugin);

    // draggable sur la grille
    Draggable.create(grid, {
      type: "x,y",
      inertia: true,
      bounds: container, // rebond dans container
      edgeResistance: 0.8
    });
  });

  // rotation random sur click
  function randomRotate() {
    gsap.to("polygon", {
      rotation: () => gsap.utils.random(0, 360),
      transformOrigin: "50% 50%",
      duration: 1,
      stagger: 0.01
    });
  }

  // zoom sur double click
  function toggleZoom() {
    zoomed = !zoomed;
    gsap.to(grid, {
      scale: zoomed ? 2 : 1,
      transformOrigin: "50% 50%",
      duration: 0.5,
      ease: "power2.inOut"
    });
  }
</script>

<style>
  .viewport {
    width: 100vw; /* environ 2.2 colonnes visibles (2*100px) */
    height: 100svh;
    border: 1px solid #aaa;
    overflow: hidden;
    position: relative;
  }
  svg {
    /* width: {cols * size}px;
    height: {rows * size}px; */
    user-select: none;
    touch-action: none;
    
  }
  polygon {
    fill: #4fa;
    stroke-width: 1;
    scale:4
  }
</style>

<div
  class="viewport"
  bind:this={container}
  on:click={randomRotate}
  on:dblclick|preventDefault={toggleZoom}
>
  <svg
      width= ${svgW}
    height= ${svgH}
    viewBox={`0 0 ${svgW} ${svgH}`}
  
  bind:this={grid}>
    {#each Array(rows) as _, r}
      {#each Array(cols) as _, c}
        <polygon
          points="0,0 50,0 50,50"
          transform="translate({c * size}, {r * size})"
        />
      {/each}
    {/each}
  </svg>
</div>