import { getAllChromograms, getAllPuzzles } from '$lib/server/content.js';

export async function load() {
	const [chromograms, puzzles] = await Promise.all([getAllChromograms(), getAllPuzzles()]);
	return { chromograms, puzzles };
}
