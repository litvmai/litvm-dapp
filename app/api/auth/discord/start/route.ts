import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { saveOAuthState, getAppUrl } from "@/lib/oauth";

/**
 * Step 1 of "Connect Discord". Uses the `guilds` scope (in addition to
 * `identify`) so the callback can genuinely check — via Discord's own
 * API, no bot required — whether this user has actually joined your
 * server. That check can't be faked from the browser.
 */
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Missing/invalid address" }, { status: 400 });
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "DISCORD_CLIENT_ID is not configured on the server" },
      { status: 500 }
    );
  }

  const state = await saveOAuthState({ address });
  const redirectUri = `${getAppUrl()}/api/auth/discord/callback`;

  const authorizeUrl = new URL("https://discord.com/oauth2/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "identify guilds");
  authorizeUrl.searchParams.set("state", state);

  return NextResponse.redirect(authorizeUrl.toString());
}
