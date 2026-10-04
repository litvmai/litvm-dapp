"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

type Entry = { address: string; xp: number };

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function Leaderboard() {
  const { address } = useAccount();
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/leaderboard?limit=20");
        const data = await res.json();
        if (!cancelled) setEntries(data.entries ?? []);
      } catch {
        if (!cancelled) setEntries([]);
      }
    }
    load();
    const id = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="card md:col-span-2">
      <p className="label">Leaderboard</p>
      <p className="mt-1 text-sm text-slate-400">
        Ranked by total XP: social tasks + verified on-chain transactions.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="pb-2 pr-3">#</th>
              <th className="pb-2 pr-3">Wallet</th>
              <th className="pb-2 text-right">XP</th>
            </tr>
          </thead>
          <tbody>
            {entries === null && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {entries?.length === 0 && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-slate-500">
                  No one has earned XP yet — be the first!
                </td>
              </tr>
            )}
            {entries?.map((e, i) => {
              const isMe = address && e.address.toLowerCase() === address.toLowerCase();
              return (
                <tr
                  key={e.address}
                  className={`border-t border-white/5 ${isMe ? "bg-neon-green/5" : ""}`}
                >
                  <td className="py-2 pr-3 text-slate-400">{i + 1}</td>
                  <td className="py-2 pr-3 font-mono">
                    {short(e.address)}
                    {isMe && (
                      <span className="ml-2 rounded-full bg-neon-green/15 px-2 py-0.5 text-[10px] font-semibold text-neon-green">
                        YOU
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-right font-semibold text-neon-purple">
                    {e.xp}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
