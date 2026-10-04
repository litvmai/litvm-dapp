"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  FOLLOW_URL,
  TWEET_URL,
  X_HANDLE,
  FOLLOW_XP,
  RETWEET_XP,
  COMMENT_XP,
  DISCORD_JOIN_XP,
} from "@/lib/config";

type Task = "follow" | "retweet" | "comment" | "join_discord";
type Progress = {
  follow: boolean;
  retweet: boolean;
  comment: boolean;
  join_discord: boolean;
  xp: number;
  txCount: number;
  xHandle: string | null;
  discordUsername: string | null;
  discordJoinedGuild: boolean;
};
const EMPTY: Progress = {
  follow: false,
  retweet: false,
  comment: false,
  join_discord: false,
  xp: 0,
  txCount: 0,
  xHandle: null,
  discordUsername: null,
  discordJoinedGuild: false,
};

export function SocialDashboard() {
  const { address } = useAccount();
  const params = useSearchParams();
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [loading, setLoading] = useState<Task | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function refresh() {
    if (!address) {
      setProgress(EMPTY);
      return;
    }
    const res = await fetch(`/api/social?address=${address}`);
    if (res.ok) setProgress(await res.json());
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Show a notice after returning from an OAuth redirect.
  useEffect(() => {
    if (params.get("x_connected")) setNotice("✅ X account connected!");
    else if (params.get("discord_connected")) setNotice("✅ Discord account connected!");
    else if (params.get("x_error")) setNotice("❌ Could not connect X. Try again.");
    else if (params.get("discord_error")) setNotice("❌ Could not connect Discord. Try again.");
    if (params.toString()) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  async function claim(task: Task) {
    if (!address || loading) return;
    setLoading(task);
    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, task }),
      });
      const data = await res.json();
      if (res.ok) setProgress(data);
      else setNotice(`❌ ${data.error ?? "Could not claim XP"}`);
    } finally {
      setLoading(null);
    }
  }

  if (!address) {
    return (
      <div className="card text-center">
        <p className="label">Social dashboard</p>
        <p className="mt-3 text-slate-400">
          Connect your wallet to connect your accounts and claim XP.
        </p>
        <div className="mt-4 flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notice && (
        <div className="card border-neon-purple/40 bg-neon-purple/5 text-sm">
          {notice}
        </div>
      )}

      <div className="card flex items-center justify-between">
        <p className="label">Total XP</p>
        <div className="rounded-full border border-neon-purple/40 bg-neon-purple/10 px-3 py-1 text-sm font-semibold text-neon-purple">
          {progress.xp} XP
        </div>
      </div>

      {/* Connect accounts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ConnectCard
          platform="X (Twitter)"
          connectedAs={progress.xHandle ? `@${progress.xHandle}` : null}
          href={`/api/auth/x/start?address=${address}`}
        />
        <ConnectCard
          platform="Discord"
          connectedAs={progress.discordUsername}
          subtext={
            progress.discordUsername
              ? progress.discordJoinedGuild
                ? "✅ Verified member of our server"
                : "⚠️ Not found in our server yet"
              : undefined
          }
          href={`/api/auth/discord/start?address=${address}`}
        />
      </div>

      {/* Tasks */}
      <div className="card">
        <p className="label">Tasks</p>
        <div className="mt-4 space-y-3">
          <TaskRow
            title={`Follow @${X_HANDLE} on X`}
            xp={FOLLOW_XP}
            href={FOLLOW_URL}
            done={progress.follow}
            locked={!progress.xHandle}
            lockedReason="Connect X first"
            disabled={loading === "follow"}
            onClaim={() => claim("follow")}
          />
          <TaskRow
            title="Like & Retweet the post"
            xp={RETWEET_XP}
            href={TWEET_URL}
            done={progress.retweet}
            locked={!progress.xHandle}
            lockedReason="Connect X first"
            disabled={loading === "retweet"}
            onClaim={() => claim("retweet")}
          />
          <TaskRow
            title="Comment on the post"
            xp={COMMENT_XP}
            href={TWEET_URL}
            done={progress.comment}
            locked={!progress.xHandle}
            lockedReason="Connect X first"
            disabled={loading === "comment"}
            onClaim={() => claim("comment")}
          />
          <TaskRow
            title="Join our Discord server"
            xp={DISCORD_JOIN_XP}
            done={progress.join_discord}
            locked={!progress.discordJoinedGuild}
            lockedReason={
              progress.discordUsername
                ? "Join the server, then reconnect Discord"
                : "Connect Discord first"
            }
            disabled={loading === "join_discord"}
            onClaim={() => claim("join_discord")}
            verified
          />
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
          Follow/retweet/comment are self-reported but require a verified X
          login. &quot;Join our Discord&quot; is checked for real against
          Discord&apos;s own membership list — it can&apos;t be faked.
        </p>
      </div>
    </div>
  );
}

function ConnectCard({
  platform,
  connectedAs,
  subtext,
  href,
}: {
  platform: string;
  connectedAs: string | null;
  subtext?: string;
  href: string;
}) {
  return (
    <div className="card">
      <p className="label">{platform}</p>
      {connectedAs ? (
        <>
          <p className="mt-2 text-lg font-semibold text-neon-green">{connectedAs}</p>
          {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
          <a href={href} className="btn-secondary mt-3 inline-block text-xs">
            Reconnect
          </a>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-400">Not connected</p>
          <a href={href} className="btn-primary mt-3 inline-block">
            Connect {platform}
          </a>
        </>
      )}
    </div>
  );
}

function TaskRow({
  title,
  xp,
  href,
  done,
  locked,
  lockedReason,
  disabled,
  onClaim,
  verified,
}: {
  title: string;
  xp: number;
  href?: string;
  done: boolean;
  locked: boolean;
  lockedReason: string;
  disabled: boolean;
  onClaim: () => void;
  verified?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink-900/60 p-3">
      <div>
        <p className="text-sm">
          {title}{" "}
          <span className="ml-1 rounded-full bg-neon-green/10 px-2 py-0.5 text-[11px] font-semibold text-neon-green">
            +{xp} XP
          </span>
          {verified && (
            <span className="ml-1 rounded-full bg-neon-purple/10 px-2 py-0.5 text-[11px] font-semibold text-neon-purple">
              verified
            </span>
          )}
        </p>
        {locked && !done && (
          <p className="mt-1 text-xs text-yellow-500/80">{lockedReason}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {href && (
          <a href={href} target="_blank" rel="noreferrer" className="btn-secondary">
            Open X
          </a>
        )}
        <button
          className="btn-primary px-3 py-2 text-xs"
          disabled={done || disabled || locked}
          onClick={onClaim}
        >
          {done ? "Claimed ✓" : "I did this"}
        </button>
      </div>
    </div>
  );
}
