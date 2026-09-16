<script>
	let { data } = $props();
</script>

<div class="head">
	<h1>Chromogrammes</h1>
	<a class="btn" href="/admin/chromograms/new">+ Nouveau chromogramme</a>
</div>

<table>
	<thead>
		<tr><th>Id</th><th>Nom</th><th>Titre</th><th>Pièces</th><th>Puzzles</th><th></th></tr>
	</thead>
	<tbody>
		{#each data.chromograms as set (set.id)}
			<tr>
				<td><code>{set.id}</code></td>
				<td><a href={`/admin/chromograms/${set.id}`}>{set.name || set.id}</a></td>
				<td>{set.title}</td>
				<td>{set.pieces.length}/7</td>
				<td>{set.puzzles.length ? set.puzzles.join(', ') : 'tous'}</td>
				<td>
					<form
						method="POST"
						action="?/delete"
						onsubmit={(e) => {
							if (!confirm(`Supprimer le chromogramme « ${set.name || set.id} » ?`)) e.preventDefault();
						}}
					>
						<input type="hidden" name="id" value={set.id} />
						<button type="submit" class="danger">Supprimer</button>
					</form>
				</td>
			</tr>
		{:else}
			<tr><td colspan="6" class="empty">Aucun chromogramme.</td></tr>
		{/each}
	</tbody>
</table>

<style>
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
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
