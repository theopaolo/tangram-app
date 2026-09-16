// Apply src/lib/server/schema.sql to the Turso database. Re-runnable.
// Usage: npm run migrate

import { readFileSync } from 'node:fs';
import { openDb } from './_db.mjs';

const db = openDb();
const schema = readFileSync(new URL('../src/lib/server/schema.sql', import.meta.url), 'utf8');

const statements = schema
	.split(';')
	.map((s) => s.trim())
	.filter((s) => s && !s.split('\n').every((line) => line.trim().startsWith('--')));

for (const sql of statements) {
	await db.execute(sql);
}

console.log(`Migration OK — ${statements.length} statements applied.`);
