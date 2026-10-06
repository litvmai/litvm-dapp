"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const links = [
  { href: "/", label: "Swap" },
  { href: "/#xp", label: "XP" },
  { href: "/dashboard", label: "Tasks" },
];

export function Header() {
  const path = usePathname();
  return (
    <header className="sticky top-3 z-20 mb-6 flex items-center justify-between gap-3 rounded-full border border-white/10 bg-ink-950/75 px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-4">
      <Link href="/" className="flex items-center gap-2 pl-1">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-gradient-to-b from-white to-slate-400 text-lg font-black text-ink-950">
          Ł
        </span>
        <span className="text-sm font-semibold tracking-[0.18em] text-slate-100">litvmai</span>
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
