import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { liteForge } from "./chain";

export const wagmiConfig = getDefaultConfig({
  appName: "LitVM LiteForge dApp",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "MISSING_PROJECT_ID",
  chains: [liteForge],
  transports: {
    [liteForge.id]: http(liteForge.rpcUrls.default.http[0]),
  },
  ssr: true, // required for Next.js App Router
});
