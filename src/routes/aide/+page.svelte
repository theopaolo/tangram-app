<script>
  import { onMount, onDestroy, tick } from "svelte";
  import { gsap } from "gsap";

  const TOTAL_BARS = 51;
  const COLORS = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#A833FF", "#33FFF5", "#FFC733"];
  const EFFECT_RADIUS = 200;

  let container;   // stripes
  let scrollBox;   // container scrollable
  let whiteBars = [];
  let whiteBarWidth = 0;
  let ro;

  function setup() {
    whiteBars = Array.from(container.querySelectorAll(".bar.white"));
    const w = container.clientWidth;
    whiteBarWidth = whiteBars.length ? w / whiteBars.length : 0;
  }

  function updateScrollFromX(x, useInertia = false) {
    const rect = container.getBoundingClientRect();
    const pct = Math.min(Math.max(x / rect.width, 0), 1);
    const scrollMax = scrollBox.scrollHeight - scrollBox.clientHeight;
    const targetScroll = pct * scrollMax;
    if (useInertia) {
      // ⚡️ inertie fluide avec GSAP
      gsap.to(scrollBox, { scrollTop: targetScroll, duration: 0.3, ease: "power2.out" });
    } else {
      // instantané
      scrollBox.scrollTop = targetScroll;
    }
    animateColors(x);
  }

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    updateScrollFromX(x, true); // inertie desktop
  }

  function onTouchMove(e) {
    if (!e.touches.length) return;
    const rect = container.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    updateScrollFromX(x, true); // inertie mobile
  }

  function onScroll() {
    const scrollMax = scrollBox.scrollHeight - scrollBox.clientHeight;
    const pct = scrollBox.scrollTop / scrollMax;
    const posX = pct * container.clientWidth;
    animateColors(posX);
  }

  function animateColors(posX) {
    const rect = container.getBoundingClientRect();
    const pct = Math.min(Math.max(posX / rect.width, 0), 1);
    const colorIndex = Math.floor(pct * (COLORS.length - 1));

    let closestIndex = 0, minDist = Infinity;
    for (let i = 0; i < whiteBars.length; i++) {
      const center = (i + 0.5) * whiteBarWidth;
      const d = Math.abs(center - posX);
      if (d < minDist) { minDist = d; closestIndex = i; }
    }

    for (let i = 0; i < whiteBars.length; i++) {
      const bar = whiteBars[i];
      const dfc = Math.abs(i - closestIndex);
      const dist = dfc * whiteBarWidth;

      const factor = dfc <= 2 ? 1 : Math.max(0, 1 - ((dist - 2 * whiteBarWidth) / EFFECT_RADIUS));
      const shifted = (colorIndex + dfc) % COLORS.length;
      const target = gsap.utils.interpolate("white", COLORS[shifted], factor);

      gsap.to(bar, {
        backgroundColor: target,
        duration: 0.25,
        ease: "power2.out",
        overwrite: true
      });
    }
  }

  onMount(async () => {
    await tick();
    if (!container) return;

    setup();
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("touchmove", onTouchMove, { passive: true });

    scrollBox.addEventListener("scroll", onScroll);

    ro = new ResizeObserver(() => { setup(); });
    ro.observe(container);
  });

  onDestroy(() => {
    container?.removeEventListener("mousemove", onMouseMove);
    container?.removeEventListener("touchmove", onTouchMove);
    scrollBox?.removeEventListener("scroll", onScroll);
    ro?.disconnect();
  });
</script>

<style>
  :global(html, body) {
    margin: 0;
    height: 100%;
    overflow: hidden;
    background: #fff;
    color: #fff;
  }
  .scroll-box {
    height: 100svh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 60px 20px 20vh;
  }
  .striped-container {
    display:flex;
    width:100%;
    height:15vh;
    touch-action:none;
  }
   header {
    mix-blend-mode: difference;
  }
  .bar { flex:1; }
  .white { background:#fff; }
  .black { background:#000; }
</style>
<header class="fixed z-10 right-5 top-[35px]">
  <div>
    <svg width="18" height="18" fill="white" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.1421 15.1421L15.0208 17.2635L0.87868 3.12132L3 1L17.1421 15.1421Z"/>
      <path d="M2.85786 17.1421L0.736544 15.0208L14.8787 0.87868L17 3L2.85786 17.1421Z"/>
    </svg>
  </div>
</header>

<!-- Contenu scrollable -->
<div class="scroll-box" bind:this={scrollBox}>
  <div class="w-[30px] rotate-45 text-center m-auto"><img  src="/images/tan.jpg" /></div>

  <div style="" class="w-full mt-10 mb-10 text-titre-alt  text-center">
    <div class="p-5 bg-black mb-5">
      <div>
        <!-- <span class="">1.</span> -->
        Clique sur l'icone de l'appareil photo pour scanner un QR code.<br/>( Valide l’accès à l’appareil photo de ton téléphone ).
      </div>
    </div>
    <div class="p-5 bg-black mb-5">
      <div>
        <!-- <span class="">2.</span> -->
        Il y a 7 QR codes à trouver dans les salles de l'exposition correspondants aux 7 formes du tangram.      
      </div>
    </div>
    <div class="p-5 bg-black mb-5">
      <div>
        <!-- <span class="">3.</span> -->
        Quand tu scannes un QR code, la forme correspondante se colore.
      </div>
    </div>
    <div class="p-5 bg-black mb-5">
      <div>
        <!-- <span class="">4.</span> -->
        Clique sur une des formes colorées pour avoir des informations sur l'œuvre et la couleur.
      </div>
    </div>
    <div class="p-5 bg-black mb-5">
      <div>
        <!-- <span class="">5.</span> -->
        Complète le tangram en scannant les 7 QR codes cachés et accède aux puzzles.
      </div>
    </div>
    <div class="p-5 bg-black mb-5">
      <div>
        <!-- <span class="">6.</span> -->
        Résous les 7 tangrams du CHROMOGRAM.
      </div>
    </div>
    <div class="p-5 bg-black mb-5">
      <div>
        <!-- <span class="">7.</span> -->
        Débloque un fond d'écran conçu par Armelle Caron.
      </div>
    </div>
  </div>
  <div class="w-[30px] rotate-45 text-center m-auto"><img  src="/images/tan.jpg" /></div>
</div>

<!-- Stripes fixés en bas -->
<div class="striped-container fixed bottom-0 left-0" bind:this={container}>
  {#each Array(TOTAL_BARS) as _, i}
    <div class="bar" class:white={i % 2 === 0} class:black={i % 2 !== 0}></div>
  {/each}
</div>