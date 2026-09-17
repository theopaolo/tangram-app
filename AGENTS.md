# Tangram app — Codex instructions

Museum puzzle app: SvelteKit + Vite + Tailwind, GSAP, QR scanning. Custom editor backend with libsql (`local.db`) + Vercel Blob.

## Dev & test

- `npm run dev` → https://localhost:5173 (host-exposed; HTTPS only if certs exist — generate with `npm run setup-ssl`). If 5173 is taken Vite bumps the port (518x) — check the terminal output before giving me a URL.
- DB scripts: `npm run migrate`, `npm run seed`, `npm run create-user`.
- Checks: `npm run check` (svelte-check), `npm run lint`.

## Workflow

- Work and commit on branch `dev`, never directly on `main`.
- Deploys: Vercel — the `dev` branch serves the preprod preview (tangram-preprod).
