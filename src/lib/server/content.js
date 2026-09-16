// Server-side content access: chromogramme sets + puzzles stored in Turso.
// Rows are mapped back to the exact object shapes the client stores consume
// (the same shapes the old content/*.json files had).

import { db } from './db.js';

function rowToChromogram(row) {
	return {
		id: row.id,
		name: row.name,
		title: row.title,
		intro: row.intro,
		puzzles: JSON.parse(row.puzzles_json),
		pieces: JSON.parse(row.pieces_json),
		sort: Number(row.sort)
	};
}

function rowToPuzzle(row) {
	const puzzle = {
		id: Number(row.id),
		name: row.name,
		description: row.description,
		completed: Boolean(row.completed),
		container: JSON.parse(row.container_json),
		pieces: JSON.parse(row.pieces_json),
		sort: Number(row.sort)
	};
	// `scale` is optional in the old JSON files — keep the key absent when unset
	// so consumers' `puzzle.scale` checks behave identically.
	if (row.scale != null) puzzle.scale = Number(row.scale);
	return puzzle;
}

export async function getAllChromograms() {
	const rs = await db().execute('SELECT * FROM chromograms ORDER BY sort, id');
	return rs.rows.map(rowToChromogram);
}

export async function getChromogram(id) {
	const rs = await db().execute({ sql: 'SELECT * FROM chromograms WHERE id = ?', args: [id] });
	return rs.rows[0] ? rowToChromogram(rs.rows[0]) : null;
}

export async function saveChromogram({ id, name, title, intro, puzzles, pieces, sort }) {
	await db().execute({
		sql: `INSERT INTO chromograms (id, name, title, intro, puzzles_json, pieces_json, sort, updated_at)
		      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
		      ON CONFLICT(id) DO UPDATE SET
		        name = excluded.name, title = excluded.title, intro = excluded.intro,
		        puzzles_json = excluded.puzzles_json, pieces_json = excluded.pieces_json,
		        sort = excluded.sort, updated_at = excluded.updated_at`,
		args: [
			id,
			name ?? '',
			title ?? '',
			intro ?? '',
			JSON.stringify(puzzles ?? []),
			JSON.stringify(pieces ?? []),
			sort ?? 0
		]
	});
}

export async function deleteChromogram(id) {
	await db().execute({ sql: 'DELETE FROM chromograms WHERE id = ?', args: [id] });
}

export async function getAllPuzzles() {
	const rs = await db().execute('SELECT * FROM puzzles ORDER BY sort, id');
	return rs.rows.map(rowToPuzzle);
}

export async function getPuzzle(id) {
	const rs = await db().execute({ sql: 'SELECT * FROM puzzles WHERE id = ?', args: [Number(id)] });
	return rs.rows[0] ? rowToPuzzle(rs.rows[0]) : null;
}

/** Upsert a puzzle. When `id` is null/undefined, allocates the next free id. */
export async function savePuzzle({ id, name, description, scale, container, pieces, completed, sort }) {
	if (id == null) {
		const rs = await db().execute('SELECT COALESCE(MAX(id), 0) + 1 AS next FROM puzzles');
		id = Number(rs.rows[0].next);
	}
	await db().execute({
		sql: `INSERT INTO puzzles (id, name, description, scale, container_json, pieces_json, completed, sort, updated_at)
		      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
		      ON CONFLICT(id) DO UPDATE SET
		        name = excluded.name, description = excluded.description, scale = excluded.scale,
		        container_json = excluded.container_json, pieces_json = excluded.pieces_json,
		        completed = excluded.completed, sort = excluded.sort, updated_at = excluded.updated_at`,
		args: [
			Number(id),
			name ?? '',
			description ?? '',
			scale ?? null,
			JSON.stringify(container ?? { width: 400, height: 600 }),
			JSON.stringify(pieces ?? []),
			completed ? 1 : 0,
			sort ?? 0
		]
	});
	return Number(id);
}

export async function deletePuzzle(id) {
	await db().execute({ sql: 'DELETE FROM puzzles WHERE id = ?', args: [Number(id)] });
}
