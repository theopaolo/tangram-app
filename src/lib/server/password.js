// Password hashing with Node's built-in scrypt — no external dependency.
// Hash format: `scrypt:<salt hex>:<derived key hex>`.
// Kept free of SvelteKit imports so scripts/create-user.mjs can reuse it.

import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

function derive(password, salt) {
	return new Promise((resolve, reject) => {
		scrypt(password, salt, KEY_LENGTH, (err, key) => (err ? reject(err) : resolve(key)));
	});
}

export async function hashPassword(password) {
	const salt = randomBytes(16).toString('hex');
	const key = await derive(password, salt);
	return `scrypt:${salt}:${key.toString('hex')}`;
}

export async function verifyPassword(password, hash) {
	const [scheme, salt, keyHex] = String(hash ?? '').split(':');
	if (scheme !== 'scrypt' || !salt || !keyHex) return false;
	const expected = Buffer.from(keyHex, 'hex');
	const actual = await derive(password, salt);
	return expected.length === actual.length && timingSafeEqual(expected, actual);
}
