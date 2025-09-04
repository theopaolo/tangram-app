<script>
  import { setShapesLayout } from '$lib/shapesStore.js';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

  function handlePlay(e) {
    e?.preventDefault();
    setShapesLayout('depart');
    setTimeout(() => goto('/depart'), 100);
  }

  onMount(() => {
    // Animate shapes to index layout (around content) when page loads directly
    setShapesLayout('index', { animate: true });

    gsap.fromTo('.animate-text',
      {
        opacity: 0,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out'
      }
    );
  });
</script>

<main class="container max-w-3xl min-h-svh flex flex-col p-6">

  <h1 class="mx-auto inf-bold intro-intro mt-4 scale-[1.382] text-xl text-center height-auto max-w-prose w-fit whitespace-pre-line bg-white border
  px-[14px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)] p-1">CHROMOGRAM #1</h1>

  <div class="pb-6 mt-auto flex flex-col gap-4 text-center px-2 justify-evenly">
    <p class="animate-text">CHROMOGRAM ou tangram des couleursest un jeu proposé par l'artiste Armelle Caron qui se renouvelle à chaque exposition.</p>

    <p class="animate-text">L'art est habité de mille couleurs. Subtiles, franches, opposées, brutales ou délicates.
    Elles sont partout et toujours précisément choisies par les artistes.</p>

    <p class="animate-text">Le CHROMOGRAM #1 vous propose de les trouver dans les espaces de l'exposition ALLONS, de les observer avec attention pour révéler toutes leurs nuances.Partez à la recherche des QR CODES cachés dans les salles.</p>

    <p class="animate-text">Chacun d'eux vous propose un élément du tangram et une couleur à retrouver dans les œuvres présentées et ainsi de débloquer le CHROMOGRAM.</p>

    <p class="animate-text">Il y a 7 QR CODES à  trouver dans le musée.</p>
  </div>

  <a class="text-bouton mb-4 uppercase inf-bold w-fit bg-white border py-[7px] px-[15px] tracking-[4%] drop-shadow-[var(--my-drop-shadow)] mx-auto mt-auto" href="/depart" on:click={handlePlay}>jouer</a>
</main>
