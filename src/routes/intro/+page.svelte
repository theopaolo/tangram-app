<script>
  import { onMount } from "svelte";
  let svgEl;
  let gsap; // sera chargé côté client

  const layout2 = { svgVW: 70, pieces: [
    { sel: "#p1", xPct: 20, yPct: 20 },
    { sel: "#p2", xPct: 75, yPct: 18 },
    { sel: "#p3", xPct: 15, yPct: 55 },
    { sel: "#p4", xPct: 45, yPct: 45 },
    { sel: "#p5", xPct: 50, yPct: 80 },
    { sel: "#p6", xPct: 78, yPct: 48 },
    { sel: "#p7", xPct: 88, yPct: 70 },
  ]};

  const layout3 = { svgVW: 80, pieces: [
    { sel: "#p1", xPct: 12, yPct: 25 },
    { sel: "#p2", xPct: 35, yPct: 20 },
    { sel: "#p3", xPct: 18, yPct: 70 },
    { sel: "#p4", xPct: 55, yPct: 45 },
    { sel: "#p5", xPct: 72, yPct: 78 },
    { sel: "#p6", xPct: 82, yPct: 35 },
    { sel: "#p7", xPct: 90, yPct: 60 },
  ]};

  function percentToViewBox(xPct, yPct) {
    const vb = svgEl.viewBox.baseVal;
    const x = (xPct / 100) * vb.width;
    const y = ((100 - yPct) / 100) * vb.height; // Y inversé par le <g>
    return { x, y };
  }

  function placePiece(el, xPct, yPct, duration = 0.5) {
    const b = el.getBBox();
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const { x, y } = percentToViewBox(xPct, yPct);
    const dx = x - cx, dy = y - cy;
    gsap.to(el, { attr: { transform: `translate(${dx} ${dy})` }, duration, ease: "power2.out", overwrite: true });
  }

  function applyLayout(layout) {
    if (!gsap) return; // sécurité si clic ultra-rapide
    gsap.to(svgEl, { width: `${layout.svgVW}vw`, duration: 0.5, ease: "power1.out" });
    layout.pieces.forEach(({ sel, xPct, yPct }, i) => {
      const el = svgEl.querySelector(sel);
      gsap.delayedCall(i * 0.04, () => placePiece(el, xPct, yPct, 0.5));
    });
  }

  // Handlers SANS arrow inline dans le markup
  function toLayout2(event) {
    event?.preventDefault();
    applyLayout(layout2);
  }
  function toLayout3(event) {
    event?.preventDefault();
    applyLayout(layout3);
  }

  onMount(async () => {
    const mod = await import("gsap"); // évite les soucis SSR
    gsap = mod.gsap;
  });
</script>

<style>
    svg, g{
        overflow:visible;
        display:block
    }
</style>


<div class="h-screen ">
    <div class=" z-10 relative top-[40%] -translate-y-[40%] scale-260 text-title inf-bold -rotate-45 mx-auto w-fit bg-white border py-1 px-[14px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]">
        CHROMOGRAM #1
    </div>


    <div on:click={toLayout2} on:touchstart={toLayout2} class="z-10 absolute bottom-[40px] right-[90px] text-bouton inf-bold w-fit bg-white border py-[7px] px-[15px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]">
        ENTRER
    </div>

    <div on:click={toLayout3} on:touchstart={toLayout3} class="z-10 absolute bottom-[80px] right-[90px] text-bouton inf-bold w-fit bg-white border py-[7px] px-[15px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]">
        ENTRER 2
    </div>

</div>

<div class="mt-[-2px]" style=" position:fixed; height:103%; top: 50%;left: 50%;transform: translate(-60%, -50%);">


<svg bind:this={svgEl} viewBox="0 0 10 10" width="auto" height="100%" style="">
  <g transform="translate(0,10) scale(1,-1)">
    <g id="p1"><polygon points="0,10 5,10 7.5,7.5 2.5,7.5" fill="var(--c1)" stroke="#fff" stroke-width="4" vector-effect="non-scaling-stroke"/></g>
    <g id="p2"><polygon points="5,10 10,10 10,5" fill="var(--c2)" stroke="#fff" stroke-width="4" vector-effect="non-scaling-stroke"/></g>
    <g id="p3"><polygon points="0,10 0,0 5,5" fill="var(--c3)" stroke="#fff" stroke-width="4" vector-effect="non-scaling-stroke"/></g>
    <g id="p4"><polygon points="2.5,7.5 7.5,7.5 5,5" fill="var(--c4)" stroke="#fff" stroke-width="4" vector-effect="non-scaling-stroke"/></g>
    <g id="p5"><polygon points="0,0 10,0 5,5" fill="var(--c6)" stroke="#fff" stroke-width="4" vector-effect="non-scaling-stroke"/></g>
    <g id="p6"><polygon points="5,5 7.5,2.5 10,5 7.5,7.5" fill="var(--c5)" stroke="#fff" stroke-width="4" vector-effect="non-scaling-stroke"/></g>
    <g id="p7"><polygon points="10,5 10,0 7.5,2.5" fill="var(--c7)" stroke="#fff" stroke-width="4" vector-effect="non-scaling-stroke"/></g>
  </g>
</svg>





  <!-- <svg class="top-[-2px] relative"
        viewBox="0 0 10 10" 
        width="auto" 
        height="105%" 
        style="display:block" 
        xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0,10) scale(1,-1)">
      <polygon id="forme_1" points="0,10 5,10 7.5,7.5 2.5,7.5" class="fill-(--color1)" stroke="#fff" stroke-width="0.05"/>
      <polygon points="5,10 10,10 10,5" class="fill-(--color2)" stroke="#fff" stroke-width="0.05"/>
      <polygon points="0,10 0,0 5,5" class="fill-(--color3)" stroke="#fff" stroke-width="0.05"/>
      <polygon points="2.5,7.5 7.5,7.5 5,5" class="fill-(--color4)" stroke="#fff" stroke-width="0.05"/>
      <polygon points="0,0 10,0 5,5" class="fill-(--color6)" stroke="#fff" stroke-width="0.05"/>
      <polygon points="5,5 7.5,2.5 10,5 7.5,7.5" class="fill-(--color5)" stroke="#fff" stroke-width="0.05"/>
      <polygon points="10,5 10,0 7.5,2.5" class="fill-(--color7)" stroke="#fff" stroke-width="0.05"/>
      
    </g>
  </svg> -->
</div>
