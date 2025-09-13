<script>
  import { onMount } from "svelte";
  let gsap;

  const VARS = ["--c1", "--c2", "--c3", "--c4", "--c5", "--c6", "--c7"];
  let COLORS = [];
  let currentIndex = 0;
  let tl;

  onMount(async () => {
    const mod = await import("gsap");
    gsap = mod.gsap;

    // Récupération des valeurs CSS
    const rootStyle = getComputedStyle(document.documentElement);
    COLORS = VARS.map(v => rootStyle.getPropertyValue(v).trim());

    // couleur initiale
    gsap.set("#bg", { backgroundColor: COLORS[0] });

    // Création de la timeline
    makeTimeline();

    // Écouteurs pour clic/tap
    document.addEventListener("click", nextColor);
    document.addEventListener("touchstart", nextColor);
  });

  function makeTimeline(startIndex = 0) {
    if (tl) tl.kill(); // supprime ancienne timeline

    tl = gsap.timeline({ repeat: -1 });

    // couleurs à partir de l’index demandé
    const orderedColors = [
      ...COLORS.slice(startIndex + 1),
      ...COLORS.slice(0, startIndex + 1)
    ];

    orderedColors.forEach((color) => {
      tl.to("#bg", {
        backgroundColor: color,
        duration: 1,
        ease: "power2.inOut"
      });
      tl.to({}, { duration: 2.5 }); // pause
    });
  }

  function nextColor() {
    if (!gsap || !tl) return;

    tl.pause(); // on stoppe l’anim auto

    // avancer l’index
    currentIndex = (currentIndex + 1) % COLORS.length;

    // fade vers la prochaine couleur
    gsap.to("#bg", {
      backgroundColor: COLORS[currentIndex],
      duration: 0.2,
      ease: "power2.inOut",
      onComplete: () => {
        // on recrée la timeline depuis cette couleur
        makeTimeline(currentIndex);
      }
    });
  }
</script>

<style>
  :global(html, body) {
    width: 100%;
    margin: 0;
    min-height: 100svh;
    color: #fff;
  }

  #bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    background-color: #000;
  }
</style>

<!-- fond animé -->
<div id="bg"></div>

<header>
  <div class="text-mini text-center py-2 fixed w-full z-10 top-0">
    Une remarque / une question :
    <a class="underline" href="mailto:museedartcontemporain@laregion.fr">museedartcontemporain@laregion.fr</a>
  </div>
  <div class="fixed z-10 right-5 top-[35px]">
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.1421 15.1421L15.0208 17.2635L0.87868 3.12132L3 1L17.1421 15.1421Z" fill="white"/>
      <path d="M2.85786 17.1421L0.736544 15.0208L14.8787 0.87868L17 3L2.85786 17.1421Z" fill="white"/>
    </svg>
  </div>
</header>

<div class="absolute left-0 p-5 w-full text-center" style="top: 11%;">
  <span class="text-title inf-bold">CHROMOGRAM</span><br />
  Une proposition d’Armelle Caron
</div>

<div class="absolute top-0 left-0 flex text-center flex-col items-center justify-center h-svh m-auto p-5 w-full">
  <div class="w-full relative top-[-0%]">
    <div class="w-[80vw] m-auto text-titre-alt">
      <img src="/images/mrac_logo.svg" />
      146 Av. de la Plage - 34410 Sérignan<br/>+33 4 67 17 88 95
    </div>
  </div>
</div>

<footer class="text-mini p-5 pb-4 fixed w-full text-center bottom-0">
  Programmation : Théo Goedert<br />
  Conception / Design / Programmation : Stéphane Kouchian<br />
  Typographie : Infini, Sandrine Nugue / CNAP<br />
  Remerciements à Mathilde Ruiz Sidobre
  <div class="w-[40vw] m-auto mt-5">
    <img src="/images/logos.svg" />
  </div>
</footer>