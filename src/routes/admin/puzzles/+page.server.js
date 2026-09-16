import { getAllPuzzles, deletePuzzle } from '$lib/server/content.js';

export async function load() {
	return { puzzles: await getAllPuzzles() };
}

export const actions = {
	delete: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id');
		if (id) await deletePuzzle(id);
	}
};
