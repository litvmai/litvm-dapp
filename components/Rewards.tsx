"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import {
  CHECKIN_XP,
  FOLLOW_XP,
  RETWEET_XP,
  COMMENT_XP,
  DISCORD_JOIN_XP,
  SWAP_XP,
  TX_XP,
} from "@/lib/config";
import { rankFor } from "@/lib/ranks";

const EARN = [
  { action: "Successful swap", xp: SWAP_XP, note: "Verified on the router, no daily cap" },
  { action: "Participate tx", xp: TX_XP, note: "Verified on LitVMCore" },
  { action: "Daily check-in", xp: CHECKIN_XP, note: "Once per UTC day" },
  { action: "Follow on X", xp: FOLLOW_XP, note: "Once per wallet" },
  { action: "Repost", xp: RETWEET_XP, note: "Once per wallet" },
  { action: "Comment", xp: COMMENT_XP, note: "Once per wallet" },
  { action: "Join Discord", xp: DISCORD_JOIN_XP, note: "Verified when guild id is set" },
];

export function Rewards() {
  const { address, isConnected } = useAccount();
  const [xp, setXp] = useState(0);
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "already" | "error">("idle");

  useEffect(() => {
    if (!address) {
      setXp(0);
      return;
    }
    fetch(`/api/social?address=${address}`)
      .then((r) => r.json())
      .then((d) => setXp(d.xp ?? 0))
      .catch(() => {});
  }, [address, status]);

  const { current, next, progress } = rankFor(xp);

  async function checkIn() {
    if (!address) return;
    setStatus("busy");
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setXp(data.xp ?? xp);
        setStatus("already");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setXp(data.xp ?? xp);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div id="rewards" className="card md:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label">Rewards</p>
          <h2 className="mt-1 text-2xl font-bold text-white">
            {xp.toLocaleString()} XP
            <span className="ml-2 text-base font-semibold text-neon-green">{current.name}</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {next
              ? `${next.min - xp} XP to ${next.name}`
              : "Top rank. Keep swapping to hold the leaderboard."}
          </p>
        </div>
        <button className="btn-primary" disabled={!isConnected || status === "busy"} onClick={checkIn}>
          {!isConnected
            ? "Connect to check in"
            : status === "busy"
            ? "Checking in…"
            : status === "done"
            ? `+${CHECKIN_XP} XP today`
            : status === "already"
            ? "Checked in today"
            : `Daily check-in +${CHECKIN_XP}`}
        </button>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-purple"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {EARN.map((row) => (
          <div key={row.action} className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/50 px-3 py-2">
            <div>
              <p className="text-sm text-slate-200">{row.action}</p>
              <p className="text-xs text-slate-500">{row.note}</p>
            </div>
            <span className="text-sm font-semibold text-neon-green">+{row.xp}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Swap and participate points are credited only after the transaction is confirmed on LiteForge.
        Social points are once per wallet. This is testnet XP, not a token.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/swap" className="btn-secondary">Swap for +{SWAP_XP} XP</Link>
        <Link href="/dashboard" className="btn-secondary">Social tasks</Link>
      </div>
      {status === "error" && (
        <p className="mt-3 text-xs text-red-300">Check-in failed. Redis may be offline.</p>
      )}
    </div>
  );
}
