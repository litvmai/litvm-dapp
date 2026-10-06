import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { redis } from "@/lib/redis";
import { X_HANDLE, RETWEET_XP, COMMENT_XP } from "@/lib/config";

const TASK_KEY = "tweet_task";
const claimedKey = (address: string) => `tweet_claims:${address.toLowerCase()}`;

type TweetTask = {
  id: string;
  url: string;
  text: string;
  createdAt: string;
};

async function readTask(): Promise<TweetTask | null> {
  const raw = await redis.get<TweetTask | string>(TASK_KEY);
  if (!raw) return null;
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as TweetTask; } catch { return null; }
  }
  return raw;
}

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET || process.env.TASK_ADMIN_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const bodySecret = req.nextUrl.searchParams.get("secret");
  return header === `Bearer ${secret}` || bodySecret === secret;
}

async function fetchLatestTweet(): Promise<TweetTask | null> {
  const bearer = process.env.X_BEARER_TOKEN;
  if (!bearer) return null;
  const headers = { Authorization: `Bearer ${bearer}` };
  const userRes = await fetch(
    `https://api.x.com/2/users/by/username/${X_HANDLE}`,
    { headers, cache: "no-store" }
  );
  if (!userRes.ok) return null;
  const user = await userRes.json();
  const userId = user?.data?.id;
  if (!userId) return null;
  const tweetsRes = await fetch(
    `https://api.x.com/2/users/${userId}/tweets?max_results=5&exclude=replies,retweets&tweet.fields=created_at,text`,
    { headers, cache: "no-store" }
  );
  if (!tweetsRes.ok) return null;
  const tweets = await tweetsRes.json();
  const tweet = tweets?.data?.[0];
  if (!tweet?.id) return null;
  return {
    id: String(tweet.id),
    url: `https://x.com/${X_HANDLE}/status/${tweet.id}`,
    text: String(tweet.text ?? "").slice(0, 240),
    createdAt: tweet.created_at ?? new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const task = await readTask();
  const address = req.nextUrl.searchParams.get("address");
  let retweet = false;
  let comment = false;
  if (task && address && isAddress(address)) {
    const claims = await redis.smembers(claimedKey(address));
    retweet = claims.includes(`retweet:${task.id}`);
    comment = claims.includes(`comment:${task.id}`);
  }
  return NextResponse.json({
    task,
    retweetXp: RETWEET_XP,
    commentXp: COMMENT_XP,
    claimed: { retweet, comment },
  });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const latest = await fetchLatestTweet();
  if (!latest) {
    return NextResponse.json(
      { error: "Could not read the latest post. Set X_BEARER_TOKEN on Vercel." },
      { status: 502 }
    );
  }
  const current = await readTask();
  const changed = current?.id !== latest.id;
  if (changed) await redis.set(TASK_KEY, latest);
  return NextResponse.json({ task: latest, changed });
}
