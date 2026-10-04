import { randomBytes, createHash } from "crypto";
import { redis } from "@/lib/redis";

/** Base URL of the deployed app, used to build OAuth redirect URIs.
 *  Must exactly match what you register in the X / Discord developer
 *  consoles (see README). Set APP_URL in your environment variables. */
export function getAppUrl(): string {
  const url = process.env.APP_URL;
  if (!url) {
    throw new Error(
      "APP_URL env var is not set. Add it in Vercel (e.g. https://your-domain.vercel.app)."
    );
  }
  return url.replace(/\/$/, "");
}

function b64url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** PKCE code_verifier + code_challenge (S256) for X's OAuth 2.0 flow. */
export function createPkcePair() {
  const codeVerifier = b64url(randomBytes(32));
  const codeChallenge = b64url(createHash("sha256").update(codeVerifier).digest());
  return { codeVerifier, codeChallenge };
}

type OAuthState = { address: string; codeVerifier?: string };
const stateKey = (state: string) => `oauth:state:${state}`;

/** Stores a short-lived (10 min) mapping from a random state token to the
 *  wallet address that started the OAuth flow (+ PKCE verifier for X), so
 *  the callback can be matched back to the right wallet without trusting
 *  anything the browser sends. */
export async function saveOAuthState(data: OAuthState): Promise<string> {
  const state = b64url(randomBytes(24));
  await redis.set(stateKey(state), JSON.stringify(data), { ex: 600 });
  return state;
}

export async function consumeOAuthState(state: string): Promise<OAuthState | null> {
  const raw = await redis.get<string>(stateKey(state));
  if (!raw) return null;
  await redis.del(stateKey(state));
  return typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as OAuthState);
}
