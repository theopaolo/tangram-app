<script>
  import { onMount } from "svelte";
  let gsap;

    const cols = 11;
    const rows = 11;
    const w = 2.5;   // largeur du triangle
    const h = 5;   // hauteur du triangle

    const visibleCols = 4.3;
    const viewW = visibleCols * w;
    const viewH = rows * h;

const gridW = cols * w;
const gridH = rows * h;


  onMount(async () => {
    const mod = await import("gsap");
    gsap = mod.gsap;

    // const rowsEls = document.querySelectorAll(".row");

      const svg = document.querySelector("svg");

      gsap.to(svg, {
        rotation: 360,          // un tour complet
        transformOrigin: "50% 50%", // centre du svg
        duration: 50,           // temps pour 1 tour
        ease: "linear",         // vitesse constante
        repeat: -1              // infini
      });

    // rowsEls.forEach((row, i) => {
    //   const dir = i % 2 === 0 ? 1 : -1; // paire → droite, impaire → gauche
    //   const amplitude = w * 2;          // décalage total

    //   if (dir === -1) {
    //     // ligne qui va vers la gauche : démarre avec le bord gauche à -0.1
    //     gsap.set(row, { x: -0.1 });
    //     gsap.to(row, {
    //       x: viewW - cols * w - 0.1, // se déplace vers la gauche
    //       duration: 13,
    //       repeat: -1,
    //       yoyo: true,
    //       ease: "sine.inOut",
    //       delay: i * 0.05
    //     });
    //   } else {
    //     // ligne qui va vers la droite : démarre avec le bord droit à viewW+0.1
    //     gsap.set(row, { x: (viewW + 0.9) - cols * w });
    //     gsap.to(row, {
    //       x: 0, // revient vers la gauche
    //       duration: 13,
    //       repeat: -1,
    //       yoyo: true,
    //       ease: "sine.inOut",
    //       delay: i * 0.05
    //     });
    //   }
    // });



        // rotation infinie du SVG entier
        gsap.to(svg, {
          rotation: 360,
          transformOrigin: "50% 50%",
          duration: 50,
          ease: "linear",
          repeat: -1
        });



        const wrapper = document.getElementById("zoom-wrapper");



        let zoomed = false;
        svg.addEventListener("dblclick", (e) => {
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

          gsap.to(wrapper, {
            scale: zoomed ? 1 : 4,
            svgOrigin: `${svgP.x} ${svgP.y}`,
            duration: 1.2,
            ease: "power2.inOut"
          });

          zoomed = !zoomed;
        });

          const whole = document.querySelector(".whole");

            // rotation aléatoire de toutes les pièces au clic / tap sur le SVG
            whole.addEventListener("click", () => {
              const pieces = document.querySelectorAll(".piece");

              gsap.to(pieces, {
                rotation: () => `+=${gsap.utils.random(-360, 360)}`, // angle aléatoire par pièce
                transformOrigin: "50% 50%",
                duration: 2,           // vitesse fixe
                ease: "power2.inOut"
              });
            });

            // mobile : pour éviter double déclenchement
            whole.addEventListener("touchstart", (e) => {
              e.preventDefault();
              const pieces = document.querySelectorAll(".piece");

              gsap.to(pieces, {
                rotation: () => `+=${gsap.utils.random(-360, 360)}`,
                transformOrigin: "50% 50%",
                duration: 2,
                ease: "power2.inOut"
              });
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
    fill: var(--c4, #1B3C75);
  }
</style>

  <div class="h-screen absolute w-screen z-1">
    <div class="whole h-screen absolute w-screen z-1]">
     <svg
  overflow="visible"
  viewBox={`${-viewW/2} ${-viewH/2} ${viewW} ${viewH}`}
  width="100%"
  height="100%"
  preserveAspectRatio="xMidYMid slice"
>
  <g id="zoom-wrapper" transform={`translate(${-gridW/2}, ${-gridH/2})`}>
    {#each Array(rows) as _, r}
      <g class="row" transform={`translate(0, ${r * h})`}>
        {#each Array(cols) as _, c}
          <polygon
            class="piece"
            points="2.5,5 2.5,0 0,2.5"
            transform={`translate(${c * w}, 0)`}
          />
        {/each}
      </g>
    {/each}
  </g>
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