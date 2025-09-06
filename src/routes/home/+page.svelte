<script>
  import { onMount } from "svelte";
  let gsap; // SSR-safe
  let found = $state([]);

  // Tangram pieces data with original colors
  import { PIECES_DATA } from '$lib/piecesData';

  // === Router de clic pour .bt1 ===
  const handleBt1 = toLayout3;

  // Reactive function to set CSS custom properties for dynamic coloring (one-liner approach)
  $effect(() => Object.keys(PIECES_DATA).forEach(id => document.documentElement.style.setProperty(`--c${id}`, found.includes(id) ? PIECES_DATA[id].color : '#E6E6E6')));

  onMount(() => {
    found = localStorage.getItem('found')?.split(',').filter(Boolean) || [];
    console.log('found', found);
  });

  function apply(layout, contaWidth, contaHeight) {
    if (contaWidth || contaHeight) {
      gsap.to(".conta", {
        width: contaWidth,
        height: contaHeight,
        duration: 0.6,
        ease: "power2.inOut"
      });

    }
    layout.forEach((item, i) => {
      const { cls, ...props } = item;
      gsap.to(cls, {
        ...props,
        duration: 0.6,
        ease: "power2.inOut",
        delay: i * 0.03
      });
    });
  }

  function getRects(selectors) {
    const rects = {};
    selectors.forEach(sel => (rects[sel] = document.querySelector(sel)?.getBoundingClientRect()));
    return rects;
  }


function toLayout3(e) {
  e?.preventDefault();
  // Hauteur de référence : même hauteur que .bt2
  const targetRect = document.querySelector(".bt2").getBoundingClientRect();
  const targetY = targetRect.top + window.scrollY;

  // 1) .conta : 30dvh × 30dvh, centrée H, et alignée à la hauteur de .bt2
  gsap.to(".conta", {
    width: "80dvw",
    height: "80dvw",
    left: "50%",
    xPercent: -50,     // équivaut à translateX(-60%)
    // top: targetY,
    // rcent: 0,       // on aligne le bord haut sur la hauteur de .bt2
    top:"50%",
    yPercent: -50,       // on aligne le bord haut sur la hauteur de .bt2
    x: 0,
    y: 0,
    duration: 0.6,
    ease: "power2.inOut"
  });

  gsap.to(".piece polygon", {
      delay:0.4,
      strokeWidth:4,
      duration: 0.2,
      ease: "power2.inOut"
    });

  gsap.to(".title", {
    left: "20px",
    top:"20px",
    xPercent: 0,
    x:0,
    fontSize:"19px",
    duration: 0.6,
    ease: "power2.inOut"
  });
  // gsap.to(".text-bouton", {
  //   width:"100%",
  //   height:"100%",
  //   duration: 0.6,
  //   ease: "power2.inOut"
  // });
  gsap.to(".controls , .intro-intro", {
    opacity:0,
    display:"none",
    // width:"75%",
    // top: "50%",
    // yPercent: -50,
    // x: 0,
    // y: 0,
    duration: 0.2,
    ease: "power2.inOut"
  });
  gsap.to(".bloc_one", {
    opacity:1,
    display:"flex",
    delay:0.4,
    duration: 0.4,
    ease: "power2.inOut"
  });

  // gsap.to(".controls .text-bouton", {
  //   padding:"20px",
  // });
  // gsap.to(".text-bouton span", {
  //   opacity:0,
  // });


  // 3) Pièces : retour EXACT aux valeurs de ton CSS initial
  const layoutInitial = [
    { cls: ".p1", left: 0, top: 0, right: "initial", bottom: "initial", width: "75%", rotate: 0, height:"initial" },
    { cls: ".p2", left: "initial", top: 0, right: 0, bottom: 0, height: "50%", rotate: 0, width:"initial" },
    { cls: ".p3", left: 0, top: 0, right: 0, bottom: 0, height: "100%", rotate: 0, width:"initial" },
    { cls: ".p4", left: "initial", top: "initial", right: 0, bottom: 0, rotate: 0, width:"initial" },
    { cls: ".p5", left: 0, top: "initial", right: "initial", bottom: 0, width: "100%", rotate: 0, height:"initial" },
    { cls: ".p6", left: "initial", top: "initial", right: 0, bottom: 0, width: "50%", rotate: 0, yPercent: -50, height:"initial" },
    { cls: ".p7", left: 0, right: 0, top: "25%", bottom: "initial", width: "50%", rotate: 0, height:"initial" }
  ];
  apply(layoutInitial);

  // 4) Titre : retour à l’état initial
  // fitTitle(-45, 0.82, "center", true);

  // (Optionnel) si tu veux que bt1 redevienne "enter" après retour :
  // bt1Mode = 'enter';
}

function toLayout2Instant() {
  const r = getRects([".p1",".p2",".p3",".p4",".p5",".p6",".p7"]);

  const layout2 = [

    { cls: ".p1", left: `${-0.15 * r[".p1"].width}px`, bottom: `${0.12 * r[".p1"].height}px`, width:"71%" },
    { cls: ".p2", width:"75%" },
    { cls: ".p3", width:"75%" },
    { cls: ".p4", left: `${-0.6 * r[".p4"].width}px`, rotate: 45, width:"40%" },
    { cls: ".p5", rotate: -45, width:"70%" },
    { cls: ".p6", width:"48%" , rotate: 45},
    { cls: ".p7", top: `${-0.5 * r[".p7"].height}px`, rotate: 90,  width:"75%" },

  ];

  gsap.set(".conta", {
    width: "100dvw", height: "100dvh"
  });
  gsap.set(".controls", {
    top: document.querySelector(".bt2").getBoundingClientRect().top + window.scrollY
  });

  // appliquer layout instantanément
  layout2.forEach(item => {
    const { cls, ...props } = item;
    gsap.set(cls, props);
  });


}

onMount(async () => {
  const preventScroll = (e) => e.preventDefault();
  document.body.style.overflow = "hidden";
  document.addEventListener("touchmove", preventScroll, { passive: false });

  const mod = await import("gsap");
  gsap = mod.gsap;

  // Import dynamique du TextPlugin
  const { TextPlugin } = await import("gsap/TextPlugin");
  gsap.registerPlugin(TextPlugin);

  // aller directement au layout2 sans animation
  toLayout2Instant();


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
    stroke: #fff; stroke-width: 0; vector-effect: non-scaling-stroke;
  }
  .p1{
    width: 75%;
    top:initial;
    right: initial;
    left:0;
    z-index: 10;
  }
  .p2{
    left:100%;
    bottom:0;
    height: 50%;
    top:initial;
    right: initial;
  }
  .p3{
    height: 100%;
    top:0;
    right: initial;
    bottom:initial;
    left:-100%;
  }
  .p4{
    height: 50%;
    bottom:initial;
    right:initial;
    top: 16%;
  }
  .p5{
    left:56%;
    top:12%;
    bottom: initial;
    width: 100%;
    right:initial;
  }
  .p6{
    top: initial;
    right: initial;
    bottom:12%;
    left:64%;
    width: 50%;
    transform: translateY(0);
  }
  .p7{
    width: 50%;
    left:-10%;
    bottom: initial;
    right: initial;
    top: 25%;
    margin: auto;
    /* transform: translateY(-50%); */
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

<div class="h-screen">
  <div class="top-[35px] left-[50%] transform -translate-x-1/2 z-10 fixed title z-10 w-max text-intro inf-bold mx-auto w-fit tracking-[4%] bg-white border py-1 px-[14px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]">CHROMOGRAM #1</div>
  <div class="controls fixed z-20 left-[50%] right-[initial] bottom-[35px] -translate-x-[50%]">
    <div
      on:click={handleBt1}
      on:touchstart={handleBt1}
      class="bt1 z-10 text-bouton inf-bold w-fit bg-white border py-[7px] px-[15px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]">
      <span>JOUER</span>
    </div>
  </div>
</div>


<div class="w-[80dvw] w-screen bloc_one hidden flex opacity-0 z-[-1] z-100 py-[80px] text-center  absolute h-screen top-0 left-0 flex-col justify-evenly items-center">
  <div>
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
  <div class="h-[80dvw] bg-transparent"></div>
  <div>
    <img  src="/images/camera.svg" alt="camera" class="!w-[55px] h-auto " />
  </div>
</div>


<div class="d-none absolute inset-x-0 top-0 z-10 h-[100dvh] px-2 flex items-center justify-evenly flex-col pt-[105px] pb-[25px]">
  <div class="text-bouton intro-intro text-center height-auto max-w-prose whitespace-pre-line">
    CHROMOGRAM ou tangram des couleurs est un jeu proposé par l'artiste Armelle Caron qui se renouvelle à chaque exposition de collection.

    L'art est habité de mille couleurs. Subtiles, franches, opposées, brutales ou délicates.
    Elles sont partout et toujours précisément choisies par les artistes.

    Le CHROMOGRAM #1 vous propose de les découvrir dans les salles de l'exposition ALLONS, de les observer avec attention pour révéler toutes leurs nuances. Ce jeu est une invitation à chercher des qr codes cachés dans les salles.
    Chacun d'eux débloque un élément du tangram et une couleur à retrouver dans les œuvres présentées et ainsi de débloquer le CHROMOGRAM.

    Il y a 7 qr codes à trouver dans l'exposition.
  </div>


  <div class="opacity-0 bt2 z-10 text-bouton inf-bold w-fit bg-white border border-black py-[7px] px-[15px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]">
    <span>JOUER</span>
  </div>
</div>



<div class="conta flex justify-around flex-col h-[103dvh] w-[103dvh] absolute top-0 left-0 translate-0">
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