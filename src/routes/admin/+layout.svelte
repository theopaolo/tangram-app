<script>
	import { page } from '$app/state';
	let { children, data } = $props();
	const isLogin = $derived(page.url.pathname.startsWith('/admin/login'));
</script>

<div class="admin">
	{#if !isLogin}
		<header>
			<nav>
				<a href="/admin" class:active={page.url.pathname === '/admin'}>Tableau de bord</a>
				<a href="/admin/chromograms" class:active={page.url.pathname.startsWith('/admin/chromograms')}>Chromogrammes</a>
				<a href="/admin/puzzles" class:active={page.url.pathname.startsWith('/admin/puzzles')}>Puzzles</a>
				<a href="/editor">Éditeur visuel</a>
				<a href="/qr">QR codes</a>
			</nav>
			<form method="POST" action="/admin/logout">
				<span class="user">{data.user?.username}</span>
				<button type="submit">Déconnexion</button>
			</form>
		</header>
	{/if}
	<main>
		{@render children()}
	</main>
</div>

<style>
	.admin {
		min-height: 100dvh;
		background: #f5f5f5;
		font-family: system-ui, sans-serif;
		color: #111;
	}
	header {
		background: #111;
		color: white;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.6rem 1rem;
		flex-wrap: wrap;
	}
	nav {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}
	nav a {
		color: #bbb;
		text-decoration: none;
		font-size: 0.9rem;
	}
	nav a:hover,
	nav a.active {
		color: white;
	}
	header form {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.user {
		font-size: 0.85rem;
		color: #bbb;
	}
	header button {
		background: transparent;
		border: 1px solid #555;
		color: white;
		border-radius: 4px;
		padding: 0.3rem 0.7rem;
		font-size: 0.85rem;
		cursor: pointer;
	}
	main {
		max-width: 1000px;
		margin: 0 auto;
		padding: 1.5rem 1rem 4rem;
	}
</style>
