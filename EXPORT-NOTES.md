# Complete current export

Prepared October 10, 2026 (UTC).

Source: the latest Netlify project in this conversation, including all changes through the simplified Sleep Shield interface. This archive includes the complete current app, not earlier obsolete versions or the conversation transcript.

All files in `public/`, the shared `lib/health.mjs`, and the Netlify Function/configuration are byte-for-byte identical to the current app before this export. Cloudflare adapter/configuration, Wrangler dependency and commands, and deployment documentation were added. Existing behavior and calculations were not changed.

No API keys, account tokens, local browser history, `node_modules`, or temporary build outputs are included. Dependencies install from package-lock.json with npm ci.

Production deployment and a live provider request still require the owner's hosting account and authorized runtime provider settings. This export does not claim a successful production deployment or live Cloudflare research call.

Verification: existing build and regression tests passed; Wrangler deployment dry-run bundled the Worker and found all 10 public files; adapter routing checks passed. Local Cloudflare runtime startup was blocked by the execution environment’s network-interface error, so a full local workerd run is not claimed.
