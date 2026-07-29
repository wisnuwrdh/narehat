 # Deployment — Cloudflare Pages + OpenNext

## Arsitektur

```
GitHub Push
    ↓
Cloudflare Pages (x86 Linux)           Android Termux (build lokal)
    ↓ build command                           ↓
npx @opennextjs/cloudflare build        node scripts/build-pages.mjs
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

Set di **Cloudflare Pages Dashboard → Settings → Environment Variables (Production)**:

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### NextAuth
```
AUTH_SECRET=<random-string>           # NextAuth encryption key
AUTH_GOOGLE_ID=<google-client-id>     # Google OAuth Client ID
AUTH_GOOGLE_SECRET=<google-secret>    # Google OAuth Client Secret
AUTH_URL=https://narehat.com          # Site URL
```

### Turnstile (CAPTCHA)
```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x000...
TURNSTILE_SECRET=0x000...
```

### Email (Resend)
```
RESEND_API_KEY=re_xxx
```

### AI (SumoPod + OpenAI)
```
SUMOPOD_API_KEY=sk-...
OPENAI_API_KEY=sk-...
```

### Payment (SumoPod)
```
SUMOPOD_PAYMENT_API_KEY=xxx
SUMOPOD_PAYMENT_WEBHOOK_TOKEN=whtok_...
SUMOPOD_PAYMENT_API_URL=https://api-pay-sandbox.sumopod.com/api/v1/v1/payments
```

### Site
```
NEXT_PUBLIC_SITE_URL=https://narehat.com
NEXT_PUBLIC_ADMIN_EMAIL=mywisnuwardhana@gmail.com
```

### Bindings (diatur via wrangler.jsonc, bukan env vars)

| Binding | Type | Name | Resource |
|---------|------|------|----------|
| R2 Bucket | `r2_buckets` | `R2_BUCKET` | `narehat-photos` |

Binding dikonfigurasi di `wrangler.jsonc` — tidak perlu set manual di Dashboard.

## Wrangler Config (`wrangler.jsonc`)

```json
{
  "$schema": "https://raw.githubusercontent.com/cloudflare/workers-sdk/main/packages/wrangler/config-schema.json",
  "name": "narehat",
  "compatibility_date": "2026-07-18",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": ".open-next",
  "r2_buckets": [
    {
      "binding": "R2_BUCKET",
      "bucket_name": "narehat-photos"
    }
  ]
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
| `send_email` binding gak dipake | Ganti pakai Resend API | Set `RESEND_API_KEY` di env vars |
