import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE, invalidateSession } from '$lib/server/auth.js';

export const actions = {
	default: async ({ cookies }) => {
		await invalidateSession(cookies.get(SESSION_COOKIE));
		cookies.delete(SESSION_COOKIE, { path: '/' });
		redirect(303, '/admin/login');
	}
};
