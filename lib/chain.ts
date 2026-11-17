import { defineChain } from "viem";

/**
 * LitVM LiteForge testnet.
 * RainbowKit / wagmi use this to auto-add & switch the network in the wallet.
 * Infrastructure migrated from Caldera to Zeeve (Nov 2026).
 * Official: https://docs.litvm.com/get-started-on-testnet/network-configuration
 */
export const liteForge = defineChain({
  id: 4441,
  name: "LitVM LiteForge",
  nativeCurrency: { name: "zkLTC", symbol: "zkLTC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.liteforge.zeeve.net/"] },
  },
  blockExplorers: {
    default: {
      name: "LiteForge Explorer",
      url: "https://explorer.testnet.liteforge.zeeve.net",
    },
  },
  testnet: true,
});
