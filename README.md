# Invisible Color

A deduction puzzle game on a 3×3 grid where 9 identical-looking circles have hidden colors. Scroll rows/columns (Rubik's cube style) and use live border-color feedback (green/yellow/none) to deduce the correct arrangement.

## Development

```bash
npm install
npm run dev      # start Vite dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Leaderboard (MongoDB Atlas + Vercel Serverless)

The leaderboard is anonymous: players pick a name (saved in `localStorage` for future plays) and only **daily** puzzles are scored. It shows the top scores for the current daily seed.

### Setup

1. Create a free [MongoDB Atlas](https://www.mongodb.com/atlas) M0 cluster.
2. Create a database user and allow network access (or `0.0.0.0/0` for Vercel).
3. Get the connection string, e.g.
   `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
4. In your Vercel project settings → Environment Variables, add:

   | Name           | Value                 |
   | -------------- | --------------------- |
   | `MONGODB_URI`  | your connection string |

5. Deploy. Vercel compiles the function in `api/leaderboard.ts` automatically — no extra config.

### Rate limiting & abuse prevention

- **IP-based**: max 10 score submissions per IP per 24h (in-memory, per warm instance).
- **Seed validation**: only today's daily seed (±1 day for timezone slack) is accepted.
- **Upsert by `{name, seed}`**: re-submitting for the same day updates only if the new move count is lower, so spamming can't flood the board.
- Collection indexes: unique on `{name, seed}`, plus `{seed, moves}` and `{ip, createdAt}` for fast queries.

### Local API testing

```bash
MONGODB_URI="mongodb+srv://..." npx vercel dev
```
