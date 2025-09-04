<script>
	import '../app.css';
  import TransitionOverlay from '$lib/TransitionOverlay.svelte';
  import Shapes from '$lib/Shapes.svelte';

	let { children } = $props();
</script>

<TransitionOverlay />
<Shapes />
{@render children()}
