import { SESSION_COOKIE, validateSession } from '$lib/server/auth.js';

// Resolve the session cookie to a user on every request; guarded routes
// (/admin, /editor) check event.locals.user in their load functions.
export async function handle({ event, resolve }) {
	const token = event.cookies.get(SESSION_COOKIE);
	event.locals.user = token ? await validateSession(token) : null;
	return resolve(event);
}
