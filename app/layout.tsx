import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "litvmai",
  description: "litvmai swap desk on LiteForge testnet",
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
          <div className="orb orb-a" />
          <div className="orb orb-b" />
          <div className="orb orb-c" />
          <div className="bg-grid" />
          <div className="bg-beam" />
        </div>
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
