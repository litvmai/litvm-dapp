"use client";

import { useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { CONTRACT_ADDRESS } from "@/lib/config";
import { contractAbi } from "@/lib/abi";
import { liteForge } from "@/lib/chain";

/**
 * Lets a user claim back the zkLTC gas they've spent interacting with
 * LitVMCore (participate() and swapZkltcForTokens()). See LitVMCore.sol:
 * the owner can never withdraw into this reserved refund balance.
 */
export function GasRefund() {
  const { address, isConnected, chainId } = useAccount();
  const wrongNetwork = isConnected && chainId !== liteForge.id;

  const { data: owed, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: "refundOwed",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) refetch();
  }, [isSuccess, refetch]);

  function claim() {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: "claimGasRefund",
      chainId: liteForge.id,
    });
  }

  const owedWei = (owed as bigint | undefined) ?? 0n;
  const hasRefund = owedWei > 0n;

  if (!address) return null;

  return (
    <div className="card">
      <p className="label">Gas refund</p>
      <p className="mt-2 text-sm text-slate-400">
        Gas spent on Participate and Swap (via this contract) is tracked
        automatically — claim it back anytime.
      </p>
      <div className="mt-4 text-2xl font-bold text-neon-green">
        {Number(formatEther(owedWei)).toFixed(6)} <span className="text-base text-neon-purple">zkLTC</span>
      </div>
      <button
        className="btn-primary mt-4 w-full"
        disabled={!hasRefund || wrongNetwork || isPending || confirming}
        onClick={claim}
      >
        {wrongNetwork
          ? "Switch network first"
          : isPending
          ? "Confirm in wallet…"
          : confirming
          ? "Claiming…"
          : hasRefund
          ? "Claim refund"
          : "Nothing to claim yet"}
      </button>
      {error && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {error.message}
        </p>
      )}
      {isSuccess && (
        <p className="mt-3 rounded-lg border border-neon-green/40 bg-neon-green/10 p-3 text-sm text-neon-green">
          ✅ Refund claimed!
        </p>
      )}
    </div>
  );
}
