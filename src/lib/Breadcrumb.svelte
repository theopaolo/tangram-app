<script>
  import CreditsContent from '$lib/CreditsContent.svelte';
  import { isCreditsOpen } from '$lib/stores/creditsStore.js';

  let { items = [] } = $props();
</script>

<div class="flex w-full items-center justify-between text-mini">
  <div class="tracking-[5%]">
    {#each items as item, index}
      {#if index > 0}
        <span class="separator"> > </span>
      {/if}

      {#if item.href}
        <a
          href={item.href}
          class="breadcrumb-item"
          class:current={item.current}
          class:desactivate={item.disabled}
        >
          {item.label}
        </a>
      {:else}
        <span
          class="breadcrumb-item"
          class:current={item.current}
          class:desactivate={item.disabled}
        >
          {item.label}
        </span>
      {/if}
    {/each}
  </div>
 <button onclick={() => isCreditsOpen.open()} class="bg-transparent border-none cursor-pointer">Crédits</button>
</div>

<CreditsContent />

<style>
  .breadcrumb-item {
    color: inherit;
    text-decoration: none;
  }

  .breadcrumb-item:hover, a:hover {
    color: inherit;
  }
</style>
