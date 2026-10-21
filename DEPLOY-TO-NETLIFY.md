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

Select your existing Netlify project when prompted. This deploys the function as well as the static app. A static-only ZIP upload may omit the function build and its SDK dependency.

3. Complete a new check-in on your Netlify site.

Do not manually add `OPENAI_API_KEY` or `OPENAI_BASE_URL`. Netlify AI Gateway injects them into supported runtimes. The gateway requires an eligible credit-based plan, enabled AI features, and a production deployment. Existing project/team overrides can prevent automatic injection; this package does not set overrides.

## Build settings

These are already in `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `public`
- Functions directory: `netlify/functions`
- Node version: 22

Netlify installs the SDK before running the build. No credential is required at build time.

## If the refresh still fails

Inspect the JSON response for `POST /api/health-information` in the browser Network panel. The exact runtime diagnostics are:

| Status / code | Message or meaning |
| --- | --- |
| 503 / `gateway_not_active` | Netlify AI Gateway is not active in this function runtime. |
| 503 / `gateway_credential_missing` | Netlify AI Gateway did not provide an OpenAI credential. |
| 503 / `provider_auth_failed` | The gateway/provider rejected runtime authentication or access. |
| 503 / `provider_rate_limited` | The gateway/provider returned a quota or rate-limit response. |
| 503 / `provider_unavailable` | The provider request failed. |
| 504 / `retrieval_timeout` | The request exceeded the existing timeout. |
| 502 / `invalid_source_response` | Retrieved output failed parsing or citation validation. |

Opening the endpoint in a browser tab sends GET and returns 405; the app sends POST. Do not copy credentials into screenshots, chat, or public files. Both health-education sections remain available through the existing labeled fallback.

## Official documentation

- Netlify AI Gateway: https://docs.netlify.com/build/ai-gateway/overview/
- Gateway quickstart: https://docs.netlify.com/build/ai-gateway/quickstart-for-ai-gateway/
- Functions: https://docs.netlify.com/build/functions/get-started/
