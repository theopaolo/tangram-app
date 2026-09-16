// Shared helper for the CLI scripts (migrate/seed/create-user), which run
// outside SvelteKit and therefore read env from process.env / .env directly.

import { createClient } from '@libsql/client';

try {
	process.loadEnvFile('.env');
} catch {
	// no .env file — rely on the environment (e.g. `TURSO_DATABASE_URL=… npm run migrate`)
}

export function openDb() {
	const url = process.env.TURSO_DATABASE_URL;
	if (!url) {
		console.error('Missing TURSO_DATABASE_URL (set it in .env or the environment).');
		process.exit(1);
	}
	return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
}
