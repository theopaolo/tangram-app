<script>
  import { onMount } from "svelte";
  import { setShapesLayout, setShapesForeground } from "$lib/shapesStore.js";
  import { goto } from "$app/navigation";
  let gsap; // SSR-safe

  // === Router de clic pour .bt1 ===
  let bt1Mode = 'enter'; // 'enter' -> toLayout2, puis 'play' -> toLayout3
  const handleBt1 = (e) => (bt1Mode === 'enter' ? toLayout2(e) : toLayout3(e));

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

</div>