import { Header } from "@/components/Header";
import { NetworkGuard } from "@/components/NetworkGuard";
import { WalletInfo } from "@/components/WalletInfo";
import { ContractBalance } from "@/components/ContractBalance";
import { Participate } from "@/components/Participate";
import { SocialTasks } from "@/components/SocialTasks";
import { Leaderboard } from "@/components/Leaderboard";
import { GasRefund } from "@/components/GasRefund";
import { Rewards } from "@/components/Rewards";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20">
      <Header />
      <NetworkGuard />

      <section className="mt-10 text-center">
        <h1 className="text-4xl font-extrabold sm:text-5xl">
          <span className="bg-gradient-to-r from-neon-green to-neon-purple bg-clip-text text-transparent">
            LitVM LiteForge
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-400">
          Swap, participate, and check in on LiteForge. Every confirmed action
          adds XP and moves you up the leaderboard.
        </p>
      </section>

      <div className="mt-10 grid gap-6">
        <Rewards />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <WalletInfo />
        <ContractBalance />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Participate />
        <SocialTasks />
      </div>

      <div className="mt-6 grid gap-6">
        <GasRefund />
      </div>

      <div className="mt-6 grid gap-6">
        <Leaderboard />
      </div>

      <footer className="mt-12 text-center text-xs text-slate-500">
        Testnet only · zkLTC has no real value
      </footer>
    </main>
  );
}
