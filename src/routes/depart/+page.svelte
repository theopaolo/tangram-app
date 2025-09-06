<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import Breadcrumb from '$lib/Breadcrumb.svelte';
    import { setShapesLayout } from '$lib/shapesStore.js';
    import { piecesStore } from '$lib/piecesStore.js';

    let showStaticTangram = $state(false);

    // Tangram pieces data with original colors
    const PIECES_DATA = {
        1: { color: '#A9BCC4' }, // Le Grand Triangle
        2: { color: '#FFF35C' }, // Le Triangle Moyen
        3: { color: '#2B3B6D' }, // Le Petit Triangle
        4: { color: '#7AC142' }, // Le Carré
        5: { color: '#6B8FD6' }, // Le Parallélogramme
        6: { color: '#3B5D3A' }, // Le Grand Trapèze
        7: { color: '#8B83D2' }  // Le Petit Trapèze
    };

    // Function to get piece color (original if found, green if not)
    function getPieceColor(pieceId) {
        return piecesStore.hasPiece(pieceId.toString()) ? PIECES_DATA[pieceId].color : '#7AC142';
    }

    onMount(() => {
        // Initialize pieces store
        piecesStore.initialize();
        console.log(piecesStore.pieces);

        // Ensure shapes are set to depart layout (for animation continuity)
        setShapesLayout('depart', { animate: false });

        // Wait 600ms for animation to complete before showing static tangram
        setTimeout(() => {
            showStaticTangram = true;
        }, 600);
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

    <div class="px-[30px] w-full tangram-container ">
        {#if showStaticTangram}
        <svg viewBox="0 0 300 300" class="w-full h-auto max-w-[300px] mx-auto -rotate-90">
            <polygon points="15,15 150,150 285,15" fill={getPieceColor(1)} stroke="#fff" stroke-width="1" />
            <polygon points="15,15 150,150 15,285" fill={getPieceColor(2)} stroke="#fff" stroke-width="1" />
            <polygon points="150,150 217,217 217,83" fill={getPieceColor(3)} stroke="#fff" stroke-width="1" />
            <polygon points="150,150 217,217 150,285 83,217" fill={getPieceColor(4)} stroke="#fff" stroke-width="1" />
            <polygon points="217,83 217,217 285,150 285,15" fill={getPieceColor(5)} stroke="#fff" stroke-width="1" />
            <polygon points="15,285 150,285 83,217" fill={getPieceColor(6)} stroke="#fff" stroke-width="1" />
            <polygon points="150,285 285,150 285,285" fill={getPieceColor(7)} stroke="#fff" stroke-width="1" />
        </svg>
        {/if}
        <div class="text-mini text-right">{found.length} / 7</div>
    </div>

    <a class="py-[30px]" href="/scanner">
        <img src="/images/camera.svg" alt="camera icon">
    </a>

    <Breadcrumb items={breadcrumbItems} />
</div>