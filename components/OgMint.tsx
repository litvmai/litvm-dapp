"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { liteForge } from "@/lib/chain";
import { OG_ADDRESS, ogAbi } from "@/lib/og";

const ready = OG_ADDRESS !== "0x0000000000000000000000000000000000000000";

export function OgMint() {
  const { address, isConnected, chainId } = useAccount();
  const wrongNetwork = isConnected && chainId !== liteForge.id;
  const { data: price } = useReadContract({ address: OG_ADDRESS, abi: ogAbi, functionName: "price", query: { enabled: ready } });
  const { data: contentMinted } = useReadContract({ address: OG_ADDRESS, abi: ogAbi, functionName: "contentMinted", query: { enabled: ready } });
  const { data: saleMinted } = useReadContract({ address: OG_ADDRESS, abi: ogAbi, functionName: "saleMinted", query: { enabled: ready } });
  const { data: claimed } = useReadContract({
    address: OG_ADDRESS,
    abi: ogAbi,
    functionName: "claimed",
    args: address ? [address] : undefined,
    query: { enabled: ready && !!address },
  });
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  function mint() {
    if (!price) return;
    writeContract({ address: OG_ADDRESS, abi: ogAbi, functionName: "mint", value: price, chainId: liteForge.id });
  }

  return (
    <div className="card">
      <p className="label">litvmai OG</p>
      <p className="mt-2 text-sm text-slate-400">5,000 badges. 4,000 for approved content, 1,000 for sale. One per wallet.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-white/10 p-3">Content {contentMinted?.toString() ?? "0"} / 4000</div>
        <div className="rounded-2xl border border-white/10 p-3">Sale {saleMinted?.toString() ?? "0"} / 1000</div>
      </div>
      <p className="mt-4 text-sm text-slate-300">Price: {price ? `${formatEther(price)} zkLTC` : "set on deploy"}</p>
      {!ready ? (
        <p className="mt-4 text-sm text-yellow-300">Contract is not deployed yet. Deploy in Remix, then paste the address.</p>
      ) : !isConnected ? (
        <p className="mt-4 text-sm text-slate-400">Connect your wallet to mint.</p>
      ) : wrongNetwork ? (
        <p className="mt-4 text-sm text-yellow-300">Switch to LiteForge.</p>
      ) : claimed ? (
        <p className="mt-4 text-sm text-emerald-300">This wallet already has an OG badge.</p>
      ) : (
        <button className="btn-primary mt-4 w-full" disabled={!price || isPending || isLoading} onClick={mint}>
          {isPending || isLoading ? "Minting..." : "Mint OG"}
        </button>
      )}
      {isSuccess && <p className="mt-3 text-sm text-emerald-300">Mint confirmed.</p>}
      {error && <p className="mt-3 text-xs text-red-300">{error.message}</p>}
    </div>
  );
}
