"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { liteForge } from "@/lib/chain";

/**
 * Shows a banner when the wallet is on the wrong network.
 * `switchChain` asks the wallet to switch, and if LiteForge isn't known to
 * the wallet yet, wagmi automatically calls wallet_addEthereumChain.
 */
export function NetworkGuard() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();

  if (!isConnected || chainId === liteForge.id) return null;

  return (
    <div className="mt-2 flex flex-col items-start justify-between gap-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 sm:flex-row sm:items-center">
      <div>
        <p className="font-medium text-yellow-300">Wrong network</p>
        <p className="text-sm text-yellow-200/80">
          Please switch to {liteForge.name} (Chain ID {liteForge.id}).
        </p>
        {error && <p className="mt-1 text-xs text-red-400">{error.message}</p>}
      </div>
      <button
        className="btn-primary"
        disabled={isPending}
        onClick={() => switchChain({ chainId: liteForge.id })}
      >
        {isPending ? "Check your wallet…" : "Switch / Add network"}
      </button>
    </div>
  );
}
