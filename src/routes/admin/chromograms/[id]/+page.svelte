<script>
	import { page } from '$app/state';
	let { data, form } = $props();

	const PIECE_IDS = [1, 2, 3, 4, 5, 6, 7];
	const pieceFor = (pieceId) => data.set.pieces.find((p) => Number(p.pieceId) === pieceId);
	const saved = $derived(page.url.searchParams.get('saved') === '1');
</script>

<div class="head">
	<h1>{data.isNew ? 'Nouveau chromogramme' : `Chromogramme — ${data.set.name || data.set.id}`}</h1>
	<a href="/admin/chromograms">← Retour à la liste</a>
</div>

{#if saved}
	<p class="notice ok">Modifications enregistrées.</p>
{/if}
{#if form?.error}
	<p class="notice error">{form.error}</p>
{/if}

<form method="POST" action="?/save" enctype="multipart/form-data">
	<section>
		<h2>Général</h2>
		{#if data.isNew}
			<label>
				Id (slug utilisé dans l’URL et les QR codes, ex. <code>chromogram-2</code>)
				<input name="id" required pattern="[a-zA-Z0-9_-]+" />
			</label>
		{/if}
		<label>
			Nom (interne)
			<input name="name" value={data.set.name} />
		</label>
		<label>
			Titre (affiché)
			<input name="title" value={data.set.title} />
		</label>
		<label>
			Texte d’introduction
			<textarea name="intro" rows="6">{data.set.intro}</textarea>
		</label>
		<label>
			Puzzles de ce set — ids séparés par des virgules, dans l’ordre d’affichage.
			Laisser vide pour afficher tous les puzzles.
			<input name="puzzles" value={data.set.puzzles.join(', ')} placeholder="ex. 8, 3, 2" />
		</label>
		<p class="hint">
			Puzzles disponibles :
			{#each data.allPuzzles as p, i (p.id)}{i > 0 ? ' · ' : ''}<code>{p.id}</code> {p.name}{/each}
		</p>
	</section>

	{#each PIECE_IDS as pieceId (pieceId)}
		{@const piece = pieceFor(pieceId)}
		{@const p = piece ?? { color: '', color_name: '', rvb: '', cmjn: '', titre_artwork: '', artiste: '', date: '', story: '', dapres_toi: '', dapres: [], images: [] }}
		<section>
			<h2>
				<label class="enable">
					<input type="checkbox" name={`piece_${pieceId}_enabled`} checked={Boolean(piece)} />
					Pièce {pieceId}
				</label>
				{#if p.color}<span class="swatch" style={`background:${p.color}`}></span>{/if}
			</h2>
			<div class="grid">
				<label>
					Couleur (hex)
					<input name={`piece_${pieceId}_color`} value={p.color} placeholder="#1a5435" />
				</label>
				<label>
					Nom de la couleur
					<input name={`piece_${pieceId}_color_name`} value={p.color_name} />
				</label>
				<label>
					RVB
					<input name={`piece_${pieceId}_rvb`} value={p.rvb} placeholder="26, 84, 53" />
				</label>
				<label>
					CMJN
					<input name={`piece_${pieceId}_cmjn`} value={p.cmjn} placeholder="95, 37, 91, 38" />
				</label>
				<label>
					Titre de l’œuvre
					<input name={`piece_${pieceId}_titre_artwork`} value={p.titre_artwork} />
				</label>
				<label>
					Artiste
					<input name={`piece_${pieceId}_artiste`} value={p.artiste} />
				</label>
				<label>
					Date
					<input name={`piece_${pieceId}_date`} value={p.date} />
				</label>
			</div>
			<label>
				Histoire
				<textarea name={`piece_${pieceId}_story`} rows="4">{p.story}</textarea>
			</label>
			<div class="grid">
				<label>
					Question « D’après toi… »
					<input name={`piece_${pieceId}_dapres_toi`} value={p.dapres_toi} />
				</label>
				<label>
					Réponses proposées (une par ligne)
					<textarea name={`piece_${pieceId}_dapres`} rows="3">{p.dapres.join('\n')}</textarea>
				</label>
			</div>

			<h3>Images</h3>
			{#each [...p.images, { src: '', credits: '' }] as image, j (j)}
				<div class="image-row">
					{#if image.src}
						<img src={image.src} alt="" />
					{/if}
					<label>
						URL de l’image {j === p.images.length ? '(nouvelle — laisser vide si aucune)' : '(vider pour supprimer)'}
						<input name={`piece_${pieceId}_image_${j}_src`} value={image.src} />
					</label>
					<label>
						Crédits
						<input name={`piece_${pieceId}_image_${j}_credits`} value={image.credits} />
					</label>
					<label>
						Téléverser un fichier (remplace l’URL)
						<input type="file" accept="image/*" name={`piece_${pieceId}_image_${j}_file`} />
					</label>
				</div>
			{/each}
		</section>
	{/each}

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
		margin-bottom: 1rem;
	}
	h2 {
		font-size: 1.05rem;
		margin: 0 0 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	h3 {
		font-size: 0.95rem;
		margin: 1rem 0 0.5rem;
	}
	.enable {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}
	.swatch {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 1px solid #ccc;
		display: inline-block;
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
	input,
	textarea {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 0.45rem;
		font-size: 0.95rem;
		font-family: inherit;
		color: #111;
	}
	.hint {
		color: #777;
		font-size: 0.82rem;
		margin: 0;
	}
	.image-row {
		display: grid;
		grid-template-columns: auto 2fr 2fr 1.5fr;
		gap: 0.75rem;
		align-items: end;
		border-top: 1px dashed #eee;
		padding-top: 0.75rem;
	}
	.image-row img {
		width: 72px;
		height: 72px;
		object-fit: cover;
		border-radius: 4px;
		border: 1px solid #ddd;
	}
	.actions {
		position: sticky;
		bottom: 0;
		background: linear-gradient(transparent, #f5f5f5 30%);
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
	@media (max-width: 700px) {
		.image-row {
			grid-template-columns: 1fr;
		}
	}
</style>
