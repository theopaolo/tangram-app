// libSQL (Turso) client, shared by all server-side data access.
// TURSO_DATABASE_URL may be a remote `libsql://…` URL (with TURSO_AUTH_TOKEN)
// or a local `file:…` path for development.

import { createClient } from '@libsql/client';
import { env } from '$env/dynamic/private';

let client;

export function db() {
	if (!client) {
		if (!env.TURSO_DATABASE_URL) {
			throw new Error('Missing TURSO_DATABASE_URL env var');
		}
		client = createClient({
			url: env.TURSO_DATABASE_URL,
			authToken: env.TURSO_AUTH_TOKEN
		});
	}
	return client;
}
