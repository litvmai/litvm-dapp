import { Header } from "@/components/Header";
import { NetworkGuard } from "@/components/NetworkGuard";
import { Leaderboard } from "@/components/Leaderboard";

export default function LeaderboardPage() {
  return (
    <main className="mx-auto max-w-xl px-4 pb-20">
      <Header />
      <NetworkGuard />

      <section className="mb-6">
        <p className="label">litvmai</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Leaderboard</h1>
        <p className="mt-2 text-sm text-slate-400">Wallets ranked by XP.</p>
      </section>

      <Leaderboard />

      <div className="mt-8 text-center">
        <a href="/" className="btn-secondary">Back to swap</a>
      </div>
    </main>
  );
}
