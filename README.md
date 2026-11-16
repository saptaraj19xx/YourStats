# YourStats

A modern PUBG PC analytics platform starter built with Next.js, TypeScript, Tailwind CSS and Recharts.

## Requirements
- Node.js 20.9 or newer
- npm

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```
Open http://localhost:3000.

## Current status
The first milestone includes:
- Responsive dark dashboard shell
- YourStats brand and navigation
- Player search interaction (demo only)
- Season snapshot cards
- Performance trend and map preview
- Recent matches table

**Important:** All displayed statistics and matches are illustrative demo data. The PUBG API is not connected yet.

## Next milestones
1. Create a PUBG Developer account and obtain an API key.
2. Implement a server-only PUBG API client and request caching.
3. Add PostgreSQL and Prisma models.
4. Implement player lookup, season stats and match history.
5. Process telemetry and build match detail pages.

Never expose `PUBG_API_KEY` in browser code or a `NEXT_PUBLIC_` environment variable.
