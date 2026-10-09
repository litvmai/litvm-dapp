import Link from "next/link";

const explore = [
  { href: "/", label: "Swap" },
  { href: "/leaderboard", label: "Board" },
  { href: "/dashboard", label: "Tasks" },
  { href: "/og", label: "OG" },
];

export function Footer() {
  return (
    <footer className="mx-auto mt-16 max-w-5xl px-4 pb-8">
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-r from-[#1a1240]/90 via-[#12182c]/90 to-[#0c101c]/90 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="grid gap-8 px-6 py-7 sm:grid-cols-[1.3fr_1fr_1fr_1fr] sm:px-8">
          <div>
            <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-white">
              LITVMAI
            </Link>
            <p className="mt-8 text-xs text-slate-500">LiteForge testnet. zkLTC has no real value.</p>
          </div>
          <div className="space-y-3 text-sm">
            <p className="text-slate-400">Explore</p>
            {explore.map((item) => (
              <Link key={item.href} href={item.href} className="block text-slate-200 hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="space-y-3 text-sm">
            <p className="text-slate-400">Network</p>
            <a className="block text-slate-200 hover:text-white" href="https://liteforge.explorer.caldera.xyz" target="_blank" rel="noreferrer">Explorer</a>
            <a className="block text-slate-200 hover:text-white" href="https://testnet.litvmai.xyz" target="_blank" rel="noreferrer">testnet.litvmai.xyz</a>
          </div>
          <div>
            <p className="text-sm text-slate-400">Connect</p>
            <div className="mt-3 flex gap-2">
              <a href="https://x.com/litvmai" target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-sm hover:bg-white/10">X</a>
              <Link href="/dashboard" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-xs hover:bg-white/10">D</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
