import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { CHECKIN_XP } from "@/lib/config";
import { redis, LEADERBOARD_KEY, xpKey } from "@/lib/redis";

/** One check-in per wallet per UTC day. Points live in Redis. */
export async function POST(req: NextRequest) {
  const { address } = (await req.json()) as { address?: string };
  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const day = new Date().toISOString().slice(0, 10);
  const key = xpKey(address);
  const prev = await redis.hget<string>(key, "checkinDay");
  if (prev === day) {
    const xp = Number((await redis.hget(key, "xp")) ?? 0);
    return NextResponse.json({ error: "Already checked in today", xp, day }, { status: 409 });
  }

  await redis.hset(key, { checkinDay: day });
  const totalXp = await redis.hincrby(key, "xp", CHECKIN_XP);
  await redis.zadd(LEADERBOARD_KEY, { score: totalXp, member: address.toLowerCase() });
  return NextResponse.json({ xp: totalXp, awarded: CHECKIN_XP, day });
}
