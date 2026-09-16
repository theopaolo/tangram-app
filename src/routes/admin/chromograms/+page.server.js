import { getAllChromograms, deleteChromogram } from '$lib/server/content.js';

export async function load() {
	return { chromograms: await getAllChromograms() };
}

export const actions = {
	delete: async ({ request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (id) await deleteChromogram(id);
	}
};
