import { Header } from "@/components/Header";
import { NetworkGuard } from "@/components/NetworkGuard";
import { Swap } from "@/components/Swap";
import { Rewards } from "@/components/Rewards";
import { Leaderboard } from "@/components/Leaderboard";
import { Participate } from "@/components/Participate";
import { WalletInfo } from "@/components/WalletInfo";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20">
      <Header />
      <NetworkGuard />

      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">litvmai</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Swap zkLTC
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            litvmai desk on LiteForge. Trade zkLTC and earn XP for every confirmed swap.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
          +10 XP per verified swap
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <Swap />
        <div id="xp" className="space-y-6">
          <Rewards />
          <WalletInfo />
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Participate />
        <Leaderboard />
      </div>

      <footer className="mt-12 text-center text-xs text-slate-500">
        Testnet only · zkLTC has no real value
      </footer>
    </main>
  );
}
