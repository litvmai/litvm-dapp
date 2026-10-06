import { Header } from "@/components/Header";
import { NetworkGuard } from "@/components/NetworkGuard";
import { Swap } from "@/components/Swap";
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
            litvmai desk on LiteForge. Swap on the left, standings on the right.
          </p>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div className="space-y-6">
          <Swap />
          <Participate />
          <WalletInfo />
        </div>
        <div id="board">
          <Leaderboard />
        </div>
      </div>

      <footer className="mt-12 text-center text-xs text-slate-500">
        Testnet only · zkLTC has no real value
      </footer>
    </main>
  );
}
