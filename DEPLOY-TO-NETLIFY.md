# My older Netlify deployment notes

I currently use Cloudflare Workers, but I've kept these Netlify steps because the repository still includes a compatible function adapter. These are reference notes, not instructions for the current live host.

1. Unzip the project and replace the files in your existing project/repository with this version. Keep `netlify.toml`, `package.json`, and `package-lock.json` at the project root.
2. Deploy through your connected Git repository, or use Netlify CLI from the extracted folder:

```sh
npm ci
npm run build
npm test
npx netlify-cli login
npx netlify-cli deploy --build --prod
```

Select your existing Netlify project when prompted. This deploys the function as well as the static app. The function adapter returns local mode without Cloudflare runtime bindings.

3. Complete a new check-in on your Netlify site.

No OpenAI key, Netlify AI Gateway, paid plan, or external research service is required. Report education is bundled with the frontend; Sleep Tracker retains its existing fallback.

## Build settings

These are already in `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `public`
- Functions directory: `netlify/functions`
- Node version: 22

No provider credential is required at build time or runtime.

## Verify educational resources

Complete a check-in and open the health information disclosure. “Evidence-based educational resources,” benefits, risks and citations should appear without a successful research-provider request. The retained `/api/health-information` adapter uses local mode without Cloudflare runtime bindings; GET returns 405. Optional OpenRouter configuration is supported by the Cloudflare Worker, not this adapter.

## Official documentation

- Functions: https://docs.netlify.com/build/functions/get-started/

