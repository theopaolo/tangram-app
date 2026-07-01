import { env } from '$env/dynamic/private';

const PROVIDER = 'github';

// Small HTML page that talks to the CMS admin window via postMessage using the
// Decap/Sveltia OAuth handshake ("authorizing:github" -> "authorization:github:success:{...}").
function postMessagePage(status, payload) {
	const message = `authorization:${PROVIDER}:${status}:${JSON.stringify(payload)}`;
	return `<!doctype html><html><body><script>
	(function () {
		function receive(e) {
			window.opener.postMessage(${JSON.stringify(message)}, e.origin);
			window.removeEventListener('message', receive, false);
		}
		window.addEventListener('message', receive, false);
		window.opener.postMessage('authorizing:${PROVIDER}', '*');
	})();
	</script></body></html>`;
}

function html(body) {
	return new Response(body, { headers: { 'content-type': 'text/html;charset=utf-8' } });
}

// Step 2: GitHub redirects back here with a code. Verify state, exchange the
// code for an access token, then hand it to the CMS via postMessage.
export async function GET({ url, cookies }) {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const savedState = cookies.get('cms_oauth_state');
	cookies.delete('cms_oauth_state', { path: '/' });

	if (!code || !state || state !== savedState) {
		return html(postMessagePage('error', { message: 'Invalid OAuth state' }));
	}

	const clientId = env.GITHUB_CLIENT_ID;
	const clientSecret = env.GITHUB_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		return html(postMessagePage('error', { message: 'Missing GitHub OAuth env vars' }));
	}

	try {
		const res = await fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: { 'content-type': 'application/json', accept: 'application/json' },
			body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
		});
		const data = await res.json();

		if (data.error || !data.access_token) {
			return html(postMessagePage('error', { message: data.error_description || 'Token exchange failed' }));
		}

		return html(postMessagePage('success', { token: data.access_token, provider: PROVIDER }));
	} catch (e) {
		return html(postMessagePage('error', { message: 'Token request failed' }));
	}
}
