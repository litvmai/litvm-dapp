import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "LitVM LiteForge dApp",
  description: "Swap zkLTC on the LitVM LiteForge testnet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="bg-fx" aria-hidden="true">
          <div className="bg-aurora" />
          <div className="bg-grid" />
          <div className="bg-nodes" />
          <div className="bg-vignette" />
          <div className="bg-noise" />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
