// Seed the database from the legacy git-CMS JSON files in content/.
// Re-runnable (upserts). Usage: npm run seed

import { readdirSync, readFileSync } from 'node:fs';
import { openDb } from './_db.mjs';

const db = openDb();

function readJsonDir(dir) {
	const url = new URL(`../${dir}/`, import.meta.url);
	return readdirSync(url)
		.filter((f) => f.endsWith('.json'))
		.sort()
		.map((f) => JSON.parse(readFileSync(new URL(f, url), 'utf8')));
}

// A puzzle may carry its geometry as top-level container/pieces or as a
// `layout` string exported from /editor — normalise to container/pieces.
function normalizePuzzle(p) {
	if (p.layout != null && p.layout !== '') {
		const parsed = typeof p.layout === 'string' ? JSON.parse(p.layout) : p.layout;
		return { ...p, container: parsed.container, pieces: parsed.pieces ?? [] };
	}
	return p;
}

let sort = 0;
for (const set of readJsonDir('content/chromograms')) {
	await db.execute({
		sql: `INSERT INTO chromograms (id, name, title, intro, puzzles_json, pieces_json, sort)
		      VALUES (?, ?, ?, ?, ?, ?, ?)
		      ON CONFLICT(id) DO UPDATE SET
		        name = excluded.name, title = excluded.title, intro = excluded.intro,
		        puzzles_json = excluded.puzzles_json, pieces_json = excluded.pieces_json,
		        sort = excluded.sort, updated_at = datetime('now')`,
		args: [
			set.id,
			set.name ?? '',
			set.title ?? '',
			set.intro ?? '',
			JSON.stringify(set.puzzles ?? []),
			JSON.stringify(set.pieces ?? []),
			sort++
		]
	});
	console.log(`chromogram: ${set.id}`);
}

for (const raw of readJsonDir('content/puzzles')) {
	const p = normalizePuzzle(raw);
	await db.execute({
		sql: `INSERT INTO puzzles (id, name, description, scale, container_json, pieces_json, completed, sort)
		      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		      ON CONFLICT(id) DO UPDATE SET
		        name = excluded.name, description = excluded.description, scale = excluded.scale,
		        container_json = excluded.container_json, pieces_json = excluded.pieces_json,
		        completed = excluded.completed, sort = excluded.sort, updated_at = datetime('now')`,
		args: [
			Number(p.id),
			p.name ?? '',
			p.description ?? '',
			p.scale ?? null,
			JSON.stringify(p.container ?? { width: 400, height: 600 }),
			JSON.stringify(p.pieces ?? []),
			p.completed ? 1 : 0,
			Number(p.id)
		]
	});
	console.log(`puzzle: ${p.id} (${p.name})`);
}

console.log('Seed OK.');
