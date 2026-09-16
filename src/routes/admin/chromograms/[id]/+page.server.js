import { error, fail, redirect } from '@sveltejs/kit';
import { put } from '@vercel/blob';
import { env } from '$env/dynamic/private';
import { getChromogram, getAllPuzzles, saveChromogram } from '$lib/server/content.js';

const PIECE_IDS = [1, 2, 3, 4, 5, 6, 7];

export async function load({ params }) {
	const isNew = params.id === 'new';
	const set = isNew ? null : await getChromogram(params.id);
	if (!isNew && !set) error(404, `Chromogramme introuvable : ${params.id}`);
	return {
		isNew,
		set: set ?? { id: '', name: '', title: '', intro: '', puzzles: [], pieces: [] },
		allPuzzles: (await getAllPuzzles()).map(({ id, name }) => ({ id, name }))
	};
}

/** Upload a form file to Vercel Blob; returns its public URL. */
async function uploadImage(setId, file) {
	if (!env.BLOB_READ_WRITE_TOKEN) {
		throw new Error('BLOB_READ_WRITE_TOKEN manquant — upload d’images impossible.');
	}
	const blob = await put(`chromograms/${setId}/${file.name}`, file, {
		access: 'public',
		addRandomSuffix: true,
		token: env.BLOB_READ_WRITE_TOKEN
	});
	return blob.url;
}

export const actions = {
	save: async ({ request, params }) => {
		const form = await request.formData();
		const str = (key) => String(form.get(key) ?? '').trim();

		const id = params.id === 'new' ? str('id') : params.id;
		if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
			return fail(400, { error: 'Id invalide : lettres, chiffres, tirets uniquement.' });
		}
		const existing = await getChromogram(id);
		if (params.id === 'new' && existing) {
			return fail(400, { error: `Le chromogramme « ${id} » existe déjà.` });
		}

		// Ordered puzzle selection: comma-separated ids, empty = tous les puzzles.
		const puzzles = str('puzzles')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);

		const pieces = [];
		for (const pieceId of PIECE_IDS) {
			const p = `piece_${pieceId}_`;
			if (!form.has(`${p}enabled`)) continue;

			// Images: rows of src/credits inputs (+ optional file upload that
			// replaces the src). Rows left fully empty are dropped.
			const images = [];
			for (let j = 0; form.has(`${p}image_${j}_src`) || form.has(`${p}image_${j}_file`); j++) {
				let src = str(`${p}image_${j}_src`);
				const credits = str(`${p}image_${j}_credits`);
				const file = form.get(`${p}image_${j}_file`);
				if (file instanceof File && file.size > 0) {
					try {
						src = await uploadImage(id, file);
					} catch (e) {
						return fail(500, { error: `Échec de l’upload d’image : ${e.message}` });
					}
				}
				if (src) images.push({ src, credits });
			}

			pieces.push({
				pieceId,
				color: str(`${p}color`),
				color_name: str(`${p}color_name`),
				rvb: str(`${p}rvb`),
				cmjn: str(`${p}cmjn`),
				titre_artwork: str(`${p}titre_artwork`),
				artiste: str(`${p}artiste`),
				date: str(`${p}date`),
				story: str(`${p}story`),
				dapres_toi: str(`${p}dapres_toi`),
				dapres: str(`${p}dapres`)
					.split('\n')
					.map((s) => s.trim())
					.filter(Boolean),
				images
			});
		}

		await saveChromogram({
			id,
			name: str('name'),
			title: str('title'),
			intro: String(form.get('intro') ?? '').trim(),
			puzzles,
			pieces,
			sort: existing?.sort ?? 0
		});

		redirect(303, `/admin/chromograms/${id}?saved=1`);
	}
};
