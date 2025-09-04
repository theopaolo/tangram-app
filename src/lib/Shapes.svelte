<script>
  import { onMount } from 'svelte';
  import { shapesCommand, isShapesForeground } from './shapesStore.js';
  import { page } from '$app/stores';

  let gsap;
  let unsubscribe;
  let lastCmd = null;
  let hideShapes = $state(false);

  onMount(async () => {
    const mod = await import('gsap');
    gsap = mod.gsap;

    // Set initial layout to "around content" position
    setInitialLayout();

    // run any pending command fired before GSAP finished loading
    if (lastCmd) handleCommand(lastCmd);

    unsubscribe = shapesCommand.subscribe((cmd) => {
      if (!cmd) return;
      lastCmd = cmd;
      handleCommand(cmd);
    });

    // Hide shapes on depart page after 600ms delay
    $effect(() => {
      if ($page.route.id === '/depart') {
        setTimeout(() => {
          hideShapes = true;
        }, 600);
      } else {
        hideShapes = false;
      }
    });

    return () => unsubscribe?.();
  });

  function handleCommand(cmd) {
    if (!gsap) return; // will run after gsap loads via lastCmd
    switch (cmd.type) {
      case 'intro':
        setIntroLayout(cmd.payload?.animate !== false);
        break;
      case 'index':
        setIndexLayout(cmd.payload);
        break;
      case 'depart':
        setDepartLayout(cmd.payload);
        break;
    }
  }

  function setInitialLayout() {
    if (!gsap) return;
    // Don't set any layout initially - let each page set its own layout
  }

  function setIntroLayout(animate = true) {
    if (!gsap) return;

    // Intro layout: centered tangram (original working position)
    const containerProps = {
      left: "50%", top: "50%", x: "-60%", y: "-50%",
      transform: "translate(0%, 0%)",
      width: "103dvh", height: "103dvh"
    };

    if (animate) {
      gsap.to('.conta', { ...containerProps, duration: 0.6, ease: "power2.inOut" });
    } else {
      gsap.set('.conta', containerProps);
    }

    // Reset shapes to original centered positions matching your previous CSS exactly
    const layoutIntro = [
      { cls: ".p1", left: 0, top: 0, right: "initial", bottom: "initial", width: "75%", rotate: 0, height:"initial" },
      { cls: ".p2", left: "initial", top: 0, right: 0, bottom: "initial", height: "50%", rotate: 0, width:"initial" },
      { cls: ".p3", left: 0, top: 0, right: "initial", bottom: "initial", height: "100%", rotate: 0, width:"initial" },
      { cls: ".p4", left: "initial", top: "initial", right: 0, bottom: 0, height: "50%", rotate: 0, width:"initial" },
      { cls: ".p5", left: "initial", top: "initial", right: 0, bottom: 0, width: "100%", rotate: 0, height:"initial" },
      { cls: ".p6", left: "initial", top: "50%", right: 0, bottom: "initial", width: "50%", rotate: 0, yPercent: -50, height:"initial", transform: "translateY(-50%)" },
      { cls: ".p7", left: 0, right: 0, top: "25%", bottom: "initial", width: "50%", rotate: 0, height:"initial", margin: "auto" }
    ];

    if (animate) {
      apply(layoutIntro);
    } else {
      layoutIntro.forEach((item) => {
        const { cls, ...props } = item;
        gsap.set(cls, props);
      });
    }

    // Add stroke width for intro
    if (animate) {
      gsap.to('.piece polygon', { strokeWidth: 4, duration: 0.4 });
    } else {
      gsap.set('.piece polygon', { strokeWidth: 4 });
    }
  }

  function setIndexLayout() {
    if (!gsap) return;

    // Get current dimensions for relative positioning
    const getRects = (selectors) => {
      const rects = {};
      selectors.forEach(sel => (rects[sel] = document.querySelector(sel)?.getBoundingClientRect()));
      return rects;
    };

    const r = getRects([".p1",".p2",".p3",".p4",".p5",".p6",".p7"]);

    // Index layout: shapes around content
    const layoutIndex = [
      { cls: ".p1", left: `${-0.15 * (r[".p1"]?.width || 200)}px`, bottom: `${0.12 * (r[".p1"]?.height || 100)}px`, top: "initial", right: "initial", rotate: 0, width:"71%" },
      { cls: ".p2", left: "100%", bottom: "0", top: "initial", right: "initial", rotate: 0, width:"75%" },
      { cls: ".p3", left: "-100%", bottom: "0", top: "initial", right: "initial", rotate: 0, width:"75%" },
      { cls: ".p4", left: `${-0.6 * (r[".p4"]?.width || 100)}px`, bottom: "initial", top: "16%", right: "initial", rotate: 45, width:"40%" },
      { cls: ".p5", left: "56%", bottom: "initial", top: "12%", right: "initial", rotate: -45, width:"70%" },
      { cls: ".p6", left: "64%", bottom: "12%", top: "initial", right: "initial", rotate: 45, width:"48%", yPercent: 0, y: 0 },
      { cls: ".p7", left: "-10%", bottom: "initial", top: `${-0.5 * (r[".p7"]?.height || 50)}px`, right:"initial", rotate: 90, width:"75%" },
    ];

    // Animate container to full viewport
    gsap.to('.conta', {
      left: "0", top: "0", x: 0, y: 0,
      transform: "translate(0%, 0%)",
      width: "100dvw", height: "100dvh",
      duration: 0.6, ease: "power2.inOut"
    });

    // Animate shapes to around content position
    apply(layoutIndex);

    // Remove stroke width
    gsap.to('.piece polygon', { strokeWidth: 0, duration: 0.4 });
  }

  function setDepartLayout() {
    if (!gsap) return;

    // Change SVG viewBoxes and polygon points to form tangram
    const tangramData = [
      { selector: '.p1 svg', viewBox: '0 0 300 300', points: '15,15 150,150 285,15' },
      { selector: '.p2 svg', viewBox: '0 0 300 300', points: '15,15 150,150 15,285' },
      { selector: '.p3 svg', viewBox: '0 0 300 300', points: '150,150 217,217 217,83' },
      { selector: '.p4 svg', viewBox: '0 0 300 300', points: '150,150 217,217 150,285 83,217' },
      { selector: '.p5 svg', viewBox: '0 0 300 300', points: '217,83 217,217 285,150 285,15' },
      { selector: '.p6 svg', viewBox: '0 0 300 300', points: '15,285 150,285 83,217' },
      { selector: '.p7 svg', viewBox: '0 0 300 300', points: '150,285 285,150 285,285' }
    ];

    // Update SVG viewBoxes and polygon points
    tangramData.forEach(({ selector, viewBox, points }) => {
      const svg = document.querySelector(selector);
      const polygon = document.querySelector(selector.replace('svg', 'polygon'));
      if (svg && polygon) {
        svg.setAttribute('viewBox', viewBox);
        polygon.setAttribute('points', points);
      }
    });

    // Depart layout: form a green tangram in the center
    const layoutDepart = [
      { cls: ".p1", left: "50%", top: "50%", x: 0, y: 0, xPercent: -50, yPercent: -50, right: "initial", bottom: "initial", rotate: -90, width: "300px", height: "300px" },
      { cls: ".p2", left: "50%", top: "50%", x: 0, y: 0, xPercent: -50, yPercent: -50, right: "initial", bottom: "initial", rotate: -90, width: "300px", height: "300px" },
      { cls: ".p3", left: "50%", top: "50%", x: 0, y: 0, xPercent: -50, yPercent: -50, right: "initial", bottom: "initial", rotate: -90, width: "300px", height: "300px" },
      { cls: ".p4", left: "50%", top: "50%", x: 0, y: 0, xPercent: -50, yPercent: -50, right: "initial", bottom: "initial", rotate: -90, width: "300px", height: "300px" },
      { cls: ".p5", left: "50%", top: "50%", x: 0, y: 0, xPercent: -50, yPercent: -50, right: "initial", bottom: "initial", rotate: -90, width: "300px", height: "300px" },
      { cls: ".p6", left: "50%", top: "50%", x: 0, y: 0, xPercent: -50, yPercent: -50, right: "initial", bottom: "initial", rotate: -90, width: "300px", height: "300px" },
      { cls: ".p7", left: "50%", top: "50%", x: 0, y: 0, xPercent: -50, yPercent: -50, right: "initial", bottom: "initial", rotate: -90, width: "300px", height: "300px" },
    ];

    // Keep container in original position but make it 300x300px
    gsap.to('.conta', {
      left: "50%", top: "49%", x: "-50%", y: "-50%",
      transform: "translate(0%, 0%)",
      width: "300px", height: "300px",
      duration: 0.6, ease: "power2.inOut"
    });

    // Animate shapes to form tangram
    apply(layoutDepart);

    // Add stroke width and make all pieces green
    gsap.to('.piece polygon', { strokeWidth: 1, duration: 0.4 });

    // Set all pieces to green color
    gsap.to('.p1 polygon, .p2 polygon, .p3 polygon, .p4 polygon, .p5 polygon, .p6 polygon, .p7 polygon', {
      fill: '#7AC142', // Green color from piece 4 (Le Carré)
      duration: 0.6
    });
  }

  function apply(layout, contaWidth, contaHeight) {
    if (!gsap) return;
    if (contaWidth || contaHeight) {
      gsap.to('.conta', { width: contaWidth, height: contaHeight, duration: 0.6, ease: 'power2.inOut' });
    }
    layout.forEach((item, i) => {
      const { cls, ...props } = item;
      gsap.to(cls, { ...props, duration: 0.6, ease: 'power2.inOut', delay: i * 0.03 });
    });
  }

</script>

<style>
  .piece { position: fixed; transform-origin: center; will-change: left, top, width, transform; pointer-events: none; z-index: -5; }
  .piece svg { display: block; height: 100%; width: auto; overflow: visible; }
  .piece polygon { stroke: #fff; stroke-width: 4; vector-effect: non-scaling-stroke; }
  .p1{ width: 75%; top:0; left:0; z-index: 10; }
  .p2{ height: 50%; top:0; right: 0; }
  .p3{ height: 100%; top:0; left:0; }
  .p4{ height: 50%; bottom:0; right:0; }
  .p5{ width: 100%; right:0; bottom: 0; }
  .p6{ width: 50%; right:0; top: 50%; transform: translateY(-50%); }
  .p7{ width: 50%; left:0; right: 0; top: 25%; margin: auto; }
  .p1 polygon { fill: var(--c1, #1B3C75); }
  .p2 polygon { fill: var(--c2, #FFE215); }
  .p3 polygon { fill: var(--c3, #A3CFE6); }
  .p4 polygon { fill: var(--c4, #0B4ED1); }
  .p5 polygon { fill: var(--c5, #1A5435); }
  .p6 polygon { fill: var(--c6, #7B77D4); }
  .p7 polygon { fill: var(--c7, #44A635); }
</style>

<div class="conta h-[103dvh] w-[103dvh] absolute top-1/2 left-1/2 -translate-y-1/2 -z-10" class:hidden={hideShapes}>
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
