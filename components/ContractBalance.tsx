"use client";

import { useBalance } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/config";
import { liteForge } from "@/lib/chain";

export function ContractBalance() {
  // Reads directly from the RPC, so it works even when no wallet is connected.
  const { data, isLoading, isError } = useBalance({
    address: CONTRACT_ADDRESS,
    chainId: liteForge.id,
    query: { refetchInterval: 10_000 },
  });

  return (
    <div className="card">
      <p className="label">Contract balance</p>
      <p className="mt-3 text-2xl font-bold">
        {isLoading ? "…" : isError || !data ? "Unavailable" : data.formatted}{" "}
        <span className="text-base text-neon-purple">zkLTC</span>
      </p>
      <a
        href={`${liteForge.blockExplorers.default.url}/address/${CONTRACT_ADDRESS}`}
        target="_blank"
        rel="noreferrer"
        className="mt-3 block break-all font-mono text-xs text-slate-400 underline decoration-neon-green/40 hover:text-neon-green"
      >
        {CONTRACT_ADDRESS}
      </a>
    </div>
  );
}
