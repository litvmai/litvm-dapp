"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { FOLLOW_XP, RETWEET_XP, COMMENT_XP, DISCORD_JOIN_XP } from "@/lib/config";

/**
 * Compact summary shown on the main page. The full Connect X / Connect
 * Discord / claim-XP flow lives on /dashboard (see SocialDashboard.tsx) —
 * this card just shows current progress and links there.
 */
export function SocialTasks() {
  const { address } = useAccount();
  const [xp, setXp] = useState(0);
  const [connections, setConnections] = useState({ x: false, discord: false });

  useEffect(() => {
    if (!address) {
      setXp(0);
      setConnections({ x: false, discord: false });
      return;
    }
    fetch(`/api/social?address=${address}`)
      .then((r) => r.json())
      .then((d) => {
        setXp(d.xp ?? 0);
        setConnections({ x: !!d.xHandle, discord: !!d.discordUsername });
      })
      .catch(() => {});
  }, [address]);

  const totalXp = FOLLOW_XP + RETWEET_XP + COMMENT_XP + DISCORD_JOIN_XP;

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="label">Social tasks</p>
        <div className="rounded-full border border-neon-purple/40 bg-neon-purple/10 px-3 py-1 text-xs font-semibold text-neon-purple">
          {xp} XP
        </div>
      </div>

      <p className="mt-2 text-sm text-slate-400">
        Social tasks add up to {totalXp} XP, once per wallet. Swap XP is separate and unlimited.
      </p>

      {address && (
        <div className="mt-3 flex gap-2 text-xs">
          <span
            className={`rounded-full px-2 py-1 ${connections.x ? "bg-neon-green/10 text-neon-green" : "bg-white/5 text-slate-500"}`}
          >
            {connections.x ? "X connected \u2713" : "X not connected"}
          </span>
          <span
            className={`rounded-full px-2 py-1 ${connections.discord ? "bg-neon-green/10 text-neon-green" : "bg-white/5 text-slate-500"}`}
          >
            {connections.discord ? "Discord connected \u2713" : "Discord not connected"}
          </span>
        </div>
      )}

      <Link href="/dashboard" className="btn-primary mt-4 block w-full text-center">
        Open Social Dashboard →
      </Link>
    </div>
  );
}
