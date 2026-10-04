import { NextRequest, NextResponse } from "next/server";
import { redis, LEADERBOARD_KEY } from "@/lib/redis";

/** Top N wallets by XP, highest first. */
export async function GET(req: NextRequest) {
  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit") ?? 20),
    100
  );

  // ZRANGE ... REV WITHSCORES  -> highest score first
  const raw = await redis.zrange<string[]>(LEADERBOARD_KEY, 0, limit - 1, {
    rev: true,
    withScores: true,
  });

  const entries: { address: string; xp: number }[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    entries.push({ address: raw[i], xp: Number(raw[i + 1]) });
  }

  return NextResponse.json({ entries });
}
