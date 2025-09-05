<script>
  import { onMount } from "svelte";
<<<<<<< Updated upstream
  import { setShapesLayout, setShapesForeground } from "$lib/shapesStore.js";
  import { goto } from "$app/navigation";
=======
  import { startPageTransition } from "$lib/transitionStore.js";
  import { goto } from "$app/navigation";
  import { setShapesLayout, setShapesForeground } from "$lib/shapesStore.js";
>>>>>>> Stashed changes
  let gsap; // SSR-safe

  // === Router de clic pour .bt1 ===
  let bt1Mode = 'play'; // trigger final animation directly
  const handleBt1 = (e) => toLayout3(e);

  // === Helpers TITLE (inchangé) ===
  let curAngle = -45;
  let curFrac  = 0.82;
  let curPlace = "center";

  function measureBaseWH(el) {
    const clone = el.cloneNode(true);
    clone.style.cssText += `
      position:fixed; left:-99999px; top:0;
      transform:none; transform-origin:center;
      white-space:nowrap; visibility:hidden;
    `;
    document.body.appendChild(clone);
    const r = clone.getBoundingClientRect();
    document.body.removeChild(clone);
    return { w: r.width, h: r.height };
  }

  function fitTitle(angleDeg, targetFrac, place, animate = false) {
    const el = document.querySelector(".title");
    if (!el || !gsap) return;

    curAngle = angleDeg;
    curFrac  = targetFrac;
    curPlace = place;

    let scaleValue = 1;
    if (targetFrac !== 1) {
      const { w, h } = measureBaseWH(el);
      const T = window.innerWidth * targetFrac;
      const a = (angleDeg * Math.PI) / 180;
      const denom = Math.abs(w * Math.cos(a)) + Math.abs(h * Math.sin(a)) || 1;
      scaleValue = T / denom;
    }

    const pos =
      place === "center"
        ? { left: "50%", top: "40%", xPercent: -50, yPercent: -40, x: 0, y: 0 }
        : { left: "50%", top: "35px", xPercent: -50, yPercent: 0, x: 0, y: 0 };

    gsap.to(el, {
      ...pos,
      rotate: angleDeg,
      scale: scaleValue,
      transformOrigin: "center center",
      duration: animate ? 0.6 : 0,
      ease: "power2.inOut"
    });
  }

  function toLayout2(e) {
    e?.preventDefault();

    // Animate shapes to index layout (around content)
    setShapesLayout('index', { animate: true });

    // Show intro text
    gsap.to(".intro-intro", { opacity: 1, display: "block", duration: 0.3, delay: 0.4 });

    // Animate controls to center position
    gsap.to(".controls", {
      left: "50%", right: "initial", xPercent: -50,
      bottom: "35px",
      duration: 0.6, ease: "power2.inOut",
      onStart: () => {
        // Text animation effect
        const finalText = "<span>JOUER</span>";
        const len = finalText.length;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const cycles = 10;
        const step = 0.08;
        const randStr = () =>

        Array.from({ length: len }, () => chars[(Math.random() * chars.length) | 0]).join("");

        gsap.to({}, {
          duration: step,
          repeat: cycles - 1,
          ease: "none",
          onRepeat: () => {
            gsap.to(".bt1", {
              duration: step,
              text: { value: randStr(), delimiter: "" },
              ease: "none"
            });
          },

          onComplete: () => {
            gsap.to(".bt1", {
              duration: 0.6,
              text: { value: finalText, delimiter: "" },
              ease: "none",
              onComplete: () => {
                bt1Mode = 'play';
              }
            });
          }
        });
      }
    });

    fitTitle(0, 1, "topLeft", true);

    // Navigate to index page after animation
    setTimeout(() => goto('/'), 600);
  }

function toLayout3(e) {
  e?.preventDefault();

  // Target height reference: align to the current button (bt1), fallback center
  const btnRect = document.querySelector('.bt1')?.getBoundingClientRect();
  const targetY = (btnRect ? btnRect.top + window.scrollY : window.scrollY + window.innerHeight * 0.5);

  // 1) .conta : 30dvh × 30dvh, centrée H, et alignée à la hauteur de .bt2
  gsap.to(".conta", {
    width: "1dvh",
    height: "1dvh",
    left: "50%",
    xPercent: -50,     // équivaut à translateX(-60%)
    top: targetY,
    yPercent: 0,       // on aligne le bord haut sur la hauteur de .bt2
    x: 0,
    y: 0,
    // on n'utilise plus le transform CSS initial ici (géré par xPercent/yPercent)
    duration: 0.6,
    ease: "power2.inOut"
  });

  gsap.to(".title", {
    left: "20px",
    top:"20px",
    xPercent: 0,
    fontSize:"24px",
    duration: 0.6,
    ease: "power2.inOut"
  });

  gsap.to(".text-bouton", {
    width:"100%",
    height:"100%",
    duration: 0.6,
    ease: "power2.inOut"
  });

  gsap.to(".controls", {
    width:"75%",
    height:"100vh",
    padding:"130px 0 100px 0",
    top: "50%",
    yPercent: -50,
    x: 0,
    y: 0,
    duration: 0.6,
    ease: "power2.inOut"
  });

  gsap.to(".controls .text-bouton", {
    padding:"20px",
  });

  gsap.to(".text-bouton span , .intro-intro", {
    opacity:0,
  });

  const layoutInitial = [
    { cls: ".p1", left: 0, top: "initial", right: "initial", bottom: 0, width: "75%", rotate: 0, height:"initial" },
    { cls: ".p2", left: 0, top: 0, right: 0, bottom: 0, height: "50%", rotate: 0, width:"initial" },
    { cls: ".p3", left: 0, top: 0, right: 0, bottom: 0, height: "100%", rotate: 0, width:"initial" },
    { cls: ".p4", left: 0, top: 0, right: "initial", bottom: "initial", height: "50%", rotate: 0, width:"initial" },
    { cls: ".p5", left: 0, top: 0, right: "initial", bottom: "initial", width: "100%", rotate: 0, height:"initial" },
    { cls: ".p6", left: 0, top: "initial", right: 0, bottom: 0, width: "50%", rotate: 0, yPercent: -50, height:"initial" },
    { cls: ".p7", left: 0, right: "initial", top: 0, bottom: "initial", width: "50%", rotate: 0, height:"initial" }
  ];
  apply(layoutInitial);

  // Animate shapes to final layout and navigate to depart
  setTimeout(() => goto('/depart'), 500);
}

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

<<<<<<< Updated upstream
=======
  function getRects(selectors) {
    const rects = {};
    selectors.forEach(sel => (rects[sel] = document.querySelector(sel)?.getBoundingClientRect()));
    return rects;
  }

  function toLayout2(e) {
    e?.preventDefault();

    const targetRect = document.querySelector(".bt2").getBoundingClientRect();
    const r = getRects([".p1",".p2",".p3",".p4",".p5",".p6",".p7"]);

    const layout2 = [
      { cls: ".p1", left: `${-0.15 * r[".p1"].width}px`, bottom: `${0.12 * r[".p1"].height}px`, top: "initial", right: "initial", rotate: 0, width:"71%" },
      { cls: ".p2", left: "100%", bottom: "0", top: "initial", right: "initial", rotate: 0, width:"75%" },
      { cls: ".p3", left: "-100%", bottom: "0", top: "initial", right: "initial", rotate: 0, width:"75%" },
      { cls: ".p4", left: `${-0.6 * r[".p4"].width}px`, bottom: "initial", top: "16%", right: "initial", rotate: 45, width:"40%" },
      { cls: ".p5", left: "56%", bottom: "initial", top: "12%", right: "initial", rotate: -45, width:"70%" },
      { cls: ".p6", left: "64%", bottom: "12%", top: "initial", right: "initial", rotate: 45, width:"48%", yPercent: 0, y: 0 },
      { cls: ".p7", left: "-10%", bottom: "initial", top: `${-0.5 * r[".p7"].height}px`, right:"initial", rotate: 90, width:"75%" },
    ];

    gsap.to(".piece polygon", { strokeWidth: 0, duration: 0.4 });
    gsap.to(".conta", {
      left: "0", top: "0", x: 0, y: 0,
      transform: "translate(0%, 0%)",
      width: "100dvw", height: "100dvh",
      duration: 0.6, ease: "power2.inOut"
    });
    gsap.to(".intro-intro", { opacity: 1, display: "block", duration: 0.3, delay: 0.4 });

    gsap.to(".controls", {
      left: "50%", right: "initial", xPercent: -50,
      top: targetRect.top + window.scrollY,
      duration: 0.6, ease: "power2.inOut",
      onStart: () => {
        // Effet “slot” puis mot final
        const finalText = "<span>JOUER</span>";
        const len = finalText.length;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const cycles = 10;
        const step = 0.08;
        const randStr = () =>
          Array.from({ length: len }, () => chars[(Math.random() * chars.length) | 0]).join("");

        gsap.to({}, {
          duration: step,
          repeat: cycles - 1,
          ease: "none",
          onRepeat: () => {
            gsap.to(".bt1", {
              duration: step,
              text: { value: randStr(), delimiter: "" },
              ease: "none"
            });
          },
          onComplete: () => {
            gsap.to(".bt1", {
              duration: 0.6,
              text: { value: finalText, delimiter: "" },
              ease: "none",
              onComplete: () => {
                // ⬅️ Dès maintenant, .bt1 agit comme bt2
                bt1Mode = 'play';
              }
            });
          }
        });
      }
    });

    apply(layout2);
    fitTitle(0, 1, "topLeft", true);
  }

function toLayout3(e) {
  e?.preventDefault();

  // Target height reference: align to the current button (bt1), fallback center
  const btnRect = document.querySelector('.bt1')?.getBoundingClientRect();
  const targetY = (btnRect ? btnRect.top + window.scrollY : window.scrollY + window.innerHeight * 0.5);

  // 1) .conta : 30dvh × 30dvh, centrée H, et alignée à la hauteur de .bt2
  gsap.to(".conta", {
    width: "1dvh",
    height: "1dvh",
    left: "50%",
    xPercent: -50,     // équivaut à translateX(-60%)
    top: targetY,
    yPercent: 0,       // on aligne le bord haut sur la hauteur de .bt2
    x: 0,
    y: 0,
    // on n'utilise plus le transform CSS initial ici (géré par xPercent/yPercent)
    duration: 0.6,
    ease: "power2.inOut"
  });

  gsap.to(".title", {
    left: "20px",
    top:"20px",
    xPercent: 0,
    fontSize:"19px",
    duration: 0.6,
    ease: "power2.inOut"
  });

  gsap.to(".text-bouton", {
    width:"100%",
    height:"100%",
    duration: 0.6,
    ease: "power2.inOut"
  });

  gsap.to(".controls", {
    width:"75%",
    height:"100vh",
    padding:"130px 0 100px 0",
    top: "50%",
    yPercent: -50,
    x: 0,
    y: 0,
    duration: 0.6,
    ease: "power2.inOut"
  });

  gsap.to(".controls .text-bouton", {
    padding:"20px",
  });

  gsap.to(".text-bouton span , .intro-intro", {
    opacity:0,
  });

  // 2) Restaure l'épaisseur de trait (état initial)
  // gsap.to(".piece polygon", { strokeWidth: 4, duration: 0.3 });

  // 3) Pièces : retour EXACT aux valeurs de ton CSS initial
  const layoutInitial = [
    { cls: ".p1", left: 0, top: "initial", right: "initial", bottom: 0, width: "75%", rotate: 0, height:"initial" },
    { cls: ".p2", left: 0, top: 0, right: 0, bottom: 0, height: "50%", rotate: 0, width:"initial" },
    { cls: ".p3", left: 0, top: 0, right: 0, bottom: 0, height: "100%", rotate: 0, width:"initial" },
    { cls: ".p4", left: 0, top: 0, right: "initial", bottom: "initial", height: "50%", rotate: 0, width:"initial" },
    { cls: ".p5", left: 0, top: 0, right: "initial", bottom: "initial", width: "100%", rotate: 0, height:"initial" },
    { cls: ".p6", left: 0, top: "initial", right: 0, bottom: 0, width: "50%", rotate: 0, yPercent: -50, height:"initial" },
    { cls: ".p7", left: 0, right: "initial", top: 0, bottom: "initial", width: "50%", rotate: 0, height:"initial" }
  ];
  apply(layoutInitial);

  // 4) Titre : retour à l’état initial
  // fitTitle(-45, 0.82, "center", true);

  // (Optionnel) si tu veux que bt1 redevienne "enter" après retour :
  // bt1Mode = 'enter';

  // Animate shapes to index layout and navigate
  setShapesLayout('index', { animate: true });
  setTimeout(() => goto('/'), 100);
}

>>>>>>> Stashed changes
  onMount(async () => {
    // no-scroll
    const preventScroll = (e) => e.preventDefault();
    document.body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventScroll, { passive: false });

    // Set shapes to intro layout immediately (before GSAP loads)
    setShapesLayout('intro', { animate: false });
    setShapesForeground(true);

    // GSAP + TextPlugin (SSR-safe)
    const mod = await import("gsap");
    const TextPlugin = (await import("gsap/TextPlugin")).TextPlugin;
    mod.gsap.registerPlugin(TextPlugin);
    gsap = mod.gsap;
    // Set shapes to intro layout instantly (no animation on load)
    setShapesLayout('intro', { animate: false });
    setShapesForeground(true);

    // init title
    fitTitle(-45, 0.82, "center", false);

    const onRez = () => fitTitle(curAngle, curFrac, curPlace, false);
    window.addEventListener("resize", onRez);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("resize", onRez);
      setShapesForeground(false);
    };
  });
</script>

<style>
  body, html{
    overflow: hidden;
    height: 100%;
    overscroll-behavior: none;
  }
<<<<<<< Updated upstream
=======

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
    /* transform: translateY(-50%); */
  }

  /* Couleurs (optionnel) */
  .p1 polygon { fill: var(--c1, #1B3C75); }
  .p2 polygon { fill: var(--c2, #FFE215); }
  .p3 polygon { fill: var(--c3, #A3CFE6); }
  .p4 polygon { fill: var(--c4, #0B4ED1); }
  .p5 polygon { fill: var(--c5, #1A5435); }
  .p6 polygon { fill: var(--c6, #7B77D4); }
  .p7 polygon { fill: var(--c7, #44A635); }

>>>>>>> Stashed changes
</style>

<div class="h-screen">
  <div class="z-10 fixed title w-max text-intro inf-bold mx-auto bg-white border py-1 px-[14px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]">CHROMOGRAM #1</div>
  <div class="controls fixed z-20 right-[50px] bottom-[35px]">
    <div
      on:click={handleBt1}
      on:touchstart={handleBt1}
      class="bt1 z-10 text-bouton inf-bold w-fit bg-white border py-[7px] px-[15px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]">
      <span>ENTRER</span>
    </div>
  </div>
</div>

<div class="d-none absolute inset-x-0 top-0 z-10 h-[100dvh] px-2 flex items-center justify-evenly flex-col pt-[105px] pb-[25px]">

<<<<<<< Updated upstream
=======
    L'art est habité de mille couleurs. Subtiles, franches, opposées, brutales ou délicates.
    Elles sont partout et toujours précisément choisies par les artistes.

    Le CHROMOGRAM #1 vous propose de les découvrir dans les salles de l'exposition ALLONS, de les observer avec attention pour révéler toutes leurs nuances. Ce jeu est une invitation à chercher des qr codes cachés dans les salles.
    Chacun d'eux débloque un élément du tangram et une couleur à retrouver dans les œuvres présentées et ainsi de débloquer le CHROMOGRAM.

    Il y a 7 qr codes à trouver dans l'exposition.
  </div>

  <div class="opacity-0 bt2 z-10 text-bouton inf-bold w-fit bg-white border border-black py-[7px] px-[15px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)]">
    <span>JOUER</span>
  </div>
>>>>>>> Stashed changes
</div>