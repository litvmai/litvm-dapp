import { NextRequest, NextResponse } from "next/server";
import { consumeOAuthState, getAppUrl } from "@/lib/oauth";
import { redis, LEADERBOARD_KEY, xpKey } from "@/lib/redis";

/**
 * Step 2 of "Connect Discord". Exchanges the code for a token, fetches
 * the user's real Discord identity, and — using the `guilds` scope —
 * checks the list of servers THEY are actually a member of (as reported
 * by Discord itself) against your server's ID. That membership flag is
 * genuinely verified, not self-reported.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const dashboard = `${getAppUrl()}/dashboard`;

  if (!code || !state) {
    return NextResponse.redirect(`${dashboard}?discord_error=missing_code`);
  }

  const saved = await consumeOAuthState(state);
  if (!saved?.address) {
    return NextResponse.redirect(`${dashboard}?discord_error=invalid_state`);
  }

  const clientId = process.env.DISCORD_CLIENT_ID!;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
  const redirectUri = `${getAppUrl()}/api/auth/discord/callback`;
  const guildId = process.env.DISCORD_GUILD_ID; // optional

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });
    if (!tokenRes.ok) throw new Error(await tokenRes.text());
    const { access_token } = await tokenRes.json();

    const meRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!meRes.ok) throw new Error(await meRes.text());
    const me = await meRes.json();

    let joinedGuild = false;
    if (guildId) {
      const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (guildsRes.ok) {
        const guilds: { id: string }[] = await guildsRes.json();
        joinedGuild = guilds.some((g) => g.id === guildId);
      }
    }

    const key = xpKey(saved.address);
    await redis.hset(key, {
      discordId: me.id,
      discordUsername: me.username,
      discordJoinedGuild: joinedGuild ? 1 : 0,
    });
    const xp = (await redis.hget<number>(key, "xp")) ?? 0;
    await redis.zadd(LEADERBOARD_KEY, {
      score: xp,
      member: saved.address.toLowerCase(),
    });

    return NextResponse.redirect(`${dashboard}?discord_connected=1`);
  } catch (err) {
    console.error("[discord/callback]", err);
    return NextResponse.redirect(`${dashboard}?discord_error=exchange_failed`);
  }
}
