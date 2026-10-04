import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, isAddress, isHash } from "viem";
import { liteForge } from "@/lib/chain";
import { CONTRACT_ADDRESS, TX_XP } from "@/lib/config";
import { redis, LEADERBOARD_KEY, xpKey, txsKey } from "@/lib/redis";

const publicClient = createPublicClient({
  chain: liteForge,
  transport: http(liteForge.rpcUrls.default.http[0]),
});

/**
 * Awards XP for a transaction, but only after verifying it directly on
 * chain: it must exist, be confirmed successful, be sent BY the claimed
 * address, and go TO the contract address. This is genuinely tamper-proof
 * (unlike the social tasks) — a user can't fake a transaction that never
 * happened. Each tx hash can only ever be credited once.
 */
export async function POST(req: NextRequest) {
  const { address, txHash } = (await req.json()) as {
    address?: string;
    txHash?: string;
  };

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }
  if (!txHash || !isHash(txHash)) {
    return NextResponse.json({ error: "Invalid tx hash" }, { status: 400 });
  }

  // Dedupe: SADD returns 0 if the hash was already recorded.
  const isNew = await redis.sadd(txsKey(address), txHash);
  if (!isNew) {
    return NextResponse.json(
      { error: "Transaction already credited" },
      { status: 409 }
    );
  }

  try {
    const [tx, receipt] = await Promise.all([
      publicClient.getTransaction({ hash: txHash as `0x${string}` }),
      publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` }),
    ]);

    const valid =
      receipt.status === "success" &&
      tx.from.toLowerCase() === address.toLowerCase() &&
      tx.to?.toLowerCase() === CONTRACT_ADDRESS.toLowerCase();

    if (!valid) {
      // Roll back the dedupe entry so a genuinely valid tx could be retried.
      await redis.srem(txsKey(address), txHash);
      return NextResponse.json(
        { error: "Transaction does not match this wallet/contract" },
        { status: 400 }
      );
    }
  } catch {
    await redis.srem(txsKey(address), txHash);
    return NextResponse.json(
      { error: "Could not verify transaction on chain yet, try again shortly" },
      { status: 400 }
    );
  }

  const key = xpKey(address);
  await redis.hincrby(key, "txCount", 1);
  const totalXp = await redis.hincrby(key, "xp", TX_XP);
  await redis.zadd(LEADERBOARD_KEY, { score: totalXp, member: address.toLowerCase() });

  return NextResponse.json({ xp: totalXp, awarded: TX_XP });
}
