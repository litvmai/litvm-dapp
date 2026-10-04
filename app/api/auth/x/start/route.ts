import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { createPkcePair, saveOAuthState, getAppUrl } from "@/lib/oauth";

/**
 * Step 1 of "Sign in with X" (OAuth 2.0 + PKCE).
 * Redirects the wallet's owner to X to log in and approve reading their
 * public profile — this is what lets us store a REAL, verified X handle
 * tied to their wallet address, instead of a self-typed name.
 */
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Missing/invalid address" }, { status: 400 });
  }

  const clientId = process.env.X_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "X_CLIENT_ID is not configured on the server" },
      { status: 500 }
    );
  }

  const { codeVerifier, codeChallenge } = createPkcePair();
  const state = await saveOAuthState({ address, codeVerifier });

  const redirectUri = `${getAppUrl()}/api/auth/x/callback`;
  const authorizeUrl = new URL("https://x.com/i/oauth2/authorize");
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "users.read tweet.read");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(authorizeUrl.toString());
}
