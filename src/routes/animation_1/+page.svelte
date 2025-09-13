<script>
  import { onMount } from "svelte";
  let gsap;

  const cols = 3;
  const rows = 20;
  const w = 7.5;   // largeur du triangle
  const h = 2.5;   // hauteur du triangle

    // 🔧 espace vertical entre les lignes (même unité que h, le repère du viewBox)
  const rowGap = 0;      // ⇦ augmente/diminue pour plus/moins d'espacement
  const rowPitch = h + rowGap; // pas vertical réel (ligne + espace)

  const visibleCols = 2.8;
  const viewW = visibleCols * w;
   const viewH = rows * rowPitch;

  // centrage vertical (ici = 0 car viewH == rows * rowPitch)
  const offsetX = (cols * w - viewW) / 2;
  const offsetY = (rows * rowPitch - viewH) / 2;



  onMount(async () => {
      const mod = await import("gsap");
      gsap = mod.gsap;


      // 🔹 au lieu de déplacer les lignes, on fait tourner chaque pièce
      document.querySelectorAll(".piece").forEach(polygon => {
        gsap.to(polygon, {
          rotation: "+=360",
          transformOrigin: "50% 50%",
          duration: 16,   // vitesse d'une rotation complète
          repeat: -1,    // boucle infinie
          ease: "linear" // rotation constante sans accélération
        });
      });
  
    const svg = document.querySelector("svg");
    // double clic → rotation de toutes les formes
    svg.addEventListener("dblclick", () => {
      const randomRotation = gsap.utils.random(-120, 180); 
      const pieces = document.querySelectorAll("svg");
      gsap.to(pieces, {
        rotation: `+=${randomRotation}`,
        transformOrigin: "50% 50%",
        duration: 1.2,
        ease: "power2.inOut",
      });

      
    });


      // ouste au clic sur une pièce
    document.querySelectorAll(".row").forEach(row => {
      row.addEventListener("click", () => {
        // Choisit -10 (gauche) ou +10 (droite) aléatoirement
        const dir = Math.random() < 0.5 ? -20 : 20;

        // toutes les pièces dans cette ligne
        const pieces = row.querySelectorAll(".piece");

        gsap.to(pieces, {
          x: `+=${dir}`,
          rotate:90,
          duration: 4,
          ease: "power2.inOut",
          yoyo: true,
          repeat: 1,
          stagger: {
            each: 2,       // délai entre chaque pièce
            from: "center"    // commence par le centre et se propage
          }
        });
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

    polygon { fill: var(--c1, #1B3C75); }

</style>

  <div class="h-svh absolute w-screen z-1">

    <div class="h-svh absolute w-screen z-1]">
      <svg
        overflow="visible"
        viewBox={`${offsetX} ${offsetY} ${viewW} ${viewH}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      >
        {#each Array(rows) as _, r}
        <g class="row" transform={`translate(0, ${r * rowPitch})`}>
            {#each Array(cols) as _, c}
              <polygon
                class="piece"
                points="7.5,2.5 2.5,2.5 0,0 5,0"
                transform={`translate(${c * w}, 0)`}
              />
            {/each}
          </g>
        {/each}
      </svg>
    </div>

  </div>


<div class="no-select relative z-2 flex flex-col py-[80px] items-center justify-between min-h-svh text-center pointer-events-none">
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