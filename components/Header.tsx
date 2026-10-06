"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const links = [
  { href: "/", label: "Swap" },
  { href: "/leaderboard", label: "Board" },
  { href: "/dashboard", label: "Tasks" },
];

export function Header() {
  const path = usePathname();
  return (
    <header className="sticky top-3 z-20 mb-6 flex items-center justify-between gap-3 rounded-full border border-white/10 bg-ink-950/80 px-3 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-4">
      <Link href="/" className="flex items-center pl-1">
        <img
          src="/logo.png"
          alt="litvmai"
          className="h-9 w-auto object-contain mix-blend-screen"
        />
      </Link>
      <nav className="hidden items-center gap-1 sm:flex">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-3 py-1.5 text-sm ${path === l.href ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <ConnectButton showBalance={false} chainStatus="icon" />
    </header>
  );
}
