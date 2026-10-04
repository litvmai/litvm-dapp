import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client. Works with either naming scheme Vercel's Marketplace
 * integration may inject (UPSTASH_REDIS_REST_* or KV_REST_API_*), so this
 * keeps working whichever one your dashboard set up.
 */
const url =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  // Thrown lazily (only when an API route actually runs) so `next build`
  // doesn't fail before env vars are configured.
  console.warn(
    "[redis] UPSTASH_REDIS_REST_URL / TOKEN are not set. XP + leaderboard API routes will fail until you add a Redis store (see README)."
  );
}

export const redis = new Redis({
  url: url ?? "",
  token: token ?? "",
});

// Keys used in Redis:
//   xp:<address>        hash  { follow, retweet, txCount, xp }
//   leaderboard          sorted set, score = xp, member = address
//   txs:<address>         set of already-credited tx hashes (dedupe)
export const LEADERBOARD_KEY = "leaderboard";
export const xpKey = (address: string) => `xp:${address.toLowerCase()}`;
export const txsKey = (address: string) => `txs:${address.toLowerCase()}`;
