<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // Redirect to the new puzzles listing page
  onMount(() => {
    goto('/puzzles');
  });
</script>

<div class="flex items-center justify-center h-screen">
  <p>Redirection vers les puzzles...</p>
</div>