import { redirect } from '@sveltejs/kit';

// The visual editor is an authoring tool — same gate as /admin.
export function load({ locals }) {
	if (!locals.user) {
		redirect(303, '/admin/login');
	}
}
