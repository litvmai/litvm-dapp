"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const links = [
  { href: "/", label: "Swap" },
  { href: "/leaderboard", label: "Board" },
  { href: "/dashboard", label: "Tasks" },
];

function Mark() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9" aria-hidden="true">
      <defs>
        <linearGradient id="lv-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7f8fb" />
          <stop offset="0.55" stopColor="#c5ceda" />
          <stop offset="1" stopColor="#8ea0b8" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill="url(#lv-metal)" />
      <circle cx="18" cy="18" r="14.5" fill="#10131a" />
      <path
        d="M11 10.5h6.2c3.4 0 5.5 1.7 5.5 4.4 0 2.1-1.2 3.6-3.2 4.2L24.8 25h-3.4l-4.4-5.6H14.2V25H11V10.5zm3.2 6.6h2.6c1.6 0 2.6-.7 2.6-1.9s-1-1.8-2.6-1.8h-2.6v3.7z"
        fill="#eef2f7"
      />
      <circle cx="26.2" cy="11.2" r="1.5" fill="#7eb6ff" />
      <path d="M24.6 12.4l2.4 2.2" stroke="#7eb6ff" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const path = usePathname();
  return (
    <header className="sticky top-3 z-20 mb-6 flex items-center justify-between gap-3 rounded-full border border-white/10 bg-ink-950/75 px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-4">
      <Link href="/" className="flex items-center gap-2 pl-1">
        <Mark />
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
