<script>
  import { onMount } from "svelte";
  import { page } from '$app/stores';
  let gsap;

  import { goto } from '$app/navigation';
  import { PIECES_DATA } from '$lib/piecesData';
  import { piecesStore } from '$lib/piecesStore.js';

  // Get piece ID from URL params
  const pieceId = $derived($page.params.id);
  const currentPiece = $derived(PIECES_DATA[pieceId]);

	let totalFound = $state(0);
	let foundPieces = $state([]);

	// --- FUNCTIONS ---
	onMount(() => {
		piecesStore.initialize();
		totalFound = piecesStore.count;
		foundPieces = piecesStore.pieces;
	});

  function handleCC(id) {
		if (foundPieces.includes(id)) {
			goto(`/indices/${id}`);
		}
	}

  // Animation-specific configuration based on piece ID
  const getAnimationConfig = (id) => {
    switch(id) {
      case '1':
        return {
          cols: 3, rows: 20, w: 7.5, h: 2.5, rowGap: 0,
          visibleCols: 2.6, shape: '7.5,2.5 2.5,2.5 0,0 5,0'
        };
      case '2':
        return {
          cols: 7, rows: 7, w: 5, h: 5, rowGap: 0,
          visibleCols: 2.2, shape: '0,0 5,0 5,5'
        };
      case '3':
        return {
          cols: 11, rows: 5, w: 5, h: 10, rowGap: 0,
          visibleCols: 2.2, shape: '0,10 0,0 5,5'
        };
      case '4':
        return {
          cols: 9, rows: 9, w: 2.5, h: 5, rowGap: 0,
          visibleCols: 4.3, shape: '2.5,5 2.5,0 0,2.5'
        };
      case '5':
        return {
          cols: 11, rows: 11, w: 10, h: 5, rowGap: 0,
          visibleCols: 1.4, shape: '0,5 10,5 5,0'
        };
      case '6':
        return {
          cols: 7, rows: 9, w: 5, h: 5, rowGap: 0,
          visibleCols: 2.3, shape: '0,2.5 2.5,0 5,2.5 2.5,5'
        };
      case '7':
        return {
          cols: 9, rows: 15, w: 5, h: 2.5, rowGap: 0,
          visibleCols: 2.5, shape: '5,0 0,0 2.5,2.5'
        };
      default:
        return {
          cols: 11, rows: 5, w: 5, h: 10, rowGap: 0,
          visibleCols: 2.2, shape: '0,10 0,0 5,5'
        };
    }
  };

  const config = $derived(getAnimationConfig(pieceId));
  const rowPitch = $derived(config.h + config.rowGap);
  const viewW = $derived(config.visibleCols * config.w);
  const viewH = $derived(config.rows * rowPitch);
  const gridW = $derived(config.cols * config.w);
  const gridH = $derived(config.rows * config.h);

  // For animation 2 - directional movement
  const directions = {
    rightdown: { dx: 1, dy: 1 },
    rightup: { dx: 1, dy: -1 },
    leftup: { dx: -1, dy: -1 },
    leftdown: { dx: -1, dy: 1 }
  };
  let currentDir = $state(directions.rightdown);
  let tween = $state(null);

  // Helper function for animation 2 directional movement
  function startTween(tiles, dir, speedFactor = 1, inertial = false) {
    if (tween) tween.kill();

    tween = gsap.to(tiles, {
      x: `+=${dir.dx * config.cols * config.w * 0.5 * speedFactor}`,
      y: `+=${dir.dy * config.rows * config.h * 0.5 * speedFactor}`,
      duration: inertial
        ? gsap.utils.clamp(2, 10, 8 / speedFactor)
        : 40,
      ease: inertial ? "power3.out" : "linear",
      repeat: inertial ? 0 : -1,
      yoyo: inertial ? false : true,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % (config.cols * config.w)),
        y: gsap.utils.unitize(y => parseFloat(y) % (config.rows * config.h))
      }
    });
  }

  onMount(async () => {
    const mod = await import("gsap");
    gsap = mod.gsap;

    const svg = document.querySelector("svg");
    const whole = document.querySelector(".whole");
    const pieces = document.querySelectorAll(".piece");
    const rowsEls = document.querySelectorAll(".row");
    const tiles = document.querySelectorAll(".tile");
    const wrapper = document.getElementById("zoom-wrapper");

    let zoomed = false;

    // Animation logic based on piece ID
    switch(pieceId) {
      case '1': // Individual piece rotation
        pieces.forEach((polygon) => {
          gsap.to(polygon, {
            rotation: "+=360",
            transformOrigin: "50% 50%",
            duration: 28,
            repeat: -1,
            ease: "linear"
          });
        });

        // Double click interaction
        svg?.addEventListener("dblclick", () => {
          const randomRotation = gsap.utils.random(-120, 180);
          gsap.to(svg, {
            scale: zoomed ? 1 : 2,
            rotation: `+=${randomRotation}`,
            transformOrigin: "40% 55%",
            duration: 1.2,
            ease: "power2.inOut",
          });
          zoomed = !zoomed;
        });

        // Click interactions
        pieces.forEach(piece => {
          piece.addEventListener("click", () => {
            const dir = Math.random() < 0.5 ? -20 : 20;
            const diro = Math.random() < 0.5 ? -10 : 10;
            gsap.to(piece, {
              x: `+=${dir}`,
              y: `+=${diro}`,
              rotate: 360,
              duration: 7,
              ease: "power2.inOut",
              yoyo: true,
              repeat: 1,
            });
          });
        });
        break;

      case '2': // Directional tiles movement with swipe
        if (tiles.length > 0) {
          startTween(tiles, currentDir, 1, false);
        }

        // Swipe detection
        let startX = 0, startY = 0, startTime = 0;
        whole?.addEventListener("touchstart", (e) => {
          const touch = e.changedTouches[0];
          startX = touch.clientX;
          startY = touch.clientY;
          startTime = Date.now();
        });

        whole?.addEventListener("touchend", (e) => {
          const touch = e.changedTouches[0];
          const dx = touch.clientX - startX;
          const dy = touch.clientY - startY;
          const dt = Date.now() - startTime;

          if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

          const horiz = dx > 0 ? "right" : "left";
          const vert = dy > 0 ? "down" : "up";
          const key = horiz + vert;

          if (directions[key]) {
            currentDir = directions[key];
            const dist = Math.sqrt(dx*dx + dy*dy);
            const speed = dist / dt;
            const speedFactor = gsap.utils.clamp(0.5, 3, speed * 0.5);
            startTween(tiles, currentDir, speedFactor, true);
          }
        });

        // Click interactions
        let clickTimeout;
        whole?.addEventListener("click", () => {
          clearTimeout(clickTimeout);
          clickTimeout = setTimeout(() => {
            gsap.to(pieces, {
              rotation: "+=45",
              transformOrigin: "50% 50%",
              duration: 0.4,
              ease: "power2.inOut"
            });
          }, 250);
        });

        whole?.addEventListener("dblclick", () => {
          clearTimeout(clickTimeout);
          const randomRotation = gsap.utils.random(-120, 10);
          gsap.to(pieces, {
            scale: zoomed ? 1 : 1.2,
            rotation: `+=${randomRotation}`,
            transformOrigin: "50% 50%",
            duration: 0.6,
            ease: "power2.inOut"
          });
          zoomed = !zoomed;
        });
        break;

      case '3': // Row-based triangular wave movement
        const cycleDuration = 60;
        gsap.ticker.add(() => {
          const now = performance.now() / 1000;
          const cycle = now % cycleDuration;
          const t = cycle / cycleDuration;

          let progress;
          if (t < 0.5) {
            progress = (t / 0.5) * 0.7;
          } else {
            progress = 0.7 * (1 - (t - 0.5) / 0.5);
          }

          rowsEls.forEach((row, i) => {
            const dir = i % 2 === 0 ? 1 : -1;
            const x = (dir === -1 ? progress : 0.7 - progress) * (viewW - config.cols * config.w);
            row.setAttribute("transform", `translate(${x}, ${i * config.h})`);
          });
        });

        // Interactions
        whole?.addEventListener("dblclick", () => {
          const randomRotation = gsap.utils.random(-120, 200);
          gsap.to(svg, {
            scale: zoomed ? 1 : 0.7,
            rotation: `+=${randomRotation}`,
            transformOrigin: "50% 50%",
            duration: 1.2,
            ease: "power2.inOut"
          });
          zoomed = !zoomed;
        });

        pieces.forEach((polygon) => {
          const rotateTween = gsap.to(polygon, {
            rotation: "+=360",
            transformOrigin: "50% 50%",
            duration: 2,
            ease: "linear",
            repeat: -1,
            paused: true
          });

          polygon.addEventListener("mousedown", () => rotateTween.play());
          polygon.addEventListener("mouseup", () => rotateTween.pause());
          polygon.addEventListener("mouseleave", () => rotateTween.pause());
          polygon.addEventListener("touchstart", () => rotateTween.play());
          polygon.addEventListener("touchend", () => rotateTween.pause());
          polygon.addEventListener("touchcancel", () => rotateTween.pause());
        });
        break;

      case '4': // SVG rotation + zoom
        const svgRotation = gsap.to(svg, {
          rotation: 360,
          transformOrigin: "50% 50%",
          duration: 120,
          ease: "linear",
          repeat: -1
        });

        svg?.addEventListener("dblclick", (e) => {
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

        whole?.addEventListener("click", () => {
          gsap.to(pieces, {
            rotation: () => `+=${gsap.utils.random(-360, 360)}`,
            transformOrigin: "50% 50%",
            duration: 2,
            ease: "power2.inOut"
          });
        });
        break;

      case '5': // Scale + rotation with yoyo
        gsap.to(svg, {
          scale: -1.5,
          rotate: 100,
          transformOrigin: "50% 50%",
          duration: 120,
          yoyo: true,
          ease: "linear",
          repeat: -1
        });

        svg?.addEventListener("dblclick", (e) => {
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

          gsap.to(wrapper, {
            scale: zoomed ? 1 : 2,
            rotate: zoomed ? -120 : 120,
            svgOrigin: `${svgP.x} ${svgP.y}`,
            duration: 1.2,
            ease: "power2.inOut"
          });
          zoomed = !zoomed;
        });

        whole?.addEventListener("click", () => {
          gsap.to(pieces, {
            rotate: 30,
            y: () => `+=${gsap.utils.random(-10, 10)}`,
            x: () => `+=${gsap.utils.random(-10, 10)}`,
            transformOrigin: "50% 50%",
            duration: 2,
            ease: "power2.inOut"
          });
        });
        break;

      case '6': // Horizontal movement
        gsap.to(svg, {
          x: 100,
          transformOrigin: "50% 50%",
          duration: 10,
          yoyo: true,
          ease: "linear",
          repeat: -1
        });

        svg?.addEventListener("dblclick", (e) => {
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

          gsap.to(wrapper, {
            scale: zoomed ? 1 : 0.5,
            svgOrigin: `${svgP.x} ${svgP.y}`,
            duration: 1.2,
            ease: "power2.inOut"
          });
          zoomed = !zoomed;
        });

        whole?.addEventListener("click", () => {
          gsap.to(pieces, {
            rotation: () => `+=${gsap.utils.random(-180, 120)}`,
            scale: () => `+${gsap.utils.random(1.5, 0.7)}`,
            transformOrigin: "50% 50%",
            duration: 2,
            ease: "power2.inOut"
          });
        });
        break;

      case '7': // Random individual rotations
        gsap.to(pieces, {
          rotation: () => `+=${gsap.utils.random(-360, 360)}`,
          transformOrigin: "10% 50%",
          duration: 140,
          ease: "linear",
          repeat: -1
        });

        svg?.addEventListener("dblclick", (e) => {
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

          gsap.to(wrapper, {
            rotation: () => `+=${gsap.utils.random(-180, 90)}`,
            svgOrigin: `${svgP.x} ${svgP.y}`,
            duration: 1.2,
            ease: "power2.inOut"
          });
          zoomed = !zoomed;
        });

        whole?.addEventListener("click", () => {
          gsap.to(svg, {
            scale: () => `+${gsap.utils.random(0.8, 1.5)}`,
            transformOrigin: "50% 50%",
            duration: 2,
            ease: "power2.inOut"
          });
        });
        break;

      default:
        // Fallback to animation 3 behavior
        const defaultCycleDuration = 60;
        gsap.ticker.add(() => {
          const now = performance.now() / 1000;
          const cycle = now % defaultCycleDuration;
          const t = cycle / defaultCycleDuration;

          let progress;
          if (t < 0.5) {
            progress = (t / 0.5) * 0.7;
          } else {
            progress = 0.7 * (1 - (t - 0.5) / 0.5);
          }

          rowsEls.forEach((row, i) => {
            const dir = i % 2 === 0 ? 1 : -1;
            const x = (dir === -1 ? progress : 0.7 - progress) * (viewW - config.cols * config.w);
            row.setAttribute("transform", `translate(${x}, ${i * config.h})`);
          });
        });
    }

    // --- Import scroll freeze utility ---
    const { freezeScroll, unfreezeScroll } = await import('$lib/utils/scrollFreeze.js');

    // Freeze scroll on mobile
    freezeScroll();

    // --- Cleanup quand le composant est démonté ---
    return () => {
      unfreezeScroll();
      if (tween) tween.kill();
      gsap.globalTimeline.clear();
      gsap.ticker.remove();
    };
  });
</script>

<style>
  polygon {
    will-change: transform;
  }
  .row, .whole {
    will-change: transform;
  }
</style>

{#if currentPiece}
<div class="h-svh absolute w-screen z-1">
  <div class="whole h-svh absolute w-screen z-1">
    {#if pieceId === '2'}
      <!-- Animation 2: Directional tiles -->
      <svg
        viewBox={`${(config.cols * config.w - viewW) / 2} ${(config.rows * config.h - viewH) / 2} ${viewW} ${viewH}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      >
        {#each [-1,0,1] as rr}
          {#each [-1,0,1] as cc}
            <g class="tile" transform={`translate(${cc * config.cols * config.w}, ${rr * config.rows * config.h})`}>
              {#each Array(config.rows) as _, r}
                <g transform={`translate(0, ${r * config.h})`}>
                  {#each Array(config.cols) as _, c}
                    <polygon
                      fill={currentPiece.color}
                      class="piece"
                      points={config.shape}
                      transform={`translate(${c * config.w}, 0)`}
                    />
                  {/each}
                </g>
              {/each}
            </g>
          {/each}
        {/each}
      </svg>
    {:else if pieceId === '4' || pieceId === '5' || pieceId === '6' || pieceId === '7'}
      <!-- Animations 4,5,6,7: Have zoom wrapper -->
      <svg
        overflow="visible"
        viewBox={`${-viewW / 2} ${-viewH / 2} ${viewW} ${viewH}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      >
        <g id="zoom-wrapper" transform={`translate(${-gridW / 2}, ${-gridH / 2})`}>
          {#each Array(config.rows) as _, r}
            <g class="row" transform={`translate(0, ${r * config.h})`}>
              {#each Array(config.cols) as _, c}
                <polygon
                  fill={currentPiece.color}
                  class="piece"
                  points={config.shape}
                  transform={`translate(${c * config.w}, 0)`}
                />
              {/each}
            </g>
          {/each}
        </g>
      </svg>
    {:else}
      <!-- Animations 1,3: Basic row structure -->
      <svg
        overflow="visible"
        viewBox={`0 0 ${viewW} ${viewH}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      >
        {#each Array(config.rows) as _, r}
          <g class="row" transform={`translate(0, ${r * rowPitch})`}>
            {#each Array(config.cols) as _, c}
              <polygon
                fill={currentPiece.color}
                class="piece"
                points={config.shape}
                transform={`translate(${c * config.w}, 0)`}
              />
            {/each}
          </g>
        {/each}
      </svg>
    {/if}
  </div>
</div>

<div class="no-select relative z-2 flex flex-col py-[70px] items-center justify-between min-h-svh text-center pointer-events-none">
  <div class="py-[20px] px-[50px] max-w-4/5 text-center bg-white border border-black drop-shadow pointer-events-none">
    Bravo tu as découvert :
    <div class="text-titre-alt inf-bold my-5 uppercase">
     {currentPiece.color_name}
    </div>
    À quelle œuvre penses-tu que<br/>cette couleur appartient ?
  </div>

  <button
    class="pointer-events-auto text-titre-alt inf-bold uppercase py-[25px] px-[30px] max-w-4/5 text-center height-auto whitespace-pre-line bg-white border border-black drop-shadow-[var(--my-drop-shadow)]"
    onclick={() => handleCC(pieceId)}
    tabindex="0"
    onkeydown={(e) => e.key === 'Enter' && handleCC(pieceId)}
  >
      VERIFIE TON HYPOTHÈSE<br/>EN APPUYANT ICI
  </button>
</div>
{:else}
<div class="flex items-center justify-center min-h-svh">
  <div class="text-center">
    <h1 class="text-2xl font-bold mb-4">Pièce non trouvée</h1>
    <p>La pièce {pieceId} n'existe pas.</p>
    <button onclick={() => goto('/start')} class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
      Retour au début
    </button>
  </div>
</div>
{/if}
