<script>
	import '../app.css';
	let { children } = $props();
</script>

{@render children()}

<div class="hidden md:block landscape:block z-10000 h-[100%] w-[100%] fixed text-title">
	<img style="height:100%; width:100%;object-fit:cover" src="/images/no-ent.jpg">
	<div class="absolute top-20 right-1/12 text-right w-[400px] flex flex-col items-end gap-7">
		<div class="">
			<img style="" src="/images/logo_2.png">
		</div>
		Nous sommes désolés,<br/>mais la plateforme n’est<br/>accessible qu’à partir d’un<br/>mobile en version portrait.
		<div class="w-[85px]">
			<img class="" src="/images/mobile.png">
		</div>
	</div>
</div>