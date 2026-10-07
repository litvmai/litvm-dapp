import type { Address } from "viem";

/** Set after Remix deploy. Zero address hides mint until then. */
export const OG_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

export const ogAbi = [
  { type: "function", name: "price", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "contentMinted", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "saleMinted", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "claimed", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "mint", stateMutability: "payable", inputs: [], outputs: [] },
] as const;
