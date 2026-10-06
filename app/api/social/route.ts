import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { redis, LEADERBOARD_KEY, xpKey } from "@/lib/redis";
import { FOLLOW_XP, RETWEET_XP, COMMENT_XP, DISCORD_JOIN_XP } from "@/lib/config";

const TWEET_TASK_KEY = "tweet_task";
const claimedKey = (address: string) => `tweet_claims:${address.toLowerCase()}`;

type SelfReportedTask = "follow" | "retweet" | "comment";
type VerifiedTask = "join_discord";
type Task = SelfReportedTask | VerifiedTask;

const XP_BY_TASK: Record<Task, number> = {
  follow: FOLLOW_XP,
  retweet: RETWEET_XP,
  comment: COMMENT_XP,
  join_discord: DISCORD_JOIN_XP,
};

type Record_ = {
  follow?: number;
  retweet?: number;
  comment?: number;
  join_discord?: number;
  xp?: number;
  txCount?: number;
  xHandle?: string;
  xUserId?: string;
  discordId?: string;
  discordUsername?: string;
  discordJoinedGuild?: number;
};

function toResponse(r: Record_ | null) {
  return {
    follow: !!r?.follow,
    retweet: !!r?.retweet,
    comment: !!r?.comment,
    join_discord: !!r?.join_discord,
    txCount: r?.txCount ?? 0,
    xp: r?.xp ?? 0,
    xHandle: r?.xHandle ?? null,
    discordUsername: r?.discordUsername ?? null,
    discordJoinedGuild: !!r?.discordJoinedGuild,
  };
}

/**
 * Claims XP for a task.
 * follow is once per wallet. retweet and comment are once per active post.
 * join_discord is credited only after Discord OAuth saw the guild.
 */
export async function POST(req: NextRequest) {
  const { address, task } = (await req.json()) as {
    address?: string;
    task?: Task;
  };

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }
  if (!task || !(task in XP_BY_TASK)) {
    return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  }
  const validTask: Task = task;

  const key = xpKey(address);
  const record = await redis.hgetall<Record_>(key);

  if (
    (validTask === "follow" || validTask === "retweet" || validTask === "comment") &&
    !record?.xHandle
  ) {
    return NextResponse.json(
      { error: "Connect your X account before claiming this task" },
      { status: 403 }
    );
  }
  if (validTask === "join_discord" && !record?.discordJoinedGuild) {
    return NextResponse.json(
      { error: "We couldn't verify you've joined the Discord server" },
      { status: 403 }
    );
  }

  if (validTask === "retweet" || validTask === "comment") {
    const task = await redis.get<{ id?: string } | string>(TWEET_TASK_KEY);
    const parsed = typeof task === "string" ? JSON.parse(task) : task;
    const tweetId = parsed?.id;
    if (!tweetId) {
      return NextResponse.json({ error: "No active post task yet" }, { status: 400 });
    }
    const member = `${validTask}:${tweetId}`;
    const isNew = await redis.sadd(claimedKey(address), member);
    if (isNew) await redis.hincrby(key, "xp", XP_BY_TASK[validTask]);
  } else {
    const already = record?.[validTask];
    if (!already) {
      await redis.hset(key, { [validTask]: 1 });
      await redis.hincrby(key, "xp", XP_BY_TASK[validTask]);
    }
  }

  const updated = await redis.hgetall<Record_>(key);
  const totalXp = updated?.xp ?? 0;
  await redis.zadd(LEADERBOARD_KEY, { score: totalXp, member: address.toLowerCase() });

  return NextResponse.json(toResponse(updated ?? null));
}

/** Fetch a single wallet's current progress + connected accounts. */
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }
  const record = await redis.hgetall<Record_>(xpKey(address));
  return NextResponse.json(toResponse(record ?? null));
}
