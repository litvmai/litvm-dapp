"use client";

import { useAccount, useBalance } from "wagmi";
import { liteForge } from "@/lib/chain";

/** Formats a decimal string to at most `max` decimals without rounding up. */
function trim(value: string, max = 6) {
  const [i, d = ""] = value.split(".");
  return d ? `${i}.${d.slice(0, max)}`.replace(/\.?0+$/, "") || "0" : i;
}

export function WalletInfo() {
  const { address, isConnected } = useAccount();
  const { data, isLoading } = useBalance({
    address,
    chainId: liteForge.id,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  return (
    <div className="card">
      <p className="label">Your wallet</p>
      {!isConnected ? (
        <p className="mt-3 text-slate-400">Connect your wallet to see details.</p>
      ) : (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs text-slate-500">Address</p>
            <p className="break-all font-mono text-sm text-neon-green">{address}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Balance</p>
            <p className="text-2xl font-bold">
              {isLoading || !data ? "…" : trim(data.formatted)}{" "}
              <span className="text-base text-neon-purple">zkLTC</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
