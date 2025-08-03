<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	const PIECES_DATA = {
		1: {
			name: 'Le Grand Triangle',
			color: '#A9BCC4',
			story: 'Cette pièce représente la majestuosité de la pyramide de Khéops...',
			artwork: 'Pyramide de Khéops - Égypte Antique',
			points: '15,15 150,150 285,15' /* Large right triangle*/
		},
		2: {
			name: 'Le Triangle Moyen',
			color: '#FFF35C',
			story: 'Inspiré des voiles des navires vénitiens...',
			artwork: 'Les Marchands de Venise - Canaletto',
			points: '15,15 150,150 15,285' /* Large left triangle */
		},
		3: {
			name: 'Le Petit Triangle',
			color: '#2B3B6D',
			story: 'Cette petite forme géométrique fait écho...',
			artwork: "Livre d'Heures - Art Médiéval",
			points: '150,150 217,217 217,83' /* Small triangle (top right) */
		},
		4: {
			name: 'Le Carré',
			color: '#7AC142',
			story: "Le carré parfait représente l'équilibre...",
			artwork: 'Le Parthénon - Grèce Antique',
			points: '150,150 217,217 150,285 83,217' /* Square in center */
		},
		5: {
			name: 'Le Parallélogramme',
			color: '#6B8FD6',
			story: 'Cette oeuvre fait partie de la série...',
			artwork: 'MC Mitout. Les plus belles heures...',
			points: '217,83 217,217 285,150 285,15' /* Parallelogram (right) */
		},
		6: {
			name: 'Le Grand Trapèze',
			color: '#3B5D3A',
			story: 'Inspiré des toitures des pagodes japonaises...',
			artwork: 'Temple Kinkaku-ji - Architecture Japonaise',
			points: '15,285 150,285 83,217' /* Small triangle (bottom left) */
		},
		7: {
			name: 'Le Petit Trapèze',
			color: '#8B83D2',
			story: 'Cette dernière pièce représente les rayons...',
			artwork: 'Impression, soleil levant - Claude Monet',
			points: '150,285 285,150 285,285' /* Triangle (bottom right) */
		}
	};

	// --- STATE ---
	let hasInitialized = $state(false);
	let found = $state([]);

	// --- DERIVED STATE --- (Principle 2: DRY)
	// Let Svelte derive state from the reactive `page` store.
	let pieceId = $derived(page.params.id);
	let currentPiece = $derived(PIECES_DATA[pieceId]);
	let totalPiece = $derived(found.length);

	// --- LIFECYCLE & EFFECTS ---
	onMount(() => {
		// Re-adding try...catch per your excellent suggestion!
		try {
			const storedFound = localStorage.getItem('piece');
			if (storedFound) {
				found = storedFound.split(',').filter((id) => id);
			}
		} catch (e) {
			console.error('Could not access localStorage:', e);
		}
		hasInitialized = true;
	});

	// --- (Principle 1: Declarative State)
	// This effect describes a rule, decoupling it from the button click.
	$effect(() => {
		if (hasInitialized) {
			try {
				localStorage.setItem('piece', found.join(','));
			} catch (e) {
				console.error('Could not save to localStorage:', e);
			}
		}
	});

	// --- FUNCTIONS ---
	function capturePiece() {
		if (pieceId && !found.includes(pieceId)) {
			found.push(pieceId); // Just update the state. The effect handles the rest.
		}
	}

	// --- (Principle 3: Trust Reactivity)
	// This function only changes the source of truth (the URL).
	function navigateToPiece(id) {
		goto(`/piece/${id}`);
	}
</script>

{#if currentPiece}
	<div class="max-w-sm border p-4">
		<header>
			<h1>Chromograme #1</h1>
			<nav>ce qu'il faut faire</nav>
		</header>

		<h2 class="mb-4 text-4xl">
			{currentPiece.name}
		</h2>

		<div class="mb-4 h-80 w-full" style="background-color: {currentPiece.color};">
			<img src="" alt="" />
		</div>

		<div class="mb-4 flex flex-col gap-4">
			<p>{currentPiece.artwork}</p>
			<p>{currentPiece.story}</p>
		</div>

		<svg viewBox="0 0 300 300" width="100%" preserveAspectRatio="xMidYMid meet">
			{#each Object.entries(PIECES_DATA) as [id, piece]}
				<polygon
					points={piece.points}
					fill={piece.color}
					stroke="#fff"
					stroke-width="1"
					style="cursor: pointer;"
					onclick={() => navigateToPiece(id)}
				>
					<title>{piece.name}</title>
				</polygon>
			{/each}
		</svg>

		<div class="mx-auto flex flex-col gap-2 border-t border-gray-600 pt-8 text-center">
			<div class="mb-2 flex justify-center gap-4 align-middle">
				{#each Object.entries(PIECES_DATA) as [id, data]}
					<span
						class="rounded-full px-2 py-2"
						style="background-color: {found.includes(id) ? data.color : '#DDD'}"
						title={data.name}
					></span>
				{/each}
			</div>

			<button class="cursor-pointer border" onclick={capturePiece}>Captuer la piece </button>

			<p>id: {pieceId} found: {found.join(', ')} total: {totalPiece}</p>
			<p class="text-xs">Tu as déjà trouvé {totalPiece} couleurs sur 7 !</p>
		</div>
	</div>
{/if}
