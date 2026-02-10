# Routing and Deployment

## Pages vs Worker

- A Worker deployment uses `main` in `wrangler.toml` and runs a Worker script as the deployment unit.
- A Pages deployment uses `pages_build_output_dir` in `wrangler.toml` and supports Pages Functions under `/functions`.
- Pages config cannot include both `main` and `pages_build_output_dir`.

## Why This Repo Uses Pages Functions

- This repo deploys as a Cloudflare Pages project.
- `functions/[[path]].ts` is the server entrypoint for all routed requests.
- The function forwards each request to the app router in `src/index.ts`.
- This keeps one routing implementation while retaining Pages deployment semantics.

## What `wrangler.toml` Is Used For in Pages Here

`wrangler.toml` in this repo is used for:

- `pages_build_output_dir` (Pages deployment mode)
- D1 binding (`DB`)
- KV binding (`SESSION_KV`)
- environment variables (`ALLOWED_DOMAIN`, `SESSION_SECRET`)

It is not used to define a Worker `main` script in this Pages project.
