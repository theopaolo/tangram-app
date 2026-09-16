<script>
	let { data } = $props();
</script>

<h1>Tableau de bord</h1>

<div class="cards">
	<section>
		<header>
			<h2>Chromogrammes</h2>
			<a class="btn" href="/admin/chromograms/new">+ Nouveau</a>
		</header>
		<ul>
			{#each data.chromograms as set (set.id)}
				<li>
					<a href={`/admin/chromograms/${set.id}`}>{set.name || set.id}</a>
					<span class="meta">{set.pieces.length}/7 pièces</span>
				</li>
			{:else}
				<li class="empty">Aucun chromogramme.</li>
			{/each}
		</ul>
	</section>

	<section>
		<header>
			<h2>Puzzles</h2>
			<a class="btn" href="/admin/puzzles/new">+ Nouveau</a>
		</header>
		<ul>
			{#each data.puzzles as puzzle (puzzle.id)}
				<li>
					<a href={`/admin/puzzles/${puzzle.id}`}>#{puzzle.id} — {puzzle.name}</a>
					<span class="meta">{puzzle.pieces.length} pièces</span>
				</li>
			{:else}
				<li class="empty">Aucun puzzle.</li>
			{/each}
		</ul>
	</section>
</div>

<style>
	h1 {
		font-size: 1.4rem;
		margin-bottom: 1rem;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
	}
	section {
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 1rem;
	}
	section header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}
	h2 {
		font-size: 1.1rem;
		margin: 0;
	}
	.btn {
		background: #111;
		color: white;
		border-radius: 4px;
		padding: 0.3rem 0.7rem;
		font-size: 0.85rem;
		text-decoration: none;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.45rem 0;
		border-top: 1px solid #eee;
	}
	li a {
		color: #0b4ed1;
		text-decoration: none;
	}
	li a:hover {
		text-decoration: underline;
	}
	.meta {
		color: #888;
		font-size: 0.85rem;
	}
	.empty {
		color: #888;
	}
</style>
