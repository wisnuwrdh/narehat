# GAP ANALYSIS — NarehatSaas v0.1

**Generated:** 2026-07-07
**Related:** THREAT-MODEL.md (security), findings.json (structured)
**This document:** Functional/UX gaps — features exist but are incomplete or disconnected

---

## 1. Onboarding — 5-Step UI, ZERO Data Saved [CRITICAL]

### Data Flow Trace

```
Step 1: Tipe kulit   → <input type="radio" name="skin-type" value="oily" ... className="hidden peer" />
                        ↑ No useState binding, no onChange handler, checked only by CSS :checked

Step 2: Severity      → <input type="radio" name="acne-severity" value="mild" ... />
                        ↑ Same — CSS-only selection, no state

Step 3: Habits        → <input type="checkbox" value="sleep-late" ... />
                        ↑ Same — no state tracking checked items

Step 4: Products      → <input type="text" placeholder="Contoh: Cetaphil..." />
                        ↑ No state, no value binding, no onChange

Step 5: Goal          → <input type="radio" name="goal" value="clear-acne" ... />
                        ↑ Same — CSS-only

nextStep():
  if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  else router.push("/dashboard");
                                 ↑ NO fetch("/api/user", { method: "PATCH" })
                                 ↑ NO supabase call
                                 ↑ NO localStorage fallback
```

### Root Cause

`app/(auth)/onboarding/page.tsx` — lines 75-88:

```tsx
export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  // ← Missing: state for answers (skin_type, acne_severity, habits array, products array, goal)
  // ← Missing: useEffect or handler to collect form data
  // ← Missing: API call to save data before redirect
```

- Line 81-83: `nextStep()` hanya navigasi antar step, tidak mengumpulkan atau menyimpan data
- Line 119: semua `<input type="radio">` tidak punya `onChange` handler atau controlled `checked` state
- Line 137: semua `<input type="checkbox">` tidak punya `onChange` handler
- Line 156: semua `<input type="text">` tidak punya `value` binding atau `onChange`
- Line 165-170: div upload foto di step 2 adalah statis — tidak klik, tidak ada `<input type="file" ref={}>`
- Line 83: `router.push("/dashboard")` tanpa menyimpan apapun terlebih dahulu

### Impact

| Stage | User sees | Reality |
|-------|-----------|---------|
| Register | Buat akun → isi onboarding | Excited, expects personalization |
| Onboarding step 1-5 | Isi semua input, klik Selesai | All answers LOST |
| Dashboard | Skin score 0, Halo User, ringkasan kosong | No profile data saved |
| Settings | Skin type "Kombinasi" (default), Severity "Ringan" (default) | Defaults, not what user selected |

### Fix

```tsx
// Add state
const [answers, setAnswers] = useState<OnboardingData>({
  skin_type: "combination",
  acne_severity: "mild",
  habits: [],
  products: [],
  goal: "clear_acne",
});

// Collect inputs via controlled components
const handleRadioChange = (field: string, value: string) => {
  setAnswers(prev => ({ ...prev, [field]: value }));
};

// Save on last step
const handleFinish = async () => {
  await fetch("/api/user", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answers),
  });
  router.push("/dashboard");
};
```

---

## 2. Empty States — No First-Time User Guidance [HIGH]

### Current State

| Page | Empty Condition | What User Sees |
|------|----------------|-----------------|
| `/dashboard` | No `daily_log` for today | Skin score 0/100, "Halo User", summary card "isi tracker dulu" — no CTA |
| `/progress` | No logs in selected range | Chart area shows "Isi tracker secara rutin" — tiny text, no CTA link |
| `/tracker` | No log saved today | All sliders at 0 — OK, user can fill in |
| `/recommendations` | No user profile loaded | Skin type default "kombinasi", products may be empty if seed not run |

### Missing

- No guided tour overlay ("Tap tracker untuk mulai catat kebiasaan")
- Dashboard should show onboarding CTA: "Isi tracker sekarang →" when empty
- Progress should redirect with "Kamu belum punya data tracker" + button
- No loading skeleton vs empty state distinction — user doesn't know if it's loading or truly empty

### Relevant Files

- `app/(app)/dashboard/page.tsx` — summaryItems falls back to "isi tracker dulu" card
- `app/(app)/progress/page.tsx:250-252` — empty chart message
- `app/(app)/recommendations/page.tsx:197-207` — empty products message

---

## 3. Payment Flow — Dead End at Register [HIGH]

### Current Path

```
Pricing cards:
  "Upgrade ke Premium"  → href="/register?plan=premium_monthly"
  "Pilih Tahunan"        → href="/register?plan=premium_yearly"
  
Register page:
  Tidak ada logic untuk baca query param ?plan=
  Tidak ada logic untuk trigger Xendit invoice setelah register
  Tidak ada redirect ke payment page

After register:
  → redirect /onboarding → redirect /dashboard
  → plan stays "free" in users table
```

### What Exists But Is Unused

| File | Function | Called by |
|------|----------|-----------|
| `lib/payment/xendit.ts` | `createInvoice(userId, plan)` | No one |
| `lib/payment/xendit.ts` | `verifyWebhookSignature(payload, sig)` | No one |
| `app/api/payment/route.ts` | `POST` webhook handler | Stub only |

### Missing

1. Payment page: `/checkout?plan=premium_monthly` that calls `createInvoice()` and shows payment details
2. Register page: baca `?plan=` query param → setelah register → redirect ke `/checkout?plan=...`
3. Webhook: verify signature → update `users.plan` via service_role client

### Relevant Files

- `components/landing/PricingSection.tsx:137-146` — CTAs point to `/register?plan=`
- `app/(auth)/register/page.tsx` — no plan param handling
- `lib/payment/xendit.ts` — createInvoice, verifyWebhook both unused
- `app/api/payment/route.ts` — stub

---

## 4. Photo Integration — API Exists, Client Orphaned [MEDIUM]

### Current Flow

```
Tracker page:
  handlePhoto() → FileReader.readAsDataURL() → setPhotoPreview()
  handleSave() → fetch("/api/tracker", { body: tracker data only })
                   ↑ Photo NOT sent to /api/photos

Progress page (comparison):
  handlePhoto(side, e) → FileReader.readAsDataURL() → setLeftPhoto/setRightPhoto
                          ↑ Local preview only, never uploaded

Dashboard:
  photo section → static placeholder "add_a_photo" icons
                   ↑ No fetch from /api/photos
```

### What Works

`POST /api/photos` is FULLY implemented:
- Auth check (line 22-23)
- File upload to Supabase Storage (line 38-43)
- Record insert into `skin_photos` table (line 53-60)
- Returns public URL (line 66-69)

### What's Missing

1. Tracker `handleSave()` → also POST photo to `/api/photos` if `photoPreview` exists
2. Dashboard `useEffect` → fetch photos from `/api/photos` and display latest
3. Progress page → fetch real photos for timeline instead of hardcoded

### Relevant Files

- `app/(app)/tracker/page.tsx:81-88` — handlePhoto (local preview only)
- `app/(app)/tracker/page.tsx:90-114` — handleSave (no photo upload)
- `app/(app)/progress/page.tsx:97-107` — handlePhoto (comparison, local only)
- `app/api/photos/route.ts` — fully working, no client calls it

---

## 5. Auth Middleware — Missing Route Protection [HIGH]

### Current State

| URL | Logged In | Not Logged In |
|-----|-----------|---------------|
| `/` | Landing page | Landing page |
| `/login` | Shows login form (bad UX) | Shows login form (correct) |
| `/register` | Shows register form (bad UX) | Shows register form (correct) |
| `/dashboard` | Shows dashboard with data | Shows dashboard with errors (bad) |
| `/tracker` | Shows tracker | Shows tracker (bad — no auth redirect) |
| `/progress` | Shows progress | Shows progress (bad — no auth redirect) |
| `/ai-consult` | Shows AI chat (premium check API) | Shows AI chat (API returns 401 offline) |

### What Exists

`lib/supabase/middleware.disabled.ts` has a working `updateSession()` function that:
- Refreshes Supabase auth session
- Handles cookie sync
- Can be wired to redirect unauthenticated users

### Missing

1. Root-level `middleware.ts` importing and using `updateSession()`
2. Route protection: `/(app)` routes should redirect to `/login` if no session
3. Reverse redirect: `/login` and `/register` should redirect to `/dashboard` if already logged in
4. API routes: already self-protected with auth checks in each route — OK

### Fix

```ts
// Create middleware.ts at project root
import { updateSession } from "@/lib/supabase/middleware.disabled";
export { updateSession as middleware };

export const config = {
  matcher: ["/((?!_next|api|favicon|.*\\.).*)"],
};
```

---

## 6. Theme — localStorage Only, No Cross-Device Sync [LOW]

### Data Flow

```
Settings page → setActiveTheme("Dark") → localStorage.setItem("narehat-theme", "Dark")
  → return
  → No: supabase.from("users").update({ theme: "dark" }).eq("id", userId)

Dashboard/AI-Consult → useTheme() → localStorage.getItem("narehat-theme")
  → No: supabase.from("users").select("theme").eq("id", userId).single()
```

### Impact

User sets "Dark" theme on phone → opens on laptop → theme back to Default. No cross-device preference sync.

### Relevant Files

- `hooks/useTheme.ts` — reads/writes localStorage only
- `app/(app)/settings/page.tsx:38-42` — `handleThemeChange()` saves to localStorage
- Database: `users` table has no `theme` column
- API: `/api/user` PATCH doesn't handle `theme` field

### Fix

1. Add `theme TEXT DEFAULT 'default'` to `users` table via migration
2. Update `/api/user` PATCH to accept `theme` field
3. Update `handleThemeChange()` to call `fetch("/api/user", { method: "PATCH", body: { theme } })`
4. On mount, read theme from `/api/user` response, fallback to localStorage

---

## 7. Performance — Three Quick Wins [LOW]

### 7a. Material Symbols Font (500KB render-blocking)

```
app/globals.css:2
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap');
```

- Full font with all weights (100-700) — ~500KB download
- `@import` in CSS is render-blocking — page won't render until font CSS loads
- Only a subset of icons actually used (spa, home, person, etc.)

**Fix:** Use `<link rel="preload" as="style">` with `display=block` + subset to used weights only, OR replace with inline SVG icons.

### 7b. Plus Jakarta Sans (80KB render-blocking)

```
app/globals.css:1
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
```

- `@import` render-blocking — can't use `display=swap` effectively
- Should be `<link>` in HTML head with `media="print" onload="this.media='all'"` pattern

**Fix:** Move to `<link>` in layout.tsx `<head>`.

### 7c. Xenova Transformers Cold Start

```
lib/ai/embeddings.ts:10
  embedderPromise = import("@xenova/transformers").then(({ pipeline }) =>
    pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")
  );
```

- `all-MiniLM-L6-v2` model is ~80MB, downloaded and loaded at first request
- Vercel serverless: cold start 3-5 detik pada request pertama
- Model cached after first load (warm request: ~500ms)

**Fix:** Pre-load model at build time via server-side init, or offload to Supabase Edge Function with pgvector embedding generation.

---

## Appendix: Remediation Priority

| # | Action | Severity | Files | Lines |
|---|--------|----------|-------|-------|
| 1 | Onboarding save to DB | **Critical** | `onboarding/page.tsx` | +40 |
| 2 | Wire up auth middleware | **High** | new `middleware.ts` | +5 |
| 3 | Dashboard empty state + CTA | **High** | `dashboard/page.tsx` | +10 |
| 4 | Payment flow (checkout page) | **High** | new `app/checkout/page.tsx`, `pricing` link | +50 |
| 5 | Photo upload from tracker | **Medium** | `tracker/page.tsx` handleSave() | +10 |
| 6 | Dashboard fetch real photos | **Medium** | `dashboard/page.tsx` useEffect | +8 |
| 7 | Font performance fix | **Low** | `globals.css`, `layout.tsx` | +5 |
| 8 | Theme cross-device sync | **Low** | migration, `user/route.ts`, `useTheme.ts` | +10 |

---

*This gap analysis covers functional/UX issues. For security-specific findings, see THREAT-MODEL.md.*
