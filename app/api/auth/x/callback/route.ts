import { NextRequest, NextResponse } from "next/server";
import { consumeOAuthState, getAppUrl } from "@/lib/oauth";
import { redis, LEADERBOARD_KEY, xpKey } from "@/lib/redis";

/**
 * Step 2 of "Sign in with X". Exchanges the authorization code for a
 * token, fetches the user's real handle from X's API, and stores it
 * against their wallet address. This is a genuine identity check: only
 * someone who can log into that X account can complete this flow.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const dashboard = `${getAppUrl()}/dashboard`;

  if (!code || !state) {
    return NextResponse.redirect(`${dashboard}?x_error=missing_code`);
  }

  const saved = await consumeOAuthState(state);
  if (!saved?.address || !saved.codeVerifier) {
    return NextResponse.redirect(`${dashboard}?x_error=invalid_state`);
  }

  const clientId = process.env.X_CLIENT_ID!;
  const clientSecret = process.env.X_CLIENT_SECRET!;
  const redirectUri = `${getAppUrl()}/api/auth/x/callback`;

  try {
    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: saved.codeVerifier,
      }),
    });
    if (!tokenRes.ok) throw new Error(await tokenRes.text());
    const { access_token } = await tokenRes.json();

    const meRes = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!meRes.ok) throw new Error(await meRes.text());
    const { data } = await meRes.json();

    const key = xpKey(saved.address);
    await redis.hset(key, { xHandle: data.username, xUserId: data.id });
    const xp = (await redis.hget<number>(key, "xp")) ?? 0;
    await redis.zadd(LEADERBOARD_KEY, {
      score: xp,
      member: saved.address.toLowerCase(),
    });

    return NextResponse.redirect(`${dashboard}?x_connected=1`);
  } catch (err) {
    console.error("[x/callback]", err);
    return NextResponse.redirect(`${dashboard}?x_error=exchange_failed`);
  }
}
