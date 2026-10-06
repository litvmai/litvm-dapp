import type { Address } from "viem";

/**
 * LiteForgeRouter — verified on LiteForge explorer (source code matches
 * deployed bytecode, Partial Match). Standard Uniswap V2-style AMM:
 * 0.3% swap fee, constant-product pricing, no owner/admin backdoors.
 * https://liteforge.explorer.caldera.xyz/address/0x5283293BDE655Eb5e8bFC590B36377843C3D686b
 */
export const ROUTER_ADDRESS: Address = "0x5283293BDE655Eb5e8bFC590B36377843C3D686b";
export const FACTORY_ADDRESS: Address = "0x444944148D6E09549c815da4D58573C28E436a87";
export const WZKLTC_ADDRESS: Address = "0x60A84eBC3483fEFB251B76Aea5B8458026Ef4bea";

/** Default slippage tolerance (1%) and tx deadline (20 minutes). */
export const DEFAULT_SLIPPAGE_BPS = 100n; // 1.00%
export const DEADLINE_SECONDS = 20 * 60;

export const routerAbi = [
  {
    type: "function",
    name: "swapExactETHForTokens",
    stateMutability: "payable",
    inputs: [
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "swapExactTokensForETH",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "swapExactTokensForTokens",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "getAmountsOut",
    stateMutability: "view",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "path", type: "address[]" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
] as const;

/** Native "pseudo-address" used in the UI to represent zkLTC itself. */
export const NATIVE = "NATIVE" as const;

/**
 * Curated token list for the Swap dropdown. Each entry has a liquidity
 * pool already funded against zkLTC via LiteForgeRouter — verified by us
 * directly on-chain, not just claimed.
 */
export const TOKEN_LIST: { address: Address; symbol: string; name: string }[] = [
  {
    address: "0x43E64985dC33723c42e46829b6f064Aa1C072958",
    symbol: "LITVMAI",
    name: "LitVM AI",
  },
  {
    address: "0x0DF8030A7FAec436d466d9D3d8290b3e3b6b69d9",
    symbol: "TYV",
    name: "Tyvion",
  },
  {
    address: "0x648d92EF4C9B6DAb0a3F370A89Af2Db9C7186Eb7",
    symbol: "EVR",
    name: "Evyra",
  },
  {
    address: "0x614175F4219C5eC7cE3A3885feEA7357BB19E2fd",
    symbol: "THR",
    name: "Thryon",
  },
];
