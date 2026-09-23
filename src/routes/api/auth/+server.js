import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Step 1 of the CMS OAuth flow. Sveltia opens a popup to /api/auth; we redirect
// it to GitHub's authorization page with a CSRF `state` stored in a cookie.
export function GET({ url, cookies }) {
	const clientId = env.GITHUB_CLIENT_ID;
	if (!clientId) {
		return new Response('Missing GITHUB_CLIENT_ID env var', { status: 500 });
	}

	const scope = url.searchParams.get('scope') ?? 'repo,user';
	const state = crypto.randomUUID();

	cookies.set('cms_oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 600
	});

	const authorize = new URL('https://github.com/login/oauth/authorize');
	authorize.searchParams.set('client_id', clientId);
	authorize.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
	authorize.searchParams.set('scope', scope);
	authorize.searchParams.set('state', state);

	redirect(302, authorize.toString());
}
