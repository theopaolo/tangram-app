<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import Breadcrumb from '$lib/Breadcrumb.svelte';

    /** @type {string[]} */
    let found = $state([]);

    onMount(() => {
        found = localStorage.getItem('found')?.split(',').filter(Boolean)  || [];
        console.log(found);
    });

    // Breadcrumb configuration
    const breadcrumbItems = [
        { label: 'Accueil', href: '/' },
        { label: 'Les Couleurs', current: true },
        { label: 'Les Tangrams', disabled: true }
    ];
</script>

<div class="whole px-[20px] h-screen flex flex-col items-center justify-evenly py-[70px] text-corps text-center">

    <div class="text-title inf-bold fixed left-[20px] top-[20px] margin-auto w-fit bg-white border py-1 px-[14px] drop-shadow-(--my-drop-shadow) tracking-[4%]">
        CHROMOGRAM #1
    </div>

    <div class="py-[30px]">
        Pars à la recherche des 7 formes du Tangram pour débloquer le CHROMOGRAM !
    </div>

    <div class="px-[30px] w-full">
        <img src="square.png" alt="square">
        <div class="text-mini text-right">{found.length} / 7</div>
    </div>

    <a class="py-[30px]" href="/scanner">
        <img src="/images/camera.svg" alt="camera icon">
    </a>

    <Breadcrumb items={breadcrumbItems} />
</div>