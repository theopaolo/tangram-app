<script>
  import { onMount } from "svelte";
  let gsap;

  const cols = 55;
  const rows = 55;
  const w = 5;   // largeur du triangle
  const h = 10;   // hauteur du triangle

  const visibleCols = 2.2;
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
          duration: 52,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      } else {
        // ligne qui va vers la droite : démarre avec le bord droit à viewW+0.1
        gsap.set(row, { x: (viewW + 0.9) - cols * w });
        gsap.to(row, {
          x: 0, // revient vers la gauche
          duration: 52,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    });



          const svg = document.querySelector("svg");
          const whole = document.querySelector(".whole");

          
          let zoomed = false;

          whole.addEventListener("dblclick", (e) => {
            const pieces = document.querySelectorAll("svg");
            const randomRotation = gsap.utils.random(-120, 200); 
            const pt = svg.createSVGPoint();
                pt.x = e.clientX;
                pt.y = e.clientY;
            const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
            gsap.to(pieces, {
              scale: zoomed ? 1 : 0.7,
              rotation: `+=${randomRotation}`,
              duration: 1.2,
              ease: "power2.inOut",
            });
                zoomed = !zoomed;


          });

    


    // rotation continue tant qu'on laisse appuyé
    document.querySelectorAll(".piece").forEach(polygon => {
      let rotateTween;

      const startRotate = () => {
        if (rotateTween) return; // déjà en train de tourner
        rotateTween = gsap.to(polygon, {
          rotation: "+=360",            // un tour complet
          transformOrigin: "50% 50%",   // centre
          duration: 2,                  // vitesse d’un tour
          ease: "linear",
          repeat: -1                    // boucle infinie
        });
      };

      const stopRotate = () => {
        if (rotateTween) {
          rotateTween.kill(); // stoppe l’animation
          rotateTween = null;
        }
      };

      // desktop
      polygon.addEventListener("mousedown", startRotate);
      polygon.addEventListener("mouseup", stopRotate);
      polygon.addEventListener("mouseleave", stopRotate);

      // mobile
      polygon.addEventListener("touchstart", startRotate);
      polygon.addEventListener("touchend", stopRotate);
      polygon.addEventListener("touchcancel", stopRotate);
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
    fill: var(--c3, #1B3C75);
  }
</style>

  <div class="h-screen absolute w-screen z-1">
    <div class="whole h-screen absolute w-screen z-1]">
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