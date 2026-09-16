import { error, fail, redirect } from '@sveltejs/kit';
import { getPuzzle, savePuzzle } from '$lib/server/content.js';

export async function load({ params }) {
	const isNew = params.id === 'new';
	const puzzle = isNew ? null : await getPuzzle(params.id);
	if (!isNew && !puzzle) error(404, `Puzzle introuvable : ${params.id}`);
	return {
		isNew,
		puzzle: puzzle ?? {
			id: null,
			name: '',
			description: '',
			scale: null,
			completed: false,
			container: { width: 400, height: 600 },
			pieces: []
		}
	};
}

export const actions = {
	save: async ({ request, params }) => {
		const form = await request.formData();
		const str = (key) => String(form.get(key) ?? '').trim();

		// The layout is the `{ container, pieces }` JSON produced by /editor Export.
		let container, pieces;
		try {
			const layout = JSON.parse(str('layout'));
			if (!layout.container || !Array.isArray(layout.pieces)) {
				throw new Error('attendu : { "container": {…}, "pieces": […] }');
			}
			({ container, pieces } = layout);
		} catch (e) {
			return fail(400, { error: `Layout JSON invalide — ${e.message}` });
		}

		const scaleStr = str('scale').replace(',', '.');
		const scale = scaleStr === '' ? null : Number(scaleStr);
		if (scale !== null && !Number.isFinite(scale)) {
			return fail(400, { error: 'Échelle invalide.' });
		}

		const existing = params.id === 'new' ? null : await getPuzzle(params.id);
		const id = await savePuzzle({
			id: existing ? existing.id : null,
			name: str('name'),
			description: str('description'),
			scale,
			container,
			pieces,
			completed: form.has('completed'),
			sort: existing?.sort ?? 0
		});

		redirect(303, `/admin/puzzles/${id}?saved=1`);
	}
};
