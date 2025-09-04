<script>
  import { onMount } from 'svelte';
  import { isTransitionActive, transitionDirection, endPageTransition } from './transitionStore.js';
  import { get } from 'svelte/store';

  let show = false;

  const unsub = isTransitionActive.subscribe((v) => {
    show = v;
    if (v) {
      // auto-finish after 700ms by default
      clearTimeout(timer);
      timer = setTimeout(() => {
        endPageTransition();
      }, 700);
    }
  });

  let timer;

  onMount(() => {
    return () => {
      clearTimeout(timer);
      unsub?.();
    };
  });
</script>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
  }
  .shape {
    position: absolute;
    width: 100dvh;
    height: 100dvh;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(0.02);
    transition: transform 0.6s ease-in-out, opacity 0.6s ease-in-out;
    opacity: 0;
  }
  .shape.show {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  .tile {
    position: absolute;
  }
</style>

{#if show}
  <div class="overlay">
    <div class="shape show">
      <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <polygon fill="#0b4ed1" points="10,10 50,50 90,10"/>
        <polygon fill="#1a5435" points="10,10 50,50 10,90"/>
        <polygon fill="#1b3c75" points="50,50 70,70 70,30"/>
        <polygon fill="#44a635" points="50,50 70,70 50,90 30,70"/>
        <polygon fill="#a3cfe6" points="70,30 70,70 90,50 90,10"/>
        <polygon fill="#7b77d4" points="10,90 50,90 30,70"/>
        <polygon fill="#ffe215" points="50,90 90,50 90,90"/>
      </svg>
    </div>
  </div>
{/if}
