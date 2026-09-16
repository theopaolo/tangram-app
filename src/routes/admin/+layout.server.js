import { redirect } from '@sveltejs/kit';

// Gate the whole /admin area behind a session. /admin/login is the only
// sub-route that must stay reachable when logged out.
export function load({ locals, url }) {
	const isLogin = url.pathname.startsWith('/admin/login');
	if (!locals.user && !isLogin) {
		redirect(303, '/admin/login');
	}
	if (locals.user && isLogin) {
		redirect(303, '/admin');
	}
	return { user: locals.user };
}
