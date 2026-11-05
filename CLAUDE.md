# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Teaching material for a SENA Node.js course (Ficha 3406211). Each numbered folder is one class and holds **two independent things**: a small Node.js project, and an interactive slide deck (static HTML/JS) that walks students through building it. The root `index.html` is a landing page that links to all the decks. Everything user-facing (UI text, code comments, docs, `pasos.md`) is written in **Spanish**; keep it that way.

There is no build step, bundler, linter or test suite. Every `npm test` is the default `echo "Error: no test specified"` placeholder. There is also no root `package.json`: each class is its own project and is installed and run from inside its own folder.

## Commands

Run each example from its class folder (cwd matters, see below):

```bash
# Class 0 (CommonJS, no deps)
cd 0_Primer_Programa/primer_programa && node src/index.js 1 10

# Class 1 (ESM; needs `npm install` for is-odd)
cd 1_module_vs_common && npm install
node src/esModulesJS/main.js
node src/externalModule/main.js
cd src/native && node native.js          # must run from src/native

# Class 2 (ESM; needs `npm install` for object-hash)
cd 2_npm && npm install && npm start -- mauricio hombre colombia 30 ana luis

# Class 3 (CommonJS library `sena-date`)
cd 3_publicar_paquete_npm && node -e "const d=require('./src'); console.log(d.getTimeStamp(), d.getLongTime())"

# Class 4 (writes then deletes ejemplo.txt in the cwd)
cd 4_crear_leer_archivos && node src/fs.js

# Class 5 (needs npm install, a .env with NVIDIA_API_KEY, network)
cd 5_leer_archivos_audio && npm install && node src/transcriptOpenAI.js

# Class 6 (ESM, zero dependencies; one npm script per pattern)
cd 6_Patrones_Diseno && npm run singleton   # strategy | observer | decorator | adapter | factory | chain | facade
npm run integrado                           # all patterns in one mini API
DB_PROVIDER=mongo npm run integrado         # same API over the MongoDB simulator

# Class 7 (ESM; needs npm install, a .env with DATABASE_URL + MONGO_DB_USERNAME/PASSWORD, network)
cd 7_conexion_DB && npm install
npm run probar                              # Supabase (PostgreSQL) via the `postgres` package
npm run probar:mongo                        # MongoDB Atlas via the `mongodb` driver
```

View the landing and decks by serving the repo root (`npx serve .` or `python3 -m http.server 8000`) or by opening `index.html` directly. Requires Node.js >= 20.12 (classes 5 and 7 use `process.loadEnvFile`).

## Gotchas that span files

- **Module system differs per class.** Classes 1, 2, 6 and 7 declare `"type": "module"`; classes 0, 3, 4, 5 are `"commonjs"`. In class 1 this means `src/commonJS/main.js` (which uses `require`) fails under the project's `"type": "module"` unless a `{ "type": "commonjs" }` `package.json` is added inside `src/commonJS/`. That is documented in the README and is intentional teaching material, not a bug to fix silently.
- **cwd-relative paths.** `1_module_vs_common/src/native/native.js` opens `./archivoTexto.txt` relative to the cwd, and `4_crear_leer_archivos/src/fs.js` creates `ejemplo.txt` in the cwd. Class 5, by contrast, builds paths from `__dirname` and works from anywhere.
- **Intentional oddities.** `substract` (sic) is the function name in both `math.js` and `math.mjs`, and the comments and slides refer to it by that name. Typos in `pasos.md`/`fs.js` strings are likewise in the originals. Do not rename or "fix" them without updating the slides.
- **Class 5 secrets and external service.** `src/transcriptOpenAI.js` talks gRPC (not REST) to `grpc.nvcf.nvidia.com:443`, selecting Whisper via a `function-id` metadata header and authenticating with `NVIDIA_API_KEY`, loaded from a git-ignored `.env` in the class folder. The `.proto` files under `src/proto/riva/proto/` are vendored from NVIDIA Riva and loaded with `includeDirs: [src/proto]`. mp3 input is converted to 16 kHz mono WAV with `afconvert` (macOS) or `ffmpeg` before sending, so one of them must be installed. The script cannot run without the key and network access.
- **Class 3 is a real npm package** (`sena-date`, CommonJS, `main: src/index.js`); the class teaches `npm link` and `npm publish`.
- **Class 6 simulates its databases on purpose.** `src/lib/supabaseSimulado.js` and `mongoSimulado.js` are in-memory stand-ins that mirror the method names and response shapes of `@supabase/supabase-js` and the `mongodb` driver, because the real clients (and Atlas/Supabase accounts) are taught in later classes. Swapping them should only change an `import` line, so keep their API faithful to the real packages. The numbered `src/0N-*` folders import each other (`06` uses `01` and `05`, `07` uses `01` and `02`, `08` uses `02`, `03` and `05`, `09` uses all), so renaming or moving one breaks the rest.
- **Class 7 connects to real external services.** `src/db.js` builds a `postgres` client (the `postgres` package, not `@supabase/supabase-js`) from `DATABASE_URL` and exports it as `sql`; it must use `{ prepare: false }` because the Supabase transaction pooler (port 6543) rejects prepared statements. `src/probarMongo.js` builds a `mongodb+srv` URI from `MONGO_DB_USERNAME`/`MONGO_DB_PASSWORD` (URL-encoded) with a hardcoded Atlas host. Both load `../.env` through `process.loadEnvFile(new URL(..., import.meta.url))`, so they work from any cwd. The scripts cannot run without credentials, network, and (for Atlas) the caller's IP on the cluster's allow list. `parametrizacion/script_homologado.sql` creates the `mydb` schema with quoted uppercase table names (`"EMPLEADO"`), which `probar.js` relies on. The root `.gitignore` rule `.env.*` also ignores `7_conexion_DB/.env.example`, so that template is not committed unless `!.env.example` is added.

## Architecture of the slide decks

The decks are hand-written vanilla JS with no shared code between classes; each was built with its own structure. They share the same ideas (a slide navigator, a mascot that gives hints, an animated background, and in most of them a light/dark toggle on `T`) but not the same code. Where the slide content lives:

| Class | Deck folder | Slide content lives in |
|---|---|---|
| 0 | `diapositivas_instruccion/` | `js/content.js` (slides, code arrays) + `js/deck.js` (controller). Self-contained: fonts and `vendor/three.min.js` are local |
| 1 | `diapositivas_instruccion/` | Slides are plain HTML in `index.html`; `deck.js` is only the controller and the avatar's `TIPS` |
| 2 | `diapositivas_instruccion/` | Slides inline in `index.html`; code shown comes from `<script type="text/plain" data-snippet="...">` blocks; `app.js` includes a live demo using `object-hash` loaded from a CDN |
| 3 | `diapositivas_instruccion/` | `js/slides-data.js` defines `window.GUIDE` (phases, slides, editor tabs, hints) |
| 4 | `diapositivas_instruccion/` | `js/slides.js` defines `window.Deck` |
| 5 | `diapositivas_instruccion/` | `slides.js` defines `window.SLIDES`. Self-contained, with local fonts and three.js |
| 6 | `diapositivas_instruccion/` | Same engine as class 5 (copied, not shared), plus a `cards` slide type and richer syntax highlighting in `app.js`. `slides.js` defines `window.SLIDES` (33 slides). Self-contained |
| 7 | `diapositivas_instruccion/` | Same engine as class 6 (copied, not shared), plus a `sql` highlighter in `app.js`. `slides.js` defines `window.SLIDES` (36 slides). Self-contained |

Classes 1 to 4 load Geist fonts from a CDN (and classes 1, 2 and 4 also load three.js from one), so they look right only online.

**The code shown in the slides is a hand-maintained copy of the code in `src/`.** Nothing generates or checks it, so after changing a source file, update the matching deck content:

- Class 0: the `MAIN` array in `js/content.js` is an abridged copy of `src/index.js` (comments removed), and `sim()` in `js/deck.js` re-implements its logic for the step-9 simulator.
- Class 4: `FS_LINES` in `js/slides.js` mirrors `src/fs.js`.
- Class 5: each `code` block in `slides.js` has a `start` line number and `hints`/`marks` keyed by line number. They must match the real line numbers in `src/transcriptOpenAI.js`, so inserting or removing a line there shifts all of them.
- Class 6: same structure as class 5 (`code.file` is a path under `src/`, `start` is the first line, hints are keyed by line number *within the snippet*), covering 20 snippets across the `src/0N-*` files. Editing any of those files silently desyncs the slide. The code blocks without a `src/` path (the terminal ones, `comparación.js` and the `server.js (referencia)` Express sample) are not backed by a file. Keep displayed lines under ~78 columns or the editor clips them.
- Class 7: same structure as class 6, with `code.file` pointing at `src/db.js`, `src/probar.js`, `src/probarMongo.js`, `package.json` and `parametrizacion/script_homologado.sql` (`lang: 'sql'`). The blocks labelled `terminal`, `ejemplo.js`, `.env.example` and `src/probar.js (versión mínima)` are not backed by a file (`.env.example` deliberately shows `[TU-REF-DE-PROYECTO]` instead of the real Supabase project ref). The `npm run probar*` outputs in the terminal slides are real captures, so refresh them if the scripts' output changes. Because `start` and the hint keys depend on exact lines, re-check them after any edit to those files.
- Each class's `pasos.md` is the written script the deck follows step by step; keep the three (script, source, deck) consistent.

## Landing page

`index.html` plus `assets/` (`landing.css`, `landing.js`, `theme-init.js`, fonts). Each class is an `<li><article class="card" data-slides="N">` with per-card colors set through `--accent` (dark theme) and `--accent-l` (light theme).

- The hero totals ("8 clases · 167 diapositivas") are computed in `assets/landing.js` from the cards' `data-slides` attributes. When a deck's slide count changes, update `data-slides` on its card and the slide column of the README table.
- **Código** buttons use `data-code="<folder>"`. `landing.js` rewrites them to `<repo>/tree/HEAD/<folder>` using `REPO_URL` (top of the file), or the GitHub Pages hostname when deployed there, and falls back to the local relative link otherwise.
- Adding a class: create `N_name/` with its project and `diapositivas_instruccion/index.html`, then copy a card `<li>` in `index.html` (the README's "Agregar una clase nueva" lists the fields to change).
