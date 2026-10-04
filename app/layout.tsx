import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "LitVM LiteForge dApp",
  description: "Participate on the LitVM LiteForge testnet",
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
          <span className="blob blob-a" />
          <span className="blob blob-b" />
          <span className="blob blob-c" />
          <div className="bg-grid" />
          <div className="bg-noise" />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
