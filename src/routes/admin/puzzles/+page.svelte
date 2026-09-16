<script>
	let { data } = $props();
</script>

<div class="head">
	<h1>Puzzles</h1>
	<a class="btn" href="/admin/puzzles/new">+ Nouveau puzzle</a>
</div>

<p class="hint">
	Les puzzles sont globaux : chaque chromogramme choisit lesquels afficher (et dans quel ordre)
	dans son formulaire. Les figures se dessinent dans l’<a href="/editor">éditeur visuel</a>
	(bouton « Save »), puis se retouchent ici.
</p>

<table>
	<thead>
		<tr><th>Id</th><th>Nom</th><th>Description</th><th>Pièces</th><th>Échelle</th><th></th></tr>
	</thead>
	<tbody>
		{#each data.puzzles as puzzle (puzzle.id)}
			<tr>
				<td>{puzzle.id}</td>
				<td><a href={`/admin/puzzles/${puzzle.id}`}>{puzzle.name}</a></td>
				<td>{puzzle.description}</td>
				<td>{puzzle.pieces.length}</td>
				<td>{puzzle.scale ?? '—'}</td>
				<td>
					<form
						method="POST"
						action="?/delete"
						onsubmit={(e) => {
							if (!confirm(`Supprimer le puzzle #${puzzle.id} « ${puzzle.name} » ?`)) e.preventDefault();
						}}
					>
						<input type="hidden" name="id" value={puzzle.id} />
						<button type="submit" class="danger">Supprimer</button>
					</form>
				</td>
			</tr>
		{:else}
			<tr><td colspan="6" class="empty">Aucun puzzle.</td></tr>
		{/each}
	</tbody>
</table>

<style>
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}
	h1 {
		font-size: 1.4rem;
		margin: 0;
	}
	.btn {
		background: #111;
		color: white;
		border-radius: 4px;
		padding: 0.4rem 0.8rem;
		font-size: 0.9rem;
		text-decoration: none;
	}
	.hint {
		color: #777;
		font-size: 0.85rem;
		margin-bottom: 1rem;
	}
	.hint a {
		color: #0b4ed1;
	}
	table {
		width: 100%;
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		border-collapse: collapse;
		font-size: 0.92rem;
	}
	th,
	td {
		text-align: left;
		padding: 0.55rem 0.75rem;
		border-top: 1px solid #eee;
	}
	thead th {
		border-top: none;
		color: #666;
		font-weight: 600;
		font-size: 0.85rem;
	}
	td a {
		color: #0b4ed1;
		text-decoration: none;
	}
	td a:hover {
		text-decoration: underline;
	}
	.danger {
		background: transparent;
		border: 1px solid #c0262d;
		color: #c0262d;
		border-radius: 4px;
		padding: 0.25rem 0.6rem;
		font-size: 0.8rem;
		cursor: pointer;
	}
	.empty {
		color: #888;
	}
</style>
