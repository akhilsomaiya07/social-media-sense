# How I deploy Social Media Sense to Cloudflare Workers

I host the current version on Cloudflare Workers. These are my setup notes for anyone who wants to run the same project. The Worker serves both the website and the optional health-information endpoint.

This is a full-stack app. Use **Cloudflare Workers with Static Assets**, not a static-only Pages upload. The Worker serves the app and its `/api/health-information` endpoint. Both health education and Sleep Tracker use that endpoint.

## 1. Use the current repository

Clone or fork this repository, preserving `package.json`, `package-lock.json`, `wrangler.jsonc`, `public/`, `cloudflare/` and `lib/` at the project root. Do not commit `node_modules`, `.dev.vars`, `.env` files containing credentials or generated artifacts. The current production source is maintained on GitHub; no ZIP upload is required.

## 2. Connect the GitHub repository to Cloudflare

Create or connect a Worker using your GitHub repository in Cloudflare Workers & Pages. Choose the repository and branch containing these files.

Use these build settings:

- Root directory: repository root (leave empty or use `/`). If you uploaded an enclosing folder instead, point the root at that folder.
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Node version: 22 or newer

The project is named `social-media-sense` in `wrangler.jsonc`. If your existing Cloudflare Worker has a different name, change only that `name` value to match before deploying.

Wrangler reads `cloudflare/worker.mjs` and uploads `public/` as static assets. Do not add an unrelated `dist` output directory or use a Pages deploy command.

## 3. Optional free-model personalization

Local educational cards work without credentials. To enable optional selection of reviewed explanations, add runtime bindings named `OPENROUTER_API_KEY` (encrypted secret) and `OPENROUTER_MODEL` (an explicitly chosen `vendor/model:free` identifier). Never put the key in frontend files, Git, build variables or logs. No model is enabled by default. Existing OpenAI secrets are not used or deleted.

See [OpenRouter safeguards and limitations](docs/OPENROUTER.md) before enabling it. No paid storage, paid search or paid-model fallback is required.

## 4. Test the deployed version

Complete the five steps and open Health Information and Sources. “Evidence-based educational resources,” benefits, risks and citations appear immediately from the library. An optional same-origin POST may select reviewed cards using a configured free model. Missing configuration, provider errors and invalid output leave local education visible. Do not interpret a local fallback as proof of successful AI access.

Sleep Tracker retains its existing renderer, tracking and verified fallback. Its legacy research payload does not enable this new AI path.

## Local development / deployment

Install Node.js 22 or newer, then run these from the folder containing `package.json`:

```sh
npm ci
npm run build
npm test
npm run check:cloudflare
npm run dev
```

Local education requires no `.dev.vars` file or provider credentials.

For command-line deployment:

```sh
npx wrangler login
npm run deploy
```

Login and deployment are actions you perform in your own Cloudflare account. The maintainer's version is already deployed at https://social-media-sense.akhilsomaiya7.workers.dev/; deploying a fork requires your own Cloudflare account.

## Saved information

Saved assessments and Sleep Tracker nights live in the browser for a particular website address. A new Cloudflare address will not automatically inherit history from your Netlify address. The export contains source code, not visitors' browser history.

## Official references

- Static assets and Worker bindings: https://developers.cloudflare.com/workers/static-assets/binding/
- Runtime environment variables: https://developers.cloudflare.com/workers/configuration/environment-variables/
- Secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Wrangler commands: https://developers.cloudflare.com/workers/wrangler/commands/

