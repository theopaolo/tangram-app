<script>
  import { onMount } from "svelte";
  let gsap;

  const cols = 11;
  const rows = 11;
  const w = 5;   // largeur du triangle
  const h = 10;   // hauteur du triangle

  const visibleCols = 2.8;
  const viewW = visibleCols * w;
  const viewH = rows * h;

  onMount(async () => {
    const mod = await import("gsap");
    gsap = mod.gsap;

    const rowsEls = document.querySelectorAll(".row");

    rowsEls.forEach((row, i) => {
      const dir = i % 2 === 0 ? 1 : -1; // paire → droite, impaire → gauche
      const amplitude = w * 2;          // décalage total

      if (dir === -1) {
        // ligne qui va vers la gauche : démarre avec le bord gauche à -0.1
        gsap.set(row, { x: -0.1 });
        gsap.to(row, {
          x: viewW - cols * w - 0.1, // se déplace vers la gauche
          duration: 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.05
        });
      } else {
        // ligne qui va vers la droite : démarre avec le bord droit à viewW+0.1
        gsap.set(row, { x: (viewW + 0.9) - cols * w });
        gsap.to(row, {
          x: 0, // revient vers la gauche
          duration: 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.05
        });
      }
    });




    // no-scroll
    const preventScroll = (e) => e.preventDefault();
    document.body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("resize", onRez);
    };




  });



  // onMount(async () => {
  //   // no-scroll
  //   const preventScroll = (e) => e.preventDefault();
  //   document.body.style.overflow = "hidden";
  //   document.addEventListener("touchmove", preventScroll, { passive: false });

   
  // });
</script>

<style>
  body, html{
    overflow: hidden;
    height: 100%;
    overscroll-behavior: none; /* évite le "rebond" sur mobile */
  }

    polygon { fill: var(--c1, #1B3C75); }

</style>

  <div class="h-screen absolute w-screen z-[-1]">

<div class="h-screen absolute w-screen z-[-1]">
  <svg
    viewBox={`0 0 ${viewW} ${viewH}`}
    width="100%"
    height="100%"
    preserveAspectRatio="xMidYMid slice"
  >
    {#each Array(rows) as _, r}
      <g class="row" transform={`translate(0, ${r * h})`}>
        {#each Array(cols) as _, c}
          <polygon
            points="0,10 0,0 5,5"
            transform={`translate(${c * w}, 0)`}
            class="p1"
          />
        {/each}
      </g>
    {/each}
  </svg>
</div>





  </div>


<div class="flex flex-col py-[80px] items-center justify-between min-h-screen text-center">
  <div class="py-[20px] px-[50px] w-fit text-center height-auto whitespace-pre-line bg-white border border-black drop-shadow-[var(--my-nd-drop-shadow)]">
    Bravo tu as découvert :
    <div class="text-titre-alt inf-bold my-5 uppercase">
      LE VERT FORÊT<br/>SCINTILLANTE
    </div>
    A quelle œuvre penses tu que<br/>cette couleur appartient ?
  </div>

  <div class="text-titre-alt inf-bold uppercase py-[25px] px-[30px] w-fit text-center height-auto whitespace-pre-line bg-white border border-black drop-shadow-[var(--my-drop-shadow)]">
      VERIFIE TON HYPOTHÈSE<br/>EN APPUYANT ICI
  </div>
</div>