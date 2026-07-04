# Narehat — Jurnal Jerawat Cerdas

Landing page untuk Narehat, platform kesehatan kulit berbasis AI yang membantu user memahami pemicu personal jerawat mereka.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icons)
- **Framer Motion** (animations)
- **clsx + tailwind-merge** (utility classes)

## Struktur Folder

```
narehat/
├── app/
│   ├── (public)/
│   │   └── page.tsx          → Landing Page
│   ├── globals.css           → Global styles + custom animations
│   └── layout.tsx            → Root layout
├── components/
│   └── landing/
│       ├── Navbar.tsx
│       ├── HeroSection.tsx
│       ├── StatsSection.tsx
│       ├── ProblemSection.tsx
│       ├── FeaturesSection.tsx
│       ├── HowItWorksSection.tsx
│       ├── AhaMomentSection.tsx
│       ├── TestimonialsSection.tsx
│       ├── PricingSection.tsx
│       ├── FAQSection.tsx
│       ├── CTASection.tsx
│       └── Footer.tsx
├── hooks/
│   ├── useScrollReveal.ts    → Intersection Observer hook
│   └── useCountUp.ts         → Animated counter hook
├── lib/
│   └── utils.ts              → cn() utility
├── public/                   → Static assets
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Cara Menjalankan

### 1. Install dependencies
```bash
npm install
```

### 2. Jalankan development server
```bash
npm run dev
```

### 3. Build untuk production
```bash
npm run build
```

## Fitur Landing Page

- ✅ Responsive design (mobile-first)
- ✅ Scroll reveal animations
- ✅ Animated counters (stats section)
- ✅ Smooth scroll navigation
- ✅ Mobile hamburger menu
- ✅ Interactive pricing cards
- ✅ Accordion FAQ
- ✅ App mockup preview (CSS-only)
- ✅ Custom color palette matching brand

## Design System

| Token | Value |
|-------|-------|
| Primary | `#3525cd` |
| Primary Light | `#e9e7ff` |
| Primary Muted | `#8b85e8` |
| Accent | `#6366f1` |
| Success | `#10b981` |
| Warning | `#f59e0b` |
| Font | Plus Jakarta Sans |

## Catatan

- Landing page ini menggunakan **static export** (`output: "export"`)
- Semua animasi menggunakan CSS transitions + Intersection Observer (tanpa library berat)
- Icons dari Lucide React (pengganti Material Symbols)
