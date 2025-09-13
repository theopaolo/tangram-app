import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';

// Conditionally enable HTTPS only if local certs exist
const CERT_FILE = '.certs/localhost.pem';
const KEY_FILE = '.certs/localhost-key.pem';
const hasCerts = fs.existsSync(CERT_FILE) && fs.existsSync(KEY_FILE);

if (!hasCerts) {
  console.warn(
    '\n[dev] TLS certs not found in .certs — starting over HTTP.\n' +
      '      For mobile camera access, run: npm run setup-ssl\n'
  );
}

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		host: '0.0.0.0', // Accessible from other devices on the network
		port: 5173,
		...(hasCerts
			? {
				// Enable HTTPS only when certs are present
				https: {
					key: fs.readFileSync(KEY_FILE),
					cert: fs.readFileSync(CERT_FILE)
				}
			}
			: {})
	}
});
