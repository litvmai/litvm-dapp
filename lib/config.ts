import type { Address } from "viem";

/**
 * LitVMCore — the project's own verified contract on LiteForge.
 * Source: see LitVMCore.sol. Replaces the earlier unverified contract.
 * https://liteforge.explorer.caldera.xyz/address/0x88914966777637cA6e457F63F969c45f89517611
 */
export const CONTRACT_ADDRESS: Address =
  "0x88914966777637cA6e457F63F969c45f89517611";

/** Default participation amount in zkLTC. */
export const DEFAULT_AMOUNT = "0.001";

/** Social links. Replace TWEET_URL when you have the post link. */
export const X_HANDLE = "litvmai";
export const FOLLOW_URL = `https://x.com/intent/follow?screen_name=${X_HANDLE}`;
export const TWEET_URL = "https://x.com/litvmai/status/2105064593013735610";

/**
 * XP awarded per social task.
 * Follow/Retweet/Comment: self-reported (see note in SocialDashboard.tsx),
 * but now gated behind a verified X login.
 * Join Discord: genuinely verified server-side via the Discord API.
 */
export const FOLLOW_XP = 100;
export const RETWEET_XP = 50;
export const COMMENT_XP = 50;
export const DISCORD_JOIN_XP = 75;
/** XP awarded per confirmed, on-chain-verified transaction to the contract. */
export const TX_XP = 5;
