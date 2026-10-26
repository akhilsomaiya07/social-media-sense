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

## 3. Configure live research on Cloudflare

**Netlify AI Gateway credentials are supplied by Netlify only. They are not included in this ZIP and do not automatically exist in Cloudflare.** The frontend, calculations, plans, saved check-ins, and verified fallback education can run without live credentials. Live source refresh needs an authorized provider connection on Cloudflare.

In your Worker's runtime Settings → Variables and Secrets, configure:

- `OPENAI_BASE_URL`: the base URL supplied by your OpenAI-compatible provider or gateway. It must support the OpenAI Responses API and its hosted `web_search` tool.
- `OPENAI_API_KEY`: the authorized credential for that provider, stored as a **Secret**.

These are runtime settings, not just build-time variables. Do not put either credential into `public/`, GitHub, or frontend JavaScript. Do not copy an ephemeral Netlify-injected credential into Cloudflare. No Netlify dashboard variable changes are needed.

The existing research code uses `new OpenAI()` and model `gpt-5.5`; your provider/account must support that model and Responses web search. A generic text-completion endpoint or a Workers AI model without Responses web-search support is not a substitute. Provider usage may incur charges. This export does not provision credentials or a gateway account.

The compatibility flags in `wrangler.jsonc` expose Worker runtime bindings to `process.env`, so the existing server-side SDK connection can run unchanged.

## 4. Test the deployed version

Complete the five steps. Verify the total, results screen, and compact Sleep Tracker. Open the research disclosures and confirm that current-source notices appear. If a refresh is unavailable, inspect the Worker's runtime logs or the browser's `/api/health-information` response. Do not treat fallback links as proof of a successful live retrieval.

A GET request to `/api/health-information` returns 405 by design; the app sends a same-origin POST. A 503 with `cloudflare_research_not_configured` means runtime provider settings are missing.

## Local development / deployment

Install Node.js 22 or newer, then run these from the folder containing `package.json`:

```sh
npm ci
npm run build
npm test
npm run check:cloudflare
npm run dev
```

For local live requests, copy `.dev.vars.example` to `.dev.vars` and provide your authorized provider settings there. That file is ignored by Git. Do not publish it.

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
