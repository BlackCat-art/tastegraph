# tastegraph

> Paste a Spotify playlist link. Get a magazine-quality poster of your music personality in 30 seconds.

## Status

🚧 Day 1 build — landing page placeholder only. App goes live in ~14 days.

See `~/tastegraph-spec/PRD-v1.0.md` for the full spec.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · Vercel

## Local development

```bash
nvm use 20          # or any Node >= 18.17
npm install
npm run migrate     # apply DB schema (D7+)
npm run dev         # → http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Deploy

Pushed commits to `main` auto-deploy via Cloudflare Pages + OpenNext.

## D7 Setup — Magic Link Auth

D7 adds user accounts via email magic link (PRD §5.7).

### 1. Sign up for Neon (free, no credit card)
- https://console.neon.tech → Sign in with GitHub
- Create project: name `tastegraph`, region **AWS US East 1**
- ⚠️ Keep **Neon Auth** toggle OFF (we use our own auth tables)
- Copy the connection string from the dashboard

### 2. Sign up for Resend (free, 100 emails/day)
- https://resend.com → Sign up with GitHub
- Create API Key in dashboard (name `tastegraph-dev`, permission "Sending access")
- Use `onboarding@resend.dev` as the from-email (no domain verification needed)

### 3. Generate JWT secret
```bash
openssl rand -base64 32
```

### 4. Configure `.dev.vars` (local dev)
Create `~/dev/tastegraph/.dev.vars` (gitignored, permissions 600):
```
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev
JWT_SECRET=<output from step 3>
```

### 5. Run migration
```bash
npm run migrate
```
Should print `[migrate] applied: 0000_init.sql` + `[migrate] done.`

### 6. Run dev server
```bash
npm run dev
```
Open http://localhost:3000/create → click "Sign in" → enter email → check inbox (or click devLink in console if dev mode).

### Production (Cloudflare Pages)
Set the same 4 vars as secrets:
```bash
wrangler pages secret put DATABASE_URL
wrangler pages secret put RESEND_API_KEY
wrangler pages secret put RESEND_FROM_EMAIL
wrangler pages secret put JWT_SECRET
```

Run migration once before first deploy (point at prod DATABASE_URL):
```bash
DATABASE_URL=<prod-url> npm run migrate
```

## Project layout

```
app/
  layout.tsx       # root <html>, metadata, font globals
  page.tsx         # landing page (Day 1)
  globals.css      # tailwind + dark theme
tailwind.config.ts # brand palette
package.json
```

## Roadmap

| Day | Deliverable |
|---|---|
| 1 | This build (landing page + skeleton) |
| 2 | URL parsing (Spotify → Track[]) |
| 3 | 5-dimension scoring engine |
| … | (see PRD §15) |

## D8 Stripe Subscription

- **Checkout**: `POST /api/v1/stripe/checkout` → 创建 Stripe checkout session,返回 redirect URL
- **Portal**: `POST /api/v1/stripe/portal` → 创建 Customer Portal session(管理订阅)
- **Webhook**: `POST /api/v1/stripe/webhook` → Stripe 事件处理(checkout.session.completed / subscription.updated / subscription.deleted)
- **Rate limit**: 基于用户 plan 分层(unauthenticated 3/min, free 10/min, pro 30/min),Windows 60s sliding window
- **DB**: `stripe_events`(幂等去重) + `stripe_subscriptions`(订阅状态)
- **Env vars**: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- **Migration**: `npm run migrate-stripe`

### Go Pro flow
1. User clicks "Go Pro" → `POST /api/v1/stripe/checkout` → redirect to Stripe Checkout
2. After payment → Stripe sends `checkout.session.completed` webhook
3. Webhook handler → `users.plan = 'pro'` + `users.stripe_id = customer_id`
4. User re-authenticates → new JWT includes `stripeId` + `plan = pro`
5. AuthChip shows "PRO" badge + "Manage" button → Customer Portal
