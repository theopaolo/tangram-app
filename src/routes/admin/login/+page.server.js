import { fail, redirect } from '@sveltejs/kit';
import {
	SESSION_COOKIE,
	sessionCookieOptions,
	verifyCredentials,
	createSession
} from '$lib/server/auth.js';

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const username = String(form.get('username') ?? '').trim();
		const password = String(form.get('password') ?? '');

		if (!username || !password) {
			return fail(400, { error: 'Identifiant et mot de passe requis.', username });
		}

		const user = await verifyCredentials(username, password);
		if (!user) {
			return fail(401, { error: 'Identifiant ou mot de passe incorrect.', username });
		}

		const token = await createSession(user.id);
		cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
		redirect(303, '/admin');
	}
};
