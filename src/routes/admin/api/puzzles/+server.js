import { error, json } from '@sveltejs/kit';
import { getPuzzle, savePuzzle } from '$lib/server/content.js';

// Upsert a puzzle from the /editor Save button.
// Body: { id?, name, container, pieces } — when `id` is set, the existing
// puzzle's description/scale/completed are preserved.
export async function POST({ request, locals }) {
	if (!locals.user) error(401, 'Non authentifié');

	const body = await request.json();
	const { id = null, name, container, pieces } = body ?? {};

	if (!name || typeof name !== 'string') error(400, 'Nom manquant');
	if (!container?.width || !Array.isArray(pieces)) error(400, 'Layout invalide');

	const existing = id != null ? await getPuzzle(id) : null;
	if (id != null && !existing) error(404, `Puzzle #${id} introuvable`);

	const savedId = await savePuzzle({
		...(existing ?? {}),
		id: existing ? existing.id : null,
		name,
		container,
		pieces
	});

	return json({ ok: true, id: savedId });
}
