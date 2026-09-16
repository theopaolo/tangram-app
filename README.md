# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Contenu & administration (Turso + /admin)

Le contenu (chromogrammes + puzzles) vit dans une base **Turso** (libSQL/SQLite) ;
les images téléversées vont sur **Vercel Blob**. L'édition se fait dans **`/admin`**
(login username/mot de passe, utilisateurs créés à la main). Plus de CMS git, plus d'OAuth.

### Mise en place

1. Créer une base Turso (`turso db create tangram`), récupérer l'URL + un token
   (`turso db show tangram --url`, `turso db tokens create tangram`).
2. Copier `.env.example` vers `.env` et remplir `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
   (en local, `TURSO_DATABASE_URL=file:local.db` marche aussi, sans token).
3. `npm run migrate` — crée les tables (re-exécutable).
4. `npm run seed` — importe les JSON historiques de `content/` (re-exécutable, upsert).
5. `npm run create-user -- <username> '<mot de passe>'` — crée/reset un éditeur.
6. Sur Vercel : ajouter les mêmes variables d'env + `BLOB_READ_WRITE_TOKEN`
   (créé automatiquement en attachant un store Blob au projet).

### Au quotidien

- `/admin` — tableau de bord : chromogrammes (7 pièces, textes, couleurs, images,
  sélection/ordre des puzzles du set) et puzzles.
- `/editor` — éditeur visuel de figures ; le bouton **Save** enregistre directement
  la figure en base (nouveau puzzle ou écrasement d'un existant).
- `/qr` — planches de QR codes par set.
- Les scripts `migrate`/`seed`/`create-user` tournent contre la base pointée par `.env`.
