import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		host: '0.0.0.0',  // This makes the server accessible from other devices on your network
		port: 5173,
		https: {
			key: fs.readFileSync('.certs/localhost-key.pem'),
			cert: fs.readFileSync('.certs/localhost.pem'),
		}
	}
});
