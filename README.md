# YourStats

Modern PUBG PC (Steam) statistics and analytics platform.

## Run locally
Requirements: Node.js 20.9+ and npm.

```bash
npm install
cp .env.example .env.local
```

Add your private PUBG API key to `.env.local`:

```env
PUBG_API_KEY=your_private_api_key
PUBG_API_BASE_URL=https://api.pubg.com
```

Then run `npm run dev` and open http://localhost:3000.

## Current integration
- Server-only PUBG API client.
- Player lookup by exact PUBG PC Steam in-game name.
- Lifetime game-mode statistics.
- Recent match IDs returned by the player endpoint.
- Server-side caching and API error handling.

All PUBG requests are made from Next.js server code. Never expose the key with a `NEXT_PUBLIC_` variable or commit `.env.local`.

PUBG API rate limits and match-data retention apply. Recent match references are not a complete historical archive; collect and store data while it is available if long-term history is required.


## Match detail loading
The dashboard requests details for up to six recent match IDs and matches the participant record using the player's PUBG account ID. This is intentionally capped to avoid exhausting the default development request limit. Unavailable lifetime stats are shown as unavailable rather than being presented as zero.
