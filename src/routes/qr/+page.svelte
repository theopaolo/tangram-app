<script>
  import { chromogramSets, normalizeId } from '$lib/chromogramStore.js';

  const sets = Object.values(chromogramSets);
</script>

<div class="wrap">
  <h1>QR codes — Chromogrammes</h1>
  <p>Choisis un set pour afficher et imprimer ses 7 QR codes.</p>
  <ul>
    {#each sets as set (set.id)}
      <li><a href={`/qr/${normalizeId(set.id)}`}>{set.name} <span class="id">({normalizeId(set.id)})</span></a></li>
    {/each}
  </ul>
</div>

<style>
  .wrap { max-width: 640px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; }
  h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
  ul { margin-top: 1rem; padding-left: 1rem; }
  li { margin: 0.4rem 0; }
  a { color: #0b4ed1; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .id { color: #888; font-size: 0.85em; }
</style>
