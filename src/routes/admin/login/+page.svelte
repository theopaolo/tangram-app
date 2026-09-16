<script>
	let { form } = $props();
</script>

<div class="login-wrap">
	<form method="POST" class="login-card">
		<h1>Administration</h1>
		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}
		<label>
			Identifiant
			<input name="username" type="text" autocomplete="username" value={form?.username ?? ''} required />
		</label>
		<label>
			Mot de passe
			<input name="password" type="password" autocomplete="current-password" required />
		</label>
		<button type="submit">Se connecter</button>
	</form>
</div>

<style>
	.login-wrap {
		min-height: 100dvh;
		display: grid;
		place-items: center;
		background: #f5f5f5;
		font-family: system-ui, sans-serif;
		padding: 1rem;
	}
	.login-card {
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 2rem;
		width: 100%;
		max-width: 340px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	h1 {
		font-size: 1.25rem;
		margin: 0;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.9rem;
	}
	input {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 0.5rem;
		font-size: 1rem;
	}
	button {
		background: #111;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 0.6rem;
		font-size: 1rem;
		cursor: pointer;
	}
	.error {
		color: #c0262d;
		font-size: 0.9rem;
		margin: 0;
	}
</style>
