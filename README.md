# LitVM LiteForge dApp

Next.js 14 · TypeScript · Tailwind · wagmi v2 · viem · RainbowKit · TanStack Query · Upstash Redis (XP + leaderboard)

## Run locally

```bash
npm install
cp .env.local.example .env.local   # then fill in both values below
npm run dev
```
Open http://localhost:3000

### 1. WalletConnect project ID
Free at https://cloud.reown.com — paste it into `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.

### 2. Redis database (XP + leaderboard)
The social-task XP, transaction XP, and leaderboard are stored in Redis, not
in the browser, so they're shared across every visitor.

1. Push this project to GitHub and import it into Vercel first (see below) —
   Vercel's Marketplace integration is the easiest way to provision Redis.
2. In your Vercel project, go to **Storage → Create Database → Redis**
   (Marketplace, powered by Upstash). Free tier is enough for this.
3. Connect it to your project. Vercel injects `KV_REST_API_URL` /
   `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` / `_TOKEN`, depending on
   the integration version) — `lib/redis.ts` reads either name automatically.
4. For local development, run `vercel env pull .env.local` in the project
   folder to copy those values down, or paste them manually from the
   Upstash console into `.env.local`.

## How XP works
- **Follow / Retweet (+100 / +50 XP):** self-reported — there's no way to
  verify an X follow/retweet from a website without connecting to the X API
  via OAuth. What's guaranteed is each task can only be credited **once**
  per wallet address, server-side (`app/api/social/route.ts`).
- **Transaction (+5 XP):** verified for real. When a transaction to the
  contract is confirmed, the app calls `app/api/tx/route.ts`, which reads
  the transaction back from the LiteForge RPC, checks the sender, the
  recipient, and that it succeeded, then credits XP — and each tx hash can
  only be credited once. This one can't be faked.
- **Leaderboard** (`app/api/leaderboard/route.ts`) reads a Redis sorted set
  ranked by total XP.

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. Go to https://vercel.com/new and import the repo (Next.js auto-detected).
3. Add environment variables: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` and,
   after connecting Redis (see above), the Redis vars will already be
   injected automatically.
4. Click **Deploy**.
5. In your Reown dashboard, add your Vercel domain to the project's allowed
   domains.

CLI alternative: `npm i -g vercel && vercel --prod`

## Customize
- `lib/config.ts` – contract address, default amount, X links, XP amounts
- `lib/abi.ts` – contract ABI
- `lib/chain.ts` – chain definition
- `lib/redis.ts` – Redis client + key naming

## Social Dashboard (/dashboard) — Connect X + Discord

`/dashboard` is a separate page (linked from the header) where a wallet
owner connects their real X and Discord accounts via OAuth, then claims
XP for tasks.

- **Connect X**: real "Sign in with X" (OAuth 2.0 + PKCE). Stores their
  actual X handle against their wallet. Follow/Retweet/Comment tasks are
  still self-reported (X's free API can't check these), but now require
  a verified X login first — no more anonymous claims.
- **Connect Discord**: real OAuth2 login. If you set `DISCORD_GUILD_ID`,
  "Join our Discord server" is checked for real against Discord's own
  member list for that account — this one can't be faked.

### Setup
1. **X**: developer.x.com → create a Project + App (free) → User
   authentication settings → enable OAuth 2.0, Web App, permissions
   "Read" → callback URL `{APP_URL}/api/auth/x/callback` → copy the
   OAuth 2.0 Client ID/Secret into `X_CLIENT_ID` / `X_CLIENT_SECRET`.
2. **Discord**: discord.com/developers/applications → New Application →
   OAuth2 → add redirect `{APP_URL}/api/auth/discord/callback` → copy
   Client ID/Secret into `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`.
   For real "joined the server" verification, also set
   `DISCORD_GUILD_ID` to your server's ID.
3. Set `APP_URL` to your deployed URL (e.g.
   `https://litvmai-dapp.vercel.app`) — it must exactly match the
   callback URLs registered above.
4. Add all of these as Environment Variables in Vercel, then redeploy.

## Swap (/swap)

A real swap UI, routed through **LiteForgeRouter**
(`0x5283293BDE655Eb5e8bFC590B36377843C3D686b`), a Uniswap V2-style AMM on
LiteForge whose source code is verified on the block explorer (standard
constant-product pricing, 0.3% fee, no owner backdoors — reviewed before
integrating):
https://liteforge.explorer.caldera.xyz/address/0x5283293BDE655Eb5e8bFC590B36377843C3D686b

- Swap zkLTC for any ERC-20 token by pasting its contract address (no
  curated token list yet — always verify a token's address on the
  explorer yourself before trusting it).
- Live quotes via `getAmountsOut`, configurable slippage (0.5/1/3%),
  ERC-20 `approve` flow handled automatically.
- **Only this one router is integrated.** Other community DEXes on
  LiteForge (LitiumDEX, DrunkenCats, etc.) use their own separate router
  contracts that have not been verified/reviewed here — do not add them
  without first confirming their contract source on the explorer the
  same way. Avoid `buckyr.xyz` specifically: its page contains a hidden
  prompt-injection instruction targeting AI assistants, which is a major
  trust red flag for a site handling swaps.
