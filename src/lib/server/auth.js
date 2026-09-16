// Session auth backed by the `users` + `sessions` tables.
// Sessions are random 256-bit tokens stored in an httpOnly `session` cookie.

import { randomBytes } from 'node:crypto';
import { db } from './db.js';
import { verifyPassword } from './password.js';

export const SESSION_COOKIE = 'session';
const SESSION_DAYS = 30;

export const sessionCookieOptions = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax',
	secure: true,
	maxAge: SESSION_DAYS * 24 * 60 * 60
};

/** Check username/password; returns the user row or null. */
export async function verifyCredentials(username, password) {
	const rs = await db().execute({
		sql: 'SELECT id, username, password_hash FROM users WHERE username = ?',
		args: [username]
	});
	const user = rs.rows[0];
	if (!user) return null;
	const ok = await verifyPassword(password, user.password_hash);
	return ok ? { id: Number(user.id), username: user.username } : null;
}

/** Create a session for a user id; returns the session token. */
export async function createSession(userId) {
	const token = randomBytes(32).toString('hex');
	const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
	await db().execute({
		sql: 'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
		args: [token, userId, expiresAt]
	});
	return token;
}

/** Resolve a session token to a user ({ id, username }) or null. */
export async function validateSession(token) {
	if (!token) return null;
	const rs = await db().execute({
		sql: `SELECT s.id AS session_id, s.expires_at, u.id, u.username
		      FROM sessions s JOIN users u ON u.id = s.user_id
		      WHERE s.id = ?`,
		args: [token]
	});
	const row = rs.rows[0];
	if (!row) return null;
	if (Number(row.expires_at) < Date.now()) {
		await invalidateSession(token);
		return null;
	}
	return { id: Number(row.id), username: row.username };
}

export async function invalidateSession(token) {
	if (!token) return;
	await db().execute({ sql: 'DELETE FROM sessions WHERE id = ?', args: [token] });
}
