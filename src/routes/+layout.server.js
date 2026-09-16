import { getAllChromograms, getAllPuzzles } from '$lib/server/content.js';

// All content (chromogramme sets + puzzles) is loaded once here and pushed
// into the client stores via initContent() in +layout.svelte.
export async function load() {
	const [chromograms, puzzles] = await Promise.all([getAllChromograms(), getAllPuzzles()]);
	return { chromograms, puzzles };
}
