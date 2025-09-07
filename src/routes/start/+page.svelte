<script>
  import { onMount } from "svelte";
  let gsap; // SSR-safe
  let found = $state([]);

  // Tangram pieces data with original colors
  import { PIECES_DATA } from '$lib/piecesData';

 
function applyColors() {
    Object.keys(PIECES_DATA).forEach(id => {
      document.documentElement.style.setProperty(
        `--c${id}`,
        found.includes(id) ? PIECES_DATA[id].color : '#E6E6E6'
      );
    });
  }

 


  onMount(() => {
    found = localStorage.getItem('found')?.split(',').filter(Boolean) || [];
    console.log('found', found);
    
  });

  
// function apply(layout) {
//      gsap.to(".title", {
//       left: "20px",
//       top:"20px",
//       xPercent: 0,
//       x:0,
//       fontSize:"19px",
//       duration: 0,
//     });
//   }



onMount(async () => {
  const preventScroll = (e) => e.preventDefault();
  document.body.style.overflow = "hidden";
  document.addEventListener("touchmove", preventScroll, { passive: false });

  const mod = await import("gsap");
  gsap = mod.gsap;

 applyColors()
  // apply();

  return () => {
    document.body.style.overflow = "";
    document.removeEventListener("touchmove", preventScroll);
  };
});


</script>

<style>

  .piece polygon {
    fill: var(--cMyPiece);
    /* transition: fill 0.4s ease-in 0.2s;  */
  }

  body, html{
    overflow: hidden;
    height: 100%;
    overscroll-behavior: none; /* évite le "rebond" sur mobile */
  }

  /* Une pièce = conteneur absolument positionné + 1 SVG avec viewBox identique */
  .piece {
    position: fixed;
    transform-origin: center; will-change: left, top, width, transform;
    pointer-events: auto; /* mets à auto si tu veux rendre cliquable la pièce */
    top: initial;
    right: initial;
    bottom: initial;
    left: initial;
  }
  .piece svg {
    display: block; height: 100%; width: auto; overflow: visible;
  }
  .piece polygon {
    stroke: #fff; stroke-width: 4; vector-effect: non-scaling-stroke;
  }

  .p1{
    width: 75%;
    top:0;
    left:0;
    z-index: 10;
  }
  .p2{
    height: 50%;
    top:0;
    right: 0;
  }
  .p3{
    height: 100%;
    top:0;
    left:0;
  }
  .p4{
    height: 50%;
    bottom:0;
    right:0;
  }
  .p5{
    width: 100%;
    right:0;
    bottom: 0;
  }
  .p6{
    width: 50%;
    right:0;
    top: 50%;
    transform: translateY(-50%);
  }
  .p7{
    width: 50%;
    left:0;
    right: 0;
    top: 25%;
    margin: auto;
  }
  /* Couleurs (optionnel) */
  .p1 polygon { fill: var(--c1, #ccffff); }
  .p2 polygon { fill: var(--c2, #ffe215); }
  .p3 polygon { fill: var(--c3, #0b4ed1); }
  .p4 polygon { fill: var(--c4, #7b77d4); }
  .p5 polygon { fill: var(--c5, #1a5435); }
  .p6 polygon { fill: var(--c6, #44a635); }
  .p7 polygon { fill: var(--c7, #1b3c75); }
</style>

  
<div class="top-5 left-5  fixed title z-10 w-max text-title inf-bold mx-auto w-fit bg-white border py-1 px-[14px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]">CHROMOGRAM #1</div>
<div class="top-2 right-5 fixed z-10 text-inter inf-bold">?</div>
<div class="top-3 right-13 fixed z-10"><img  src="/images/quoi.svg" alt="camera" class="" /></div>


<!-- <div class="w-screen bloc_one flex z-100 py-[80px] text-center  absolute h-screen top-0 left-0 flex-col justify-evenly items-center">
  <div class="w-[80dvw]">
    <p>Pars à la recherche des 7 formes du tangram pour débloquer le CHROMOGRAM !</p> -->

    <!-- {#if totalPiece === 0}
      Pars à la recherche des 7 formes du tangram pour débloquer le CHROMOGRAM !
    {:else if totalPiece === 1}
      Tu as déjà découvert 1 couleur !
      Pars à la recherche des 6 formes restantes du tangram pour débloquer le CHROMOGRAM !
    {:else if totalPiece === 6}
      Tu as déjà découvert 6 couleurs sur 7 !
      Pars à la recherche de la forme restante du tangram pour débloquer le CHROMOGRAM !
    {:else if totalPiece === 7}
      Bravo ! Tu as débloqué toutes les couleurs ! Les tangrams sont maintenant disponibles en cliquant en bas de page !
    {:else}
      Tu as déjà découvert {totalPiece} couleurs sur 7 !
      Pars à la recherche des {totalPiece-1} formes restantes du tangram pour débloquer le CHROMOGRAM !
    {/if}     -->
  <!-- </div>
  <div class="h-[80dvw] w-[80dvw] bg-transparent relative">
    <div class="absolute left-0 top-[100%] !w-[101px]"><img  src="/images/couleur.png" alt="couleur" class="" /></div>
  </div>
  <div class="relative">
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 !w-[55px]"><img  src="/images/camera.svg" alt="camera" class="" /></div>
    <div class="absolute left-10 top-1/2 translate-y-[-50%] !w-[108.3px]"><img  src="/images/arrow_cam.png" alt="camera" class="" /></div>
  </div>
  <div class="z-10 bottom-3.5 left-5 fixed text-mini" >Accueil > Les Couleurs > Les Tangrams</div>
  <div class="z-10 fixed text-mini bottom-3.5 right-5" >Crédits</div>

</div> -->


<div class="w-screen bloc_one  flex  z-100 pt-[80px] pb-[80px] text-center  absolute h-screen top-0 left-0 flex-col justify-evenly items-center">
  <div class="w-[80dvw]">
    <p>Pars à la recherche des 7 formes du tangram pour débloquer le CHROMOGRAM !</p>

    <!-- {#if totalPiece === 0}
      Pars à la recherche des 7 formes du tangram pour débloquer le CHROMOGRAM !
    {:else if totalPiece === 1}
      Tu as déjà découvert 1 couleur !
      Pars à la recherche des 6 formes restantes du tangram pour débloquer le CHROMOGRAM !
    {:else if totalPiece === 6}
      Tu as déjà découvert 6 couleurs sur 7 !
      Pars à la recherche de la forme restante du tangram pour débloquer le CHROMOGRAM !
    {:else if totalPiece === 7}
      Bravo ! Tu as débloqué toutes les couleurs ! Les tangrams sont maintenant disponibles en cliquant en bas de page !
    {:else}
      Tu as déjà découvert {totalPiece} couleurs sur 7 !
      Pars à la recherche des {totalPiece-1} formes restantes du tangram pour débloquer le CHROMOGRAM !
    {/if}     -->
    </div>
  <div class="h-[80dvw] w-[80dvw] relative">
        <div class="absolute left-0 top-full !w-[101px]"><img  src="/images/couleur.png" alt="couleur" class="" /></div>
  </div>
  <div class="relative">
    <img  src="/images/camera.svg" alt="camera" class="h-auto m-auto" />
    <div class="absolute left-15 top-1/2 translate-y-[-50%] !w-[108.3px]"><img  src="/images/arrow_cam.png" alt="camera" class="" /></div>
  </div>
  <div class="z-10 bottom-3.5 left-5 fixed text-mini" >Accueil > Les Couleurs > Les Tangrams</div>
  <div class="z-10 fixed text-mini bottom-3.5 right-5" >Crédits</div>
</div>





<div class="conta flex h-[80dvw] w-[80dvw] absolute top-[50%] left-[50%] -translate-[50%]">
  <div>
    <div class="piece p1">
      <svg viewBox="0 0 7.5 2.5">
        <polygon points="7.5,2.5 2.5,2.5 0,0 5,0" />
      </svg>
    </div>

    <div class="piece p2">
      <svg viewBox="0 0 5 5">
        <polygon points="0,0 5,0 5,5" />
      </svg>
    </div>

    <div class="piece p3">
      <svg viewBox="0 0 5 10">
        <polygon points="0,10 0,0 5,5" />
      </svg>
    </div>

    <div class="piece p4">
      <svg viewBox="0 0 2.5 5">
        <polygon points="2.5,5 2.5,0 0,2.5" />
      </svg>
    </div>

    <div class="piece p5">
      <svg viewBox="0 0 10 5">
        <polygon points="0,5 10,5 5,0" />
      </svg>
    </div>

    <div class="piece p6">
      <svg viewBox="0 0 5 5">
        <polygon points="0,2.5 2.5,0 5,2.5 2.5,5" />
      </svg>
    </div>

    <div class="piece p7">
      <svg viewBox="0 0 5 2.5">
        <polygon points="5,0 0,0 2.5,2.5" />
      </svg>
    </div>
  </div>

</div>