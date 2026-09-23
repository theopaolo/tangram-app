<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { chromogramSets, normalizeId } from '$lib/chromogramStore.js';

  // Canonical (lowercased) id so printed QR URLs match the routing.
  const chromogramId = $derived(normalizeId($page.params.chromogramId));
  const set = $derived(chromogramSets[chromogramId]);

  // Map of pieceId -> QR data URL, built client-side from the real origin.
  let qrCodes = $state({});
  let origin = $state('');

  onMount(async () => {
    const QRCode = (await import('qrcode')).default;
    origin = window.location.origin;

    if (!set) return;
    const next = {};
    for (const piece of set.pieces) {
      const url = `${origin}/${chromogramId}/${piece.pieceId}`;
      next[piece.pieceId] = await QRCode.toDataURL(url, { margin: 1, width: 320 });
    }
    qrCodes = next;
  });
</script>

{#if !set}
  <div class="wrap">
    <p>Set introuvable : <code>{chromogramId}</code>. <a href="/qr">Voir les sets disponibles</a>.</p>
  </div>
{:else}
  <div class="wrap">
    <header class="no-print">
      <h1>{set.name} — QR codes</h1>
      <p>Chaque QR pointe vers <code>{origin}/{chromogramId}/&lt;pieceId&gt;</code>.</p>
      <button onclick={() => window.print()}>Imprimer</button>
    </header>

    <div class="grid">
      {#each set.pieces as piece (piece.pieceId)}
        <figure class="card">
          {#if qrCodes[piece.pieceId]}
            <img src={qrCodes[piece.pieceId]} alt={`QR pièce ${piece.pieceId}`} />
          {:else}
            <div class="placeholder">…</div>
          {/if}
          <figcaption>
            <span class="swatch" style={`background:${piece.color}`}></span>
            <strong>#{piece.pieceId}</strong>
            <span class="title">{piece.titre_artwork}</span>
          </figcaption>
        </figure>
      {/each}
    </div>
  </div>
{/if}

<style>
  .wrap { max-width: 900px; margin: 1.5rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; }
  h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
  header p { color: #555; font-size: 0.9rem; }
  button { margin-top: 0.5rem; padding: 0.5rem 1rem; cursor: pointer; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
  .card { margin: 0; text-align: center; border: 1px solid #eee; padding: 1rem; border-radius: 8px; break-inside: avoid; }
  .card img, .placeholder { width: 100%; max-width: 240px; aspect-ratio: 1; }
  .placeholder { display: grid; place-items: center; color: #bbb; }
  figcaption { margin-top: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; font-size: 0.85rem; }
  .swatch { width: 14px; height: 14px; border-radius: 50%; display: inline-block; border: 1px solid #ccc; }
  .title { color: #555; white-space: pre-line; }
  @media print {
    .no-print { display: none; }
    .card { border-color: #ddd; }
  }
</style>
