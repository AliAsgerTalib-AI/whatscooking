# FlavorLab

An open-source AI recipe generator powered by Claude Sonnet. Two modes: **Home** (casual, imperial units) and **Pro** (professional kitchen, metric weights, EU allergen compliance, HACCP notes).

**[Try it live →](https://whatscooking.vercel.app)**

## Quick Start

```bash
# Install
cd testbed && npm install

# Full-stack dev (AI generation enabled)
cd ..  # repo root
vercel dev  # requires ANTHROPIC_API_KEY in .env

# Frontend only
cd testbed && npm run dev
```

## Environment

Create `.env` at repo root:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Tech Stack

React 18 · Vite · Tailwind CSS · Claude Sonnet (`claude-sonnet-4-20250514`) · Vercel Serverless

## Docs

- [Product Requirements Document](../docs/superpowers/specs/2026-04-19-flavorlab-prd.md)

## Contributing

See the PRD for contribution areas. Key invariant: **never remove the allergen disclaimer** in `src/export/exportProPDF.js` — it is legally required.
