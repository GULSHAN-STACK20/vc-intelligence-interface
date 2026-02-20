VC Intelligence Interface – ScoutOS VC

A production-style SaaS dashboard for VC sourcing workflows.

Discover companies, open structured profiles, enrich from live public web pages, and manage sourcing workflows with notes, lists, and saved searches.

🚀 Live Demo

[Add your Vercel link here]

✨ Product Overview

ScoutOS VC simulates a modern venture sourcing intelligence interface with:

Company discovery with search, sector filtering, sorting, and pagination

KPI stat cards and improved table hierarchy

Stage badges and right-aligned metrics

URL-driven filters for shareable views

Company profile with structured metadata header

Signals timeline view

Persistent notes and list management

Saved searches with rerun support

CSV/JSON export with robust escaping

Toast notifications and interaction feedback

Premium SaaS-grade UI polish

🔍 Live Enrichment

Server-side enrichment via /api/enrich.

The endpoint:

Accepts only companyId

Derives canonical website server-side

Fetches public content via r.jina.ai

Extracts:

Summary

What-they-do bullets

Keywords

Derived signals

Sources

Timestamp

All enrichment runs securely on the server.
No API keys are exposed to the client.
Only public URLs are accessed.

🛠 Tech Stack

Next.js 14 (App Router)

TypeScript

Tailwind CSS

Server-side API routes

LocalStorage persistence

Deployed on Vercel

🧠 Design Decisions

Layered dark SaaS UI for clarity and hierarchy

Enrichment security by deriving website server-side

Client persistence for speed and simplicity

URL-synced search parameters for reproducibility

Explicit loading, success, and error states
