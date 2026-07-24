# Deployment — Cloudflare Pages + OpenNext

## Arsitektur

```
GitHub Push
    ↓
Cloudflare Pages (x86 Linux)           Android Termux (build lokal)
    ↓ build command                           ↓
node scripts/build-pages.mjs           node scripts/build-pages.mjs
    ↓                                       ↓
.next/ → OpenNext adapter              .next/ → OpenNext adapter
    ↓                                       ↓
.open-next/                             .open-next/
├── _worker.js ← env.ASSETS            ├── _worker.js
├── _next/static/ ← CSS/JS             ├── _next/static/ ← CSS/JS
├── assets/ ← original OpenNext        ├── assets/
├── server-functions/
├── middleware/
├── cloudflare/
└── cache/
```

## Build Pipeline (`scripts/build-pages.mjs`)

| Step | Action |
|------|--------|
| 1/7 | Patch `build.js` — empty native mods (`sharp`, `onnxruntime`) after `next build` |
| 2/7 | Patch `edge.js` — add `.node` to esbuild filter |
| 3/7 | Patch `wrangler-external.js` — add `.node` filter + onLoad |
| 4/7 | *(Android only)* Mock `@ast-grep/napi` native binding |
| 5/7 | `next build` → OpenNext bundle → `.open-next/worker.js` |
| 6/7 | Rename `worker.js` → `_worker.js` |
| 7/7 | Patch `_worker.js`: serve `/_next/static/*` via `env.ASSETS.fetch()` + copy assets to root |

## Build Command

```bash
node scripts/build-pages.mjs
```

Output: `.open-next/` — siap deploy ke Cloudflare Pages.

## Platform Differences

| Aspek | Cloudflare Pages (x86 Linux) | Android Termux |
|-------|------------------------------|----------------|
| `next build` | via `npm run build` (shebang OK) | via `node node_modules/next/dist/bin/next build` |
| `@ast-grep/napi` | Native binary tersedia | Mock (ISR patches gak jalan) |
| Native modulen | workerd, sharp tersedia | workerd, sharp gak support |
| Wrangler config | Dibaca dari `wrangler.jsonc` | Dihardcode fallback |

## Static Assets

OpenNext taruh static assets di `.open-next/assets/_next/static/`. Cloudflare Pages butuh di `.open-next/_next/static/`. Solusi:

1. **Copy to root** — `assets/*` → `.open-next/*` (step 7)
2. **Worker patch** — `env.ASSETS.fetch()` serve file sebelum middleware handle
3. Filter `url.pathname.startsWith("/_next/static/")` → return `env.ASSETS.fetch(request)`

## Environment Variables

Set di Cloudflare Pages dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=
R2_BUCKET_NAME=
SUMOPOD_API_KEY=
OPENAI_API_KEY=
XENDIT_SECRET_KEY=
XENDIT_WEBHOOK_TOKEN=
NEXT_PUBLIC_SITE_URL=https://narehat.com
```

## Wrangler Config (`wrangler.jsonc`)

```json
{
  "$schema": "https://raw.githubusercontent.com/cloudflare/workers-sdk/main/packages/wrangler/config-schema.json",
  "name": "narehat",
  "compatibility_date": "2026-07-18",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": ".open-next"
}
```

## Manual Deploy (via API)

Gunakan Cloudflare Pages API langsung (tanpa wrangler CLI):

```bash
# Dapatkan upload JWT
JWT=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/narehat/upload-token" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.result.jwt')
```

## Known Limitations

| Issue | Dampak | Workaround |
|-------|--------|------------|
| `sharp` dikosongin | `/_next/image` gak bisa resize | Pakai `/cdn-cgi/image/` bawaan Cloudflare |
| `onnxruntime-node` dikosongin | AI endpoints (detect, purging) error | — |
| `@ast-grep/napi` mock | ISR/Cache revalidation patches skip | Static pages gak revalidate |
| `workerd` gak support Android | `wrangler` CLI gak bisa jalan di Termux | Deploy via Git push / API |
