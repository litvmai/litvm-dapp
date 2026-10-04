"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { BaseError, parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CONTRACT_ADDRESS, DEFAULT_AMOUNT, TX_XP } from "@/lib/config";
import { contractAbi } from "@/lib/abi";
import { liteForge } from "@/lib/chain";

export function Participate() {
  const { address, isConnected, chainId } = useAccount();
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);

  const { data: balance } = useBalance({ address, chainId: liteForge.id });

  const { writeContract, data: hash, isPending, error, reset } =
    useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Once the tx is confirmed, ask the server to verify it on-chain and
  // award +5 XP. Fire-and-forget with its own small status, separate from
  // the send/confirm flow above so a failed XP call never blocks the
  // "transaction succeeded" message the user actually cares about.
  const [xpStatus, setXpStatus] = useState<"idle" | "awarding" | "awarded" | "error">(
    "idle"
  );
  useEffect(() => {
    if (!isSuccess || !hash || !address) return;
    setXpStatus("awarding");
    fetch("/api/tx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, txHash: hash }),
    })
      .then((res) => setXpStatus(res.ok ? "awarded" : "error"))
      .catch(() => setXpStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, hash]);

  // Validate the amount typed by the user
  let value: bigint | null = null;
  try {
    const v = parseEther(amount || "0");
    if (v > 0n) value = v;
  } catch {
    value = null;
  }
  const insufficient = value !== null && balance ? value > balance.value : false;
  const wrongNetwork = isConnected && chainId !== liteForge.id;

  function handleSend() {
    if (value === null) return;
    reset();
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: "participate",
      value,
      chainId: liteForge.id,
    });
  }

  const errorMsg = error
    ? error instanceof BaseError
      ? error.shortMessage
      : error.message
    : null;

  return (
    <div className="card">
      <p className="label">Participate</p>
      <p className="mt-2 text-sm text-slate-400">
        Send a small amount of zkLTC to the contract. Gas spent on this
        transaction is automatically tracked for a refund you can claim
        anytime below.
      </p>

      <label className="mt-5 block text-xs text-slate-500" htmlFor="amount">
        Amount (zkLTC)
      </label>
      <input
        id="amount"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(",", "."))}
        className="mt-1 w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-3 font-mono text-lg outline-none transition focus:border-neon-green focus:shadow-glow-green"
        placeholder={DEFAULT_AMOUNT}
      />

      {value === null && amount !== "" && (
        <p className="mt-2 text-xs text-red-400">Enter a valid amount above 0.</p>
      )}
      {insufficient && (
        <p className="mt-2 text-xs text-red-400">Insufficient zkLTC balance.</p>
      )}

      <div className="mt-5">
        {!isConnected ? (
          <ConnectButton />
        ) : (
          <button
            className="btn-primary w-full"
            onClick={handleSend}
            disabled={
              value === null ||
              insufficient ||
              wrongNetwork ||
              isPending ||
              confirming
            }
          >
            {wrongNetwork
              ? "Switch network first"
              : isPending
              ? "Confirm in wallet…"
              : confirming
              ? "Waiting for confirmation…"
              : `Send ${amount || "0"} zkLTC`}
          </button>
        )}
      </div>

      {errorMsg && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {errorMsg}
        </p>
      )}

      {isSuccess && hash && (
        <div className="mt-3 rounded-lg border border-neon-green/40 bg-neon-green/10 p-3 text-sm text-neon-green">
          ✅ Transaction successful!{" "}
          <a
            className="underline"
            target="_blank"
            rel="noreferrer"
            href={`${liteForge.blockExplorers.default.url}/tx/${hash}`}
          >
            View on explorer
          </a>
          <div className="mt-1 text-xs text-neon-green/80">
            {xpStatus === "awarding" && "Verifying on chain to award XP…"}
            {xpStatus === "awarded" && `+${TX_XP} XP awarded 🎉`}
            {xpStatus === "error" && "Could not award XP (already credited or verification failed)."}
          </div>
        </div>
      )}
    </div>
  );
}
