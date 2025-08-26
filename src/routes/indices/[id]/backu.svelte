<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	// 👇 AJOUTE ÇA
	let gsap;
	let gsapReady;        // promesse de chargement
	let circleEl;         // ref du cercle

let active = $state(0);
	  const labels = ["L'oeuvre", "D’après toi...", "La Couleur"];

	const offset = 90;    // valeur en px à laisser au-dessus (navbar, marge…)
  	const duration = 800;      // durée de scroll en ms

	// Scroll vers une section donnée

  function smoothScrollTo(to, duration = 800) {
    const start = window.scrollY;
    const change = to - start;
    const startTime = performance.now();
    function easeInOutQuad(t) { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start + change * easeInOutQuad(progress));
      if (elapsed < duration) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function scrollToSection(i) {
    const target = document.getElementById(section-${i});
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    smoothScrollTo(top, duration);
  }

function handleClick(i) {
  active = i;         // maintenant réactif
  scrollToSection(i);
}

	onMount(() => {
		// import dynamique côté client uniquement
		gsapReady = import('gsap').then((m) => {
		gsap = m.gsap ?? m.default ?? m;
		});
	});

	async function expand() {
		if (!gsap) await gsapReady;
		if (!circleEl) return;
		gsap.to(circleEl, { scale: 9, duration: 3, ease: 'power3.out' });
	}

	async function shrink() {
		if (!gsap) await gsapReady;
		if (!circleEl) return;
		gsap.to(circleEl, { scale: 1, duration: 4, ease: 'elastic.out(1, 0.3)' });
	}

	
	const PIECES_DATA = {
		1: {  
			color: '#A9BCC4',
			rvb: '85, 180, 16',
			cmjn: '68, 0, 100, 0',
			color_name: 'Le Grand Triangle',
			titre_artwork: 'Pyramide de Khéops - Égypte Antique',
			artiste:'MC Mitout',
			date:'Juilet 2016',
			story: 'Cette pièce représente la majestuosité de la pyramide de Khéops...Cette pièce représente la majestuosité de la pyramide de Khéops...Cette pièce représente la majestuosité de la pyramide de Khéops...',
			dapres: [
				'«Allons enfants de la patrie» ',
				'«Allons» ramasser des petits pois',
				'«Allons voir si la rose...» '
			],
			/* images: [
				'images/parallelogramme-1.jpg',
				'images/parallelogramme-2.jpg',
				'images/parallelogramme-3.jpg'
			] */
			points: '15,15 150,150 285,15', /* Large right triangle*/
		},
		2: {	
			color: '#FFF35C',
			rvb: '85, 180, 16',
			cmjn: '68, 0, 100, 0',
			color_name: 'Le Triangle Moyen',
			titre_artwork: 'Pyramide de Khéops - Égypte Antique',
			artiste:'MC Mitout',
			date:'Juilet 2016',
			story: 'Cette pièce représente la majestuosité de la pyramide de Khéops...Cette pièce représente la majestuosité de la pyramide de Khéops...Cette pièce représente la majestuosité de la pyramide de Khéops...',
			dapres: [
				'«Allons enfants de la patrie» ',
				'«Allons» ramasser des petits pois',
				'«Allons voir si la rose...» '
			],
			/* images: [
				'images/parallelogramme-1.jpg',
				'images/parallelogramme-2.jpg',
				'images/parallelogramme-3.jpg'
			] */			
			points: '15,15 150,150 15,285' /* Large left triangle */		
		},
		3: { 	
			color: '#2B3B6D',
			rvb: '85, 180, 16',
			cmjn: '68, 0, 100, 0',
			color_name: 'Le Petit Triangle',
			titre_artwork: 'Pyramide de Khéops - Égypte Antique',
			artiste:'MC Mitout',
			date:'Juilet 2016',
			story: 'Cette pièce représente la majestuosité de la pyramide de Khéops...Cette pièce représente la majestuosité de la pyramide de Khéops...Cette pièce représente la majestuosité de la pyramide de Khéops...',
			dapres: [
				'«Allons enfants de la patrie» ',
				'«Allons» ramasser des petits pois',
				'«Allons voir si la rose...» '
			],
			/* images: [
				'images/parallelogramme-1.jpg',
				'images/parallelogramme-2.jpg',
				'images/parallelogramme-3.jpg'
			] */
			points: '150,150 217,217 217,83' /* Small triangle (top right) */
		},
		4: {
			color: '#7AC142',
			rvb: '85, 180, 16',
			cmjn: '68, 0, 100, 0',
			color_name: 'Le Carré',
			titre_artwork: 'Pyramide de Khéops - Égypte Antique',
			artiste:'MC Mitout',
			date:'Juilet 2016',
			story: 'Cette pièce représente la majestuosité de la pyramide de Khéops...Cette pièce représente la majestuosité de la pyramide de Khéops...Cette pièce représente la majestuosité de la pyramide de Khéops...',
			dapres: [
				'«Allons enfants de la patrie» ',
				'«Allons» ramasser des petits pois',
				'«Allons voir si la rose...» '
			],
			/* images: [
				'images/parallelogramme-1.jpg',
				'images/parallelogramme-2.jpg',
				'images/parallelogramme-3.jpg'
			] */
			points: '150,150 217,217 150,285 83,217' /* Square in center */			
		},
		5: { 
			color: '#6B8FD6',
			rvb: '85, 180, 16',
			cmjn: '68, 0, 100, 0',
			color_name: 'Le Parallélogramme',
			titre_artwork: 'Pyramide de Khéops - Égypte Antique',
			artiste:'MC Mitout',
			date:'Juilet 2016',
			story: 'Cette pièce représente la majestuosité de la pyramide de Khéops...Cette pièce représente la majestuosité de la pyramide de Khéops...Cette pièce représente la majestuosité de la pyramide de Khéops...',
			dapres: [
				'«Allons enfants de la patrie» ',
				'«Allons» ramasser des petits pois',
				'«Allons voir si la rose...» '
			],
			/* images: [
				'images/parallelogramme-1.jpg',
				'images/parallelogramme-2.jpg',
				'images/parallelogramme-3.jpg'
			] */
			points: '217,83 217,217 285,150 285,15' /* Parallelogram (right) */			
		},
		6: {
			color: '#3B5D3A',
			rvb: '85, 180, 16',
			cmjn: '68, 0, 100, 0',
			color_name: 'Le Grand Trapèze',
			titre_artwork: 'Pyramide de Khéops - Égypte Antique',
			artiste:'MC Mitout',
			date:'Juilet 2016',
			story: 'Cette pièce représente la majestuosité de la pyramide de Khéops...Cette pièce représente la majestuosité de la pyramide de Khéops...Cette pièce représente la majestuosité de la pyramide de Khéops...',
			dapres: [
				'«Allons enfants de la patrie» ',
				'«Allons» ramasser des petits pois',
				'«Allons voir si la rose...» '
			],
			/* images: [
				'images/parallelogramme-1.jpg',
				'images/parallelogramme-2.jpg',
				'images/parallelogramme-3.jpg'
			] */
			points: '15,285 150,285 83,217' /* Small triangle (bottom left) */
			
		},
		7: {
			color: '#8B83D2',
			rvb: '85, 180, 16',
			cmjn: '68, 0, 100, 0',
			color_name: 'Le Petit Trapèze',
			titre_artwork: 'Pyramide de Khéops - Égypte Antique',
			artiste:'MC Mitout',
			date:'Juilet 2016',
			story: 'Cette pièce représente la majestuosité de la pyramide de Khéops...Cette pièce représente la majestuosité de la pyramide de Khéops...Cette pièce représente la majestuosité de la pyramide de Khéops...',
			dapres: [
				'«Allons enfants de la patrie» ',
				'«Allons» ramasser des petits pois',
				'«Allons voir si la rose...» '
			],
			/* images: [
				'images/parallelogramme-1.jpg',
				'images/parallelogramme-2.jpg',
				'images/parallelogramme-3.jpg'
			] */
			points: '150,285 285,150 285,285' /* Triangle (bottom right) */			
		}
	};

	// --- STATE ---
	let hasInitialized = $state(false);
	let found = $state([]);

	// --- DERIVED STATE --- (Principle 2: DRY)
	// Let Svelte derive state from the reactive page store.
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
		goto(/indices/${id});
	}

// ******** SELECTION
	// 1) state réactif
	let selected = $state(new Set());

	function toggle(i) {
		// recréer un Set pour déclencher la réactivité (même en $state)
		const s = new Set(selected);
		s.has(i) ? s.delete(i) : s.add(i);
		selected = s;
	}
	// 2) reset quand on change de pièce
	$effect(() => {
		// l’effet se relance quand pieceId change (car on le lit ici)
		pieceId;
		selected = new Set();
	});

	 // sélection unique : 0 = "Bah oui !", 1 = "Et nan…", null = rien
	let selectedAnswer = $state(null);

	function toggleAnswer(i) {
		selectedAnswer = (selectedAnswer === i) ? null : i;
	}

	// reset quand on change de pièce
	$effect(() => {
		pieceId;           // lit la valeur pour réactivité
		selectedAnswer = null;
	});
	// ******** SELECTION

</script>

{#if currentPiece}
	<div class="max-w-sm border p-5 pt-0" id="section-0">

		<header class="flex flex-row fixed z-10 bg-white top-0 pt-[30px] w-[100%]">
  			{#each labels as label, i}
				<button
				type="button"
				on:click={() => handleClick(i)}
				class="mb-[5px] mr-[20px] w-max text-11 w-fit tracking-[4%] border py-1 px-[11px] transition-colors"
				class:bg-black={active === i}
				class:bg-white={active !== i}
				class:text-white={active === i}
				class:text-black={active !== i}
				class:border-black={active === i}
				>
				{label}
				</button>
			{/each}
		<!-- <nav>ce qu'il faut faire</nav> -->
		</header>

		<div class="mt-[100px] mb-4 h-80 w-full pt-[30px]" style="background-color: {currentPiece.color}; ">
			<img src="" alt="" />
		</div>

		<div class="flex flex-col">
			<h2 class="text-titre-alt uppercase">{currentPiece.titre_artwork}</h2>
			<p>{currentPiece.artiste} - {currentPiece.date}</p>
			<p class="mt-3">{currentPiece.story}</p>
		</div>

		<div class="mt-6 mb-15">
			<span class="text-titre-alt inf-bold">Tu avais trouvé cette oeuvre ?</span><br/>

			<!-- Option: Bah oui ! -->
			<div
				class="flex items-center space-x-2 cursor-pointer w-max select-none touch-none"
				class:selected={selectedAnswer === 0}
				on:click={() => toggleAnswer(0)}
			>
				<svg width="11" height="6" viewBox="0 0 11 6" class="shrink-0" fill="black">
					<path d="M11 3 6 .113v5.774L11 3ZM0 3v.5h6.5V3H0Zm0-1v.5h6.5V2H0Z"/>
				</svg>

				<span class:underline={selectedAnswer === 0}>Bah oui !</span>

				{#if selectedAnswer === 0}
				<svg width="15" height="15" viewBox="0 0 15 15" fill={currentPiece.color} class="shrink-0">
					<path d="M13.025 2.88117c-.3193-.31937-.6983-.57272-1.1155-.74557C11.4924 1.96275 11.0453 1.87378 10.5937 1.87378c-.4516 0-.89868.08897-1.31585.26182-.41716.17285-.79617.4262-1.1154.74557l-.6625.6625-.6625-.6625C6.19264 2.23636 5.3181 1.87411 4.4062 1.87411s-1.78644.36225-2.43125 1.00706C1.33014 3.52598.967896 4.40052.967896 5.31242c0 .9119.362244 1.78644 1.007054 2.43125l5.525 5.525 5.525-5.525c.3193-.31922.5727-.69824.7455-1.1154.1729-.41717.2618-.8643.2618-1.31585 0-.45155-.0889-.89869-.2618-1.31585-.1728-.41716-.4262-.79618-.7455-1.1154Z"/>
				</svg>
				{/if}
			</div>

			<!-- Option: Et nan… -->
			<div
				class="flex items-center space-x-2 cursor-pointer w-max select-none touch-none"
				class:selected={selectedAnswer === 1}
				on:click={() => toggleAnswer(1)}
			>
				<svg width="11" height="6" viewBox="0 0 11 6" class="shrink-0" fill="black">
					<path d="M11 3 6 .113v5.774L11 3ZM0 3v.5h6.5V3H0Zm0-1v.5h6.5V2H0Z"/>
				</svg>

				<span class:underline={selectedAnswer === 1}>Et nan…</span>

				{#if selectedAnswer === 1}
				<svg width="15" height="15" viewBox="0 0 15 15" fill={currentPiece.color} class="shrink-0">
					<path d="M13.025 2.88117c-.3193-.31937-.6983-.57272-1.1155-.74557C11.4924 1.96275 11.0453 1.87378 10.5937 1.87378c-.4516 0-.89868.08897-1.31585.26182-.41716.17285-.79617.4262-1.1154.74557l-.6625.6625-.6625-.6625C6.19264 2.23636 5.3181 1.87411 4.4062 1.87411s-1.78644.36225-2.43125 1.00706C1.33014 3.52598.967896 4.40052.967896 5.31242c0 .9119.362244 1.78644 1.007054 2.43125l5.525 5.525 5.525-5.525c.3193-.31922.5727-.69824.7455-1.1154.1729-.41717.2618-.8643.2618-1.31585 0-.45155-.0889-.89869-.2618-1.31585-.1728-.41716-.4262-.79618-.7455-1.1154Z"/>
				</svg>
				{/if}
			</div>
		</div>

		
		<div class="bg-black text-white px-5 py-6 relative mb-15" id="section-1">
			<img src="/images/fleche_dapres.svg" alt="indic" class="!w-[105px] h-auto absolute right-5 top-3" />
			<div class="text-titre-alt inf-bold mb-4">D'après toi,</div>

			{#if Array.isArray(currentPiece?.dapres) && currentPiece.dapres.length}
				{#each currentPiece.dapres as line, i (i)}  <!-- 3) key (i) -->
				<div
					class="flex items-center cursor-pointer gap-2 select-none touch-none"
					class:selected={selected.has(i)}
					on:click={() => toggle(i)}
				>
					<svg width="8" height="8" viewBox="0 0 8 8" fill="white">
						<rect x="4" width="5" height="5" transform="rotate(45 4 0)" />
					</svg>

					<span class:underline={selected.has(i)}>{line}</span>

					{#if selected.has(i)}
					<svg width="15" height="15" viewBox="0 0 15 15" fill={currentPiece.color} class="shrink-0">
						<path d="M13.025 2.88117c-.3193-.31937-.6983-.57272-1.1155-.74557C11.4924 1.96275 11.0453 1.87378 10.5937 1.87378c-.4516 0-.89868.08897-1.31585.26182-.41716.17285-.79617.4262-1.1154.74557l-.6625.6625-.6625-.6625C6.19264 2.23636 5.3181 1.87411 4.4062 1.87411s-1.78644.36225-2.43125 1.00706C1.33014 3.52598.967896 4.40052.967896 5.31242c0 .9119.362244 1.78644 1.007054 2.43125l5.525 5.525 5.525-5.525c.3193-.31922.5727-.69824.7455-1.1154.1729-.41717.2618-.8643.2618-1.31585 0-.45155-.0889-.89869-.2618-1.31585-.1728-.41716-.4262-.79618-.7455-1.1154Z"/>
					</svg>
					{/if}
				</div>
				{/each}
			{/if}
		</div>

		<div
		id="section-2"
		class="conta border px-5 py-4 relative overflow-hidden"
		on:pointerdown|preventDefault={expand}
		on:pointerup={shrink}
		on:pointerleave={shrink}
		on:pointercancel={shrink}
		>
		<div class="titre relative z-[1] text-titre-alt inf-bold mb-5 uppercase">
			{currentPiece?.color_name}
		</div>

		<div class="content flex flex-row h-full gap-5 items-center">
			<div
			bind:this={circleEl}
			class="circle relative z-0 w-20 h-20 rounded-full scale-100 origin-center select-none touch-none"
			style="background-color: {currentPiece?.color};"
			/>
			<div class="infos relative z-[1]">
			<span class="inf-bold">hexadécimale</span> : {currentPiece?.color}<br /><br />
			<span class="inf-bold">rvb</span> : {currentPiece?.rvb}<br /><br />
			<span class="inf-bold">cmjn</span> : {currentPiece?.cmjn}
			</div>
		</div>
		</div>

		<div class="mt-17 mb-10 w-2/3 h-px bg-black m-auto"></div>

		<div class="flex justify-center gap-5 align-middle">
			{#each Object.entries(PIECES_DATA) as [id, data]}
				<span
					class="rounded-full px-[11px] py-[11px]"
					style="cursor: pointer; background-color: {found.includes(id) ? data.color : '#E3E3E3'}"
					title={data.color_name}
					on:click={() => navigateToPiece(id)}
				></span>
			{/each}
		</div>

		<div class="mt-5 mb-15 text-center">
			<p>
			{#if totalPiece === 0}
				Tu n'as découvert aucune couleur
			{:else if totalPiece === 1}
				Tu as déja découvert 1 couleur sur 7 !
			{:else}
				Tu as déja découvert {totalPiece} couleurs sur 7 !
			{/if}
			</p>
		</div>

		<div class="relative flex justify-center items-center">
            <div class="relative inline-block">
                <img src="/images/camera.svg" alt="centrée" class="mx-auto !w-[52px] h-auto" />
                <div class="absolute top-1/2 right-full -translate-y-1/2 pr-2">
                <img  src="/images/indic_camera_oeuvre.svg" alt="gauche" class="!w-[105.96px] h-auto max-w-none pointer-events-none mr-2" />
                </div>
            </div>
		</div>

		<div class="mx-auto mt-40 flex flex-col gap-2 border-t border-gray-600 pt-8 text-center">
			<div class="mb-2 flex justify-center gap-4 align-middle">
				{#each Object.entries(PIECES_DATA) as [id, data]}
					<span
						class="rounded-full px-2 py-2"
						style="cursor: pointer; background-color: {found.includes(id) ? data.color : '#DDD'}"
						title={data.color_name}
						on:click={() => navigateToPiece(id)}

					></span>
				{/each}
			</div>

			<button class="cursor-pointer border" on:click={capturePiece}>Capturer la piece </button>

			<p>id: {pieceId} found: {found.join(', ')} total: {totalPiece}</p>
			<p class="text-xs">Tu as déjà trouvé {totalPiece} couleurs sur 7 !</p>
		</div>

		<svg viewBox="0 0 300 300" width="100%" preserveAspectRatio="xMidYMid meet">
			{#each Object.entries(PIECES_DATA) as [id, piece]}
				<polygon
					points={piece.points}
					fill={piece.color}
					stroke="#fff"
					stroke-width="1"
					style="cursor: pointer;"
					on:click={() => navigateToPiece(id)}
				>
					<title>{piece.color_name}</title>
				</polygon>
			{/each}
		</svg>

	</div>

{/if}