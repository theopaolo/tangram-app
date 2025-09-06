<script>
	import '../app.css';
  import TransitionOverlay from '$lib/TransitionOverlay.svelte';
	let { children } = $props();
</script>

{@render children()}
