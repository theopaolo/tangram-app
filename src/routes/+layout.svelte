<script>
	import '../app.css';
	import { page } from '$app/state';
	import { initContent } from '$lib/puzzleData.js';
	let { children, data } = $props();
	// Populate the content stores before any child renders (SSR + hydration).
	initContent(data);

	// Re-populate when the layout data is invalidated (e.g. after the editor
	// saves a puzzle) — the init call above only runs at component creation.
	$effect.pre(() => {
		initContent(data);
	});

	// The "mobile only" overlay must not cover the desktop back-office tools.
	const isBackOffice = $derived(
		['/admin', '/editor', '/qr'].some((p) => page.url.pathname.startsWith(p))
	);
</script>

{@render children()}

{#if !isBackOffice}
<div class="top-0 left-0 hidden md:block landscape:block z-10000000 h-[100%] w-[100%] fixed text-corps">
	<img style="height:100%; width:100%;object-fit:cover" src="/images/no-ent.jpg">
	<div class="absolute top-7 right-7 text-right flex flex-col items-end gap-3">
		<div class=" w-[300px]">
			<img style="" src="/images/logo_2.png">
		</div>
		
		<div class="flex flex-row w-full gap-3 justify-end mr-4">
			<div class="">Nous sommes désolés,<br/>mais la plateforme n’est<br/>accessible qu’à partir d’un<br/>mobile en version portrait.</div>
			<div class="">
			<img class="w-auto" src="/images/mobile.png">
			</div>
		</div>
	</div>
</div>
{/if}