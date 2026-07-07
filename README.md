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
npm run dev         # → http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Deploy

Pushed commits to `main` auto-deploy via Vercel.

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
