<script>
	import { page } from '$app/state';
	let { data, form } = $props();

	const layoutJson = JSON.stringify(
		{ container: data.puzzle.container, pieces: data.puzzle.pieces },
		null,
		2
	);
	const saved = $derived(page.url.searchParams.get('saved') === '1');
</script>

<div class="head">
	<h1>{data.isNew ? 'Nouveau puzzle' : `Puzzle #${data.puzzle.id} — ${data.puzzle.name}`}</h1>
	<a href="/admin/puzzles">← Retour à la liste</a>
</div>

{#if saved}
	<p class="notice ok">Modifications enregistrées.</p>
{/if}
{#if form?.error}
	<p class="notice error">{form.error}</p>
{/if}

<form method="POST" action="?/save">
	<section>
		<div class="grid">
			<label>
				Nom
				<input name="name" value={data.puzzle.name} required />
			</label>
			<label>
				Description
				<input name="description" value={data.puzzle.description} />
			</label>
			<label>
				Échelle (optionnelle, ex. 0.8 — vide = automatique)
				<input name="scale" value={data.puzzle.scale ?? ''} inputmode="decimal" />
			</label>
			<label class="check">
				<input type="checkbox" name="completed" checked={data.puzzle.completed} />
				Marqué comme complété
			</label>
		</div>
		<label>
			Layout — JSON <code>{'{ container, pieces }'}</code> produit par le bouton
			« Export » de l’<a href="/editor">éditeur visuel</a>
			<textarea name="layout" rows="18" required>{layoutJson}</textarea>
		</label>
	</section>
	<div class="actions">
		<button type="submit">Enregistrer</button>
	</div>
</form>

<style>
	.head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	h1 {
		font-size: 1.4rem;
		margin: 0;
	}
	.head a {
		color: #0b4ed1;
		text-decoration: none;
		font-size: 0.9rem;
	}
	.notice {
		border-radius: 6px;
		padding: 0.6rem 0.9rem;
		font-size: 0.9rem;
	}
	.notice.ok {
		background: #e6f4ea;
		color: #1a5435;
	}
	.notice.error {
		background: #fdecea;
		color: #c0262d;
	}
	section {
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 1rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 0.75rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;
		color: #444;
		margin-bottom: 0.75rem;
	}
	label a {
		color: #0b4ed1;
	}
	.check {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}
	input,
	textarea {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 0.45rem;
		font-size: 0.95rem;
		color: #111;
	}
	textarea {
		font-family: ui-monospace, monospace;
		font-size: 0.85rem;
	}
	.actions {
		padding: 1rem 0;
	}
	button {
		background: #111;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 0.7rem 1.6rem;
		font-size: 1rem;
		cursor: pointer;
	}
</style>
