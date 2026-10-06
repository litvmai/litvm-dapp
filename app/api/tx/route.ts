import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, isAddress, isHash } from "viem";
import { liteForge } from "@/lib/chain";
import { CONTRACT_ADDRESS, SWAP_XP, TX_XP } from "@/lib/config";
import { ROUTER_ADDRESS } from "@/lib/swap";
import { redis, LEADERBOARD_KEY, xpKey, txsKey } from "@/lib/redis";

const publicClient = createPublicClient({
  chain: liteForge,
  transport: http(liteForge.rpcUrls.default.http[0]),
});

/**
 * Awards XP after verifying the tx on LiteForge: confirmed, sent by the
 * claimed wallet, and sent to LitVMCore (+5) or the verified router (+10).
 * Each hash can only be credited once.
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

  const isNew = await redis.sadd(txsKey(address), txHash);
  if (!isNew) {
    return NextResponse.json({ error: "Transaction already credited" }, { status: 409 });
  }

  try {
    const [tx, receipt] = await Promise.all([
      publicClient.getTransaction({ hash: txHash as `0x${string}` }),
      publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` }),
    ]);

    const to = tx.to?.toLowerCase();
    const awarded =
      to === CONTRACT_ADDRESS.toLowerCase()
        ? TX_XP
        : to === ROUTER_ADDRESS.toLowerCase()
        ? SWAP_XP
        : 0;
    const valid =
      receipt.status === "success" &&
      tx.from.toLowerCase() === address.toLowerCase() &&
      awarded > 0;

    if (!valid) {
      await redis.srem(txsKey(address), txHash);
      return NextResponse.json(
        { error: "Transaction does not match this wallet or a rewarded contract" },
        { status: 400 }
      );
    }

    const key = xpKey(address);
    await redis.hincrby(key, "txCount", 1);
    const totalXp = await redis.hincrby(key, "xp", awarded);
    await redis.zadd(LEADERBOARD_KEY, { score: totalXp, member: address.toLowerCase() });
    return NextResponse.json({ xp: totalXp, awarded });
  } catch {
    await redis.srem(txsKey(address), txHash);
    return NextResponse.json(
      { error: "Could not verify transaction on chain yet, try again shortly" },
      { status: 400 }
    );
  }
}
