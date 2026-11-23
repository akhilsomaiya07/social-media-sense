# Optional free-model health education

The report immediately displays **Evidence-based educational resources** from a reviewed local library. Optional AI selects and orders existing explanations; it does not author new claims or perform live research. Only age-eligible, reviewed cards and citations can appear.

## Cloudflare runtime bindings

- `OPENROUTER_API_KEY`: encrypted secret, server-side only.
- `OPENROUTER_MODEL`: explicitly chosen `vendor/model:free` identifier. No default is enabled.

Do not commit keys or put them in frontend code or build variables. Existing OpenAI secrets are not used, changed or deleted. Missing configuration uses local education. This PR does not change runtime settings.

## Zero-cost safeguards and privacy

Requests use OpenRouter chat completions with one explicit free model, zero maximum prompt/completion/request prices, no provider fallback, no tools, no plugins and no search. Generic automatic routers and paid model names are rejected. Routing requires parameter support, no data collection and zero data retention. If these restrictions leave no available free provider, the local library remains usable. Free model availability and quotas can change; there is no guarantee of free capacity. Check current provider terms before enabling third-party processing.

Only an age band, durations rounded into half-hour buckets, five routine frequencies and reviewed source summaries are sent externally. Names, platform breakdowns, saved check-ins, Sleep Tracker notes and exact ages are excluded. The same-origin Worker receives exact age and durations to filter the local library, without logging or persisting them.

## Cache and request limits

Per Worker isolate: up to 128 cached patterns, six-hour successful selections, one-minute failure caching, two external calls per minute, twenty per UTC day and two concurrent distinct calls. Equivalent concurrent requests are coalesced. Keys contain no user identifiers. Timeout is twelve seconds including body reading; no retry is attempted. The frontend has a bounded in-session cache and fifteen-second abort.

These are best-effort per-isolate protections, not a durable deployment-wide quota. Isolates restart and scale independently. A global abuse-proof limit would require shared infrastructure outside this change. Free quota exhaustion must still fall back. No paid Cloudflare storage or upgrade is required.

## Validation and fallback

The model must copy reviewed statements and source IDs exactly. Invented text, sources, URLs, model mismatches and malformed output are rejected. Only validated IDs reach the browser, which renders local reviewed text. This intentionally limits generative freedom. Local cards appear before the optional request and remain visible on failure, without technical provider errors.

No live AI calls were made during implementation. Mocked success does not verify a currently available free provider. Sleep Tracker is unchanged and retains its existing fallback; its legacy payload does not enable this AI path. The Netlify adapter supplies no Cloudflare bindings and stays in local mode. Assessment results and saved records remain independent.

Official references: [chat completions](https://openrouter.ai/docs/api-reference/chat-completion), [provider routing](https://openrouter.ai/docs/guides/routing/provider-selection), [free models](https://openrouter.ai/collections/free-models).

## Safe diagnostics and redirects

The server emits fixed `health_selection` categories for local fallback paths, including configuration, rate limits, network failures, timeout, upstream HTTP rejection and output-validation failures. Logs do not include prompts, answers, credentials or provider text. HTTP 200 can still mean `mode: "local"`; only a validated selection returns `mode: "ai"`. A cache hit is not proof of a fresh provider request.

Provider requests use `redirect: 'manual'` for Cloudflare compatibility. All 3xx responses are rejected without forwarding authorization to another destination. These code safeguards do not establish that a particular configured provider is available or succeeded in production.
