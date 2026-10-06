"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="sticky top-0 z-20 -mx-4 mb-2 flex items-center justify-between gap-3 border-b border-white/5 bg-ink-950/80 px-4 py-4 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:bg-ink-900/40 sm:px-5">
      <Link href="/" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-neon-green to-neon-purple shadow-glow-green" />
        <span className="text-lg font-bold tracking-tight">LitVM</span>
      </Link>
      <nav className="flex items-center gap-4">
        <Link href="/#rewards" className="hidden text-sm text-slate-400 transition hover:text-neon-green sm:block">
          XP
        </Link>
        <Link
          href="/swap"
          className="hidden text-sm text-slate-400 transition hover:text-neon-green sm:block"
        >
          Swap
        </Link>
        <Link
          href="/dashboard"
          className="hidden text-sm text-slate-400 transition hover:text-neon-green sm:block"
        >
          Dashboard
        </Link>
        <ConnectButton showBalance={false} chainStatus="icon" />
      </nav>
    </header>
  );
}
