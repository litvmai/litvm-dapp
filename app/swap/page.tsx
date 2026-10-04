import { Header } from "@/components/Header";
import { NetworkGuard } from "@/components/NetworkGuard";
import { Swap } from "@/components/Swap";

export default function SwapPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-20">
      <Header />
      <NetworkGuard />

      <section className="mt-6 text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          <span className="bg-gradient-to-r from-neon-green to-neon-purple bg-clip-text text-transparent">
            Swap
          </span>
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-slate-400">
          Trade zkLTC for any token on LiteForge, routed through a verified
          on-chain AMM.
        </p>
      </section>

      <div className="mt-8">
        <Swap />
      </div>

      <div className="mt-8 text-center">
        <a href="/" className="btn-secondary">
          ← Back to main page
        </a>
      </div>
    </main>
  );
}
