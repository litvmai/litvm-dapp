"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { BaseError, formatUnits, parseUnits, type Address, isAddress } from "viem";
import { liteForge } from "@/lib/chain";
import { CONTRACT_ADDRESS } from "@/lib/config";
import { contractAbi } from "@/lib/abi";
import {
  ROUTER_ADDRESS,
  WZKLTC_ADDRESS,
  routerAbi,
  erc20Abi,
  DEFAULT_SLIPPAGE_BPS,
  DEADLINE_SECONDS,
  NATIVE,
  TOKEN_LIST,
} from "@/lib/swap";

type Side = typeof NATIVE | Address;

/**
 * Swap UI for LiteForgeRouter — a verified, standard Uniswap V2-style AMM
 * on LiteForge (see lib/swap.ts for the explorer link). Supports zkLTC <->
 * any ERC-20 token by contract address. No curated token list exists yet,
 * so the "to" token is entered manually — always double-check the address
 * on the block explorer before trusting a token.
 */
export function Swap() {
  const { address, isConnected, chainId } = useAccount();
  const [fromSide, setFromSide] = useState<Side>(NATIVE);
  const [toToken, setToToken] = useState<string>(TOKEN_LIST[0]?.address ?? "");
  const [customToken, setCustomToken] = useState(false);
  const [amountIn, setAmountIn] = useState("0.01");
  const [slippageBps, setSlippageBps] = useState(DEFAULT_SLIPPAGE_BPS);

  const wrongNetwork = isConnected && chainId !== liteForge.id;
  const toAddress = isAddress(toToken) ? (toToken as Address) : undefined;
  const fromIsNative = fromSide === NATIVE;
  const fromTokenAddress = fromIsNative ? WZKLTC_ADDRESS : (fromSide as Address);

  const path = useMemo<Address[] | null>(() => {
    if (fromIsNative) return toAddress ? [WZKLTC_ADDRESS, toAddress] : null;
    return [fromTokenAddress, WZKLTC_ADDRESS];
  }, [fromIsNative, fromTokenAddress, toAddress]);

  // Decimals for "from" token (native zkLTC = 18)
  const { data: fromDecimals } = useReadContract({
    address: fromIsNative ? undefined : fromTokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: !fromIsNative },
  });
  const { data: toDecimals } = useReadContract({
    address: toAddress,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: !!toAddress },
  });
  const { data: toSymbol } = useReadContract({
    address: toAddress,
    abi: erc20Abi,
    functionName: "symbol",
    query: { enabled: !!toAddress },
  });

  const decimalsIn = fromIsNative ? 18 : fromDecimals ?? 18;
  const decimalsOut = fromIsNative ? toDecimals ?? 18 : 18;

  let amountInWei: bigint | null = null;
  try {
    amountInWei = amountIn ? parseUnits(amountIn, decimalsIn) : null;
  } catch {
    amountInWei = null;
  }

  // Live quote
  const { data: quote } = useReadContract({
    address: ROUTER_ADDRESS,
    abi: routerAbi,
    functionName: "getAmountsOut",
    args: amountInWei && path ? [amountInWei, path] : undefined,
    query: { enabled: !!amountInWei && !!path, refetchInterval: 8_000 },
  });
  const amountOutWei = quote && Array.isArray(quote) ? quote[quote.length - 1] : undefined;
  const amountOutMin = amountOutWei
    ? (amountOutWei * (10_000n - slippageBps)) / 10_000n
    : undefined;

  // Balances
  const { data: nativeBalance } = useBalance({
    address,
    chainId: liteForge.id,
    query: { enabled: fromIsNative },
  });
  const { data: tokenBalance } = useReadContract({
    address: fromIsNative ? undefined : fromTokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !fromIsNative && !!address },
  });
  const fromBalanceWei = fromIsNative ? nativeBalance?.value : (tokenBalance as bigint | undefined);
  const insufficient =
    amountInWei !== null && fromBalanceWei !== undefined && amountInWei > fromBalanceWei;

  // Allowance (only relevant when "from" is an ERC-20)
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: fromIsNative ? undefined : fromTokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, ROUTER_ADDRESS] : undefined,
    query: { enabled: !fromIsNative && !!address },
  });
  const needsApproval =
    !fromIsNative && amountInWei !== null && (allowance === undefined || allowance < amountInWei);

  const { writeContract: approve, data: approveHash, isPending: approving } = useWriteContract();
  const { isLoading: approveConfirming, isSuccess: approveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash });
  useEffect(() => {
    if (approveSuccess) refetchAllowance();
  }, [approveSuccess, refetchAllowance]);

  const { writeContract: swap, data: swapHash, isPending: swapping, error: swapError, reset: resetSwap } =
    useWriteContract();
  const { isLoading: swapConfirming, isSuccess: swapSuccess } = useWaitForTransactionReceipt({
    hash: swapHash,
  });

  function flip() {
    if (fromIsNative) {
      if (toAddress) setFromSide(toAddress);
      setToToken("");
    } else {
      setToToken(fromTokenAddress);
      setFromSide(NATIVE);
    }
  }

  function handleApprove() {
    if (!amountInWei) return;
    approve({
      address: fromTokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [ROUTER_ADDRESS, amountInWei],
      chainId: liteForge.id,
    });
  }

  function handleSwap() {
    if (!amountInWei || !amountOutMin || !path || !address) return;
    resetSwap();
    const deadline = BigInt(Math.floor(Date.now() / 1000) + DEADLINE_SECONDS);

    if (fromIsNative) {
      // Routed through our own LitVMCore contract (a thin wrapper around
      // LiteForgeRouter) so this swap's gas is tracked for a refund —
      // see lib/swap.ts and GasRefund.tsx.
      swap({
        address: CONTRACT_ADDRESS,
        abi: contractAbi,
        functionName: "swapZkltcForTokens",
        args: [amountOutMin, path, deadline],
        value: amountInWei,
        chainId: liteForge.id,
      });
    } else {
      swap({
        address: ROUTER_ADDRESS,
        abi: routerAbi,
        functionName: "swapExactTokensForETH",
        args: [amountInWei, amountOutMin, path, address, deadline],
        chainId: liteForge.id,
      });
    }
  }

  const errorMsg = swapError
    ? swapError instanceof BaseError
      ? swapError.shortMessage
      : swapError.message
    : null;

  return (
    <div className="card mx-auto max-w-md">
      <div className="flex items-center justify-between">
        <p className="label">Swap</p>
        <SlippagePicker value={slippageBps} onChange={setSlippageBps} />
      </div>

      {/* FROM */}
      <div className="mt-4 rounded-xl border border-white/10 bg-ink-900/60 p-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>You pay</span>
          {fromBalanceWei !== undefined && (
            <button
              className="hover:text-neon-green"
              onClick={() =>
                setAmountIn(formatUnits(fromBalanceWei, fromIsNative ? 18 : decimalsIn))
              }
            >
              Balance: {Number(formatUnits(fromBalanceWei, fromIsNative ? 18 : decimalsIn)).toFixed(4)}
            </button>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <input
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value.replace(",", "."))}
            inputMode="decimal"
            className="w-full bg-transparent text-2xl font-semibold outline-none"
            placeholder="0.0"
          />
          <span className="shrink-0 rounded-lg bg-ink-700 px-3 py-1.5 text-sm font-semibold text-neon-green">
            {fromIsNative ? "zkLTC" : "Token"}
          </span>
        </div>
      </div>

      {/* FLIP */}
      <div className="-my-2 flex justify-center">
        <button
          onClick={flip}
          className="z-10 rounded-full border border-white/10 bg-ink-800 p-2 text-slate-400 transition hover:text-neon-green"
          aria-label="Flip direction"
        >
          ⇅
        </button>
      </div>

      {/* TO */}
      <div className="rounded-xl border border-white/10 bg-ink-900/60 p-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>You receive</span>
          {toSymbol ? <span>{String(toSymbol)}</span> : null}
        </div>
        <div className="mt-1 text-2xl font-semibold text-slate-200">
          {amountOutWei ? Number(formatUnits(amountOutWei, decimalsOut)).toFixed(6) : "0.0"}
        </div>
        {!fromIsNative ? (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="rounded-lg bg-ink-700 px-3 py-1.5 font-semibold text-neon-purple">
              zkLTC
            </span>
            <span className="text-slate-500">fixed when paying with a token</span>
          </div>
        ) : customToken ? (
          <div className="mt-2 space-y-1.5">
            <input
              value={toToken}
              onChange={(e) => setToToken(e.target.value.trim())}
              placeholder="Paste token contract address (0x…)"
              className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 font-mono text-xs outline-none focus:border-neon-green"
            />
            <button
              className="text-[11px] text-slate-500 underline hover:text-neon-green"
              onClick={() => {
                setCustomToken(false);
                setToToken(TOKEN_LIST[0]?.address ?? "");
              }}
            >
              ← choose from list instead
            </button>
          </div>
        ) : (
          <div className="mt-2 space-y-1.5">
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm outline-none focus:border-neon-green"
            >
              {TOKEN_LIST.map((t) => (
                <option key={t.address} value={t.address}>
                  {t.symbol} — {t.name}
                </option>
              ))}
            </select>
            <button
              className="text-[11px] text-slate-500 underline hover:text-neon-green"
              onClick={() => {
                setCustomToken(true);
                setToToken("");
              }}
            >
              Paste a different token address instead
            </button>
          </div>
        )}
      </div>

      {toToken && !toAddress && (
        <p className="mt-2 text-xs text-red-400">That doesn&apos;t look like a valid address.</p>
      )}
      {insufficient && <p className="mt-2 text-xs text-red-400">Insufficient balance.</p>}

      <p className="mt-3 text-[11px] text-slate-500">
        {fromIsNative ? (
          <>
            Routed through our own{" "}
            <a
              href={`${liteForge.blockExplorers.default.url}/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-neon-green"
            >
              LitVMCore
            </a>{" "}
            contract (gas is tracked for a refund), which forwards to{" "}
          </>
        ) : (
          "Routes directly through "
        )}
        <a
          href={`${liteForge.blockExplorers.default.url}/address/${ROUTER_ADDRESS}`}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-neon-green"
        >
          LiteForgeRouter
        </a>{" "}
        — verified source, standard 0.3% AMM. Always double-check any token
        address yourself before swapping.
      </p>

      <div className="mt-4">
        {!isConnected ? (
          <p className="text-center text-sm text-slate-400">Connect your wallet to swap.</p>
        ) : wrongNetwork ? (
          <p className="text-center text-sm text-yellow-400">Switch to LiteForge to swap.</p>
        ) : needsApproval ? (
          <button
            className="btn-primary w-full"
            disabled={!amountInWei || approving || approveConfirming}
            onClick={handleApprove}
          >
            {approving || approveConfirming ? "Approving…" : "Approve"}
          </button>
        ) : (
          <button
            className="btn-primary w-full"
            disabled={!amountInWei || !path || !amountOutWei || insufficient || swapping || swapConfirming}
            onClick={handleSwap}
          >
            {swapping
              ? "Confirm in wallet…"
              : swapConfirming
              ? "Swapping…"
              : "Swap"}
          </button>
        )}
      </div>

      {errorMsg && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {errorMsg}
        </p>
      )}
      {swapSuccess && swapHash && (
        <div className="mt-3 rounded-lg border border-neon-green/40 bg-neon-green/10 p-3 text-sm text-neon-green">
          ✅ Swap successful!{" "}
          <a
            className="underline"
            target="_blank"
            rel="noreferrer"
            href={`${liteForge.blockExplorers.default.url}/tx/${swapHash}`}
          >
            View on explorer
          </a>
        </div>
      )}
    </div>
  );
}

function SlippagePicker({
  value,
  onChange,
}: {
  value: bigint;
  onChange: (v: bigint) => void;
}) {
  const options = [50n, 100n, 300n]; // 0.5% / 1% / 3%
  return (
    <div className="flex items-center gap-1 text-xs">
      {options.map((bps) => (
        <button
          key={bps.toString()}
          onClick={() => onChange(bps)}
          className={`rounded-full px-2 py-1 ${
            value === bps
              ? "bg-neon-green/15 text-neon-green"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {Number(bps) / 100}%
        </button>
      ))}
    </div>
  );
}
