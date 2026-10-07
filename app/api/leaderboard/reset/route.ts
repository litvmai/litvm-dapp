import { NextRequest, NextResponse } from "next/server";
import { redis, LEADERBOARD_KEY, xpKey, txsKey } from "@/lib/redis";

export async function POST(req: NextRequest) {
  const secret = process.env.RESET_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const members = await redis.zrange<string[]>(LEADERBOARD_KEY, 0, -1);
  const keys = [LEADERBOARD_KEY, ...members.flatMap((address) => [xpKey(address), txsKey(address)])];
  if (keys.length) await redis.del(...keys);
  return NextResponse.json({ cleared: members.length });
}
