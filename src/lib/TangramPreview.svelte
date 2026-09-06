<script>
	// Aperçu miniature d'un tangram, fidèle au rendu du jeu et de /puzzles :
	// chaque pièce est centrée sur (x, y) et pivotée autour de son propre
	// centre, et l'état de complétion est lu comme sur la page /puzzles
	// (pièces grises tant qu'elles ne sont pas résolues).
	import { browser } from '$app/environment';
	import {
		SHAPE_GEOMETRY_WITH_VIEWBOX,
		shapesWithViewBox,
		getCamaieuColor,
		PIECE_GREY_COLOR
	} from '$lib/puzzleData.js';

	let { puzzle } = $props();

	// Progression sauvegardée (mêmes clés localStorage que /puzzles)
	const matches = $derived.by(() => {
		if (!browser || !puzzle) return [];
		try {
			const saved = localStorage.getItem(`puzzle_${puzzle.id}_progress`);
			if (!saved) return [];
			const progress = JSON.parse(saved);
			if (String(progress.puzzleId) !== String(puzzle.id)) return [];
			if (Array.isArray(progress.matches)) return progress.matches;
			if (Array.isArray(progress.matchedTargetIds))
				return progress.matchedTargetIds.map((tid) => ({ targetId: tid, pieceId: tid }));
			return [];
		} catch {
			return [];
		}
	});

	function colorFor(targetId) {
		const m = matches.find((m) => m && m.targetId === targetId);
		if (!m) return PIECE_GREY_COLOR;
		return getCamaieuColor(puzzle.id, m.pieceId ?? targetId, $shapesWithViewBox);
	}

	const polys = $derived.by(() => {
		if (!puzzle) return [];
		const pieces = puzzle.container ? puzzle.pieces : puzzle.data;
		return (pieces ?? [])
			.map((p) => {
				const geom = SHAPE_GEOMETRY_WITH_VIEWBOX[p.id];
				if (!geom) return null;
				const [minX, minY, w, h] = geom.viewBox.split(' ').map(Number);
				const bcx = minX + w / 2;
				const bcy = minY + h / 2;
				const t = (((p.rotation ?? 0) % 360) * Math.PI) / 180;
				const cos = Math.cos(t);
				const sin = Math.sin(t);
				const pts = geom.points
					.split(' ')
					.map((s) => s.split(',').map(Number))
					.map(([px, py]) => [
						(px - bcx) * cos - (py - bcy) * sin + p.x,
						(px - bcx) * sin + (py - bcy) * cos + p.y
					]);
				return { id: p.id, pts };
			})
			.filter(Boolean);
	});

	const viewBox = $derived.by(() => {
		const all = polys.flatMap((p) => p.pts);
		if (!all.length) return '0 0 100 100';
		const xs = all.map((p) => p[0]);
		const ys = all.map((p) => p[1]);
		const m = 8;
		const minX = Math.min(...xs) - m;
		const minY = Math.min(...ys) - m;
		return `${minX} ${minY} ${Math.max(...xs) - minX + m} ${Math.max(...ys) - minY + m}`;
	});
</script>

<svg {viewBox} class="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
	{#each polys as poly (poly.id)}
		<polygon
			points={poly.pts.map((pt) => pt.map((v) => v.toFixed(1)).join(',')).join(' ')}
			fill={colorFor(poly.id)}
		/>
	{/each}
</svg>
