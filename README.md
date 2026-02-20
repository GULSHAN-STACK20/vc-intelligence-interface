# VC Intelligence Interface + Live Enrichment

A Next.js MVP for VC sourcing workflows: discover companies, open profile, enrich from live public web pages, and take action with notes/lists/saved searches.

## Features

- App shell with sidebar + global search.
- `/companies` with search, filters, sortable table, pagination.
- `/companies/[id]` profile with overview, signal timeline, notes, save-to-list.
- `/lists` create/remove/export lists in CSV/JSON (localStorage persistence).
- `/saved` save and re-run searches (localStorage persistence).
- Live enrichment via server endpoint (`/api/enrich`) that pulls public pages through `r.jina.ai` and extracts:
  - Summary
  - What-they-do bullets
  - Keywords
  - Derived signals
  - Sources + timestamp

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- LocalStorage for client persistence

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

No required env vars for the default flow.

Optional:

- `FIRECRAWL_API_KEY` (not wired in this MVP yet; reserved for swapping enrichment providers while keeping keys server-side only).

Create a `.env.local` if needed.

## Safety Notes

- Enrichment runs **server-side** in `/api/enrich`; no API keys are exposed to browser code.
- The enrichment request accepts only `companyId`; the API resolves the website from canonical seed data to prevent client-side URL tampering.
- Only public URLs are fetched. No access-control bypass behavior is implemented.

## Deploy

Recommended: Vercel.

1. Push repository.
2. Import in Vercel.
3. Build command: `npm run build`
4. Start command: `npm run start`
