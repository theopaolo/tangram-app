// Manually create (or reset the password of) an admin user.
// Usage: npm run create-user -- <username> <password>

import { openDb } from './_db.mjs';
import { hashPassword } from '../src/lib/server/password.js';

const [username, password] = process.argv.slice(2);
if (!username || !password) {
	console.error('Usage: npm run create-user -- <username> <password>');
	process.exit(1);
}

const db = openDb();
const hash = await hashPassword(password);

await db.execute({
	sql: `INSERT INTO users (username, password_hash) VALUES (?, ?)
	      ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash`,
	args: [username, hash]
});

console.log(`User "${username}" created/updated.`);
