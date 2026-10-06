import { Header } from "@/components/Header";
import { NetworkGuard } from "@/components/NetworkGuard";
import { Swap } from "@/components/Swap";
import { Participate } from "@/components/Participate";
import { GasRefund } from "@/components/GasRefund";
import { WalletInfo } from "@/components/WalletInfo";

export default function Home() {
  return (
    <main className="mx-auto max-w-xl px-4 pb-20">
      <Header />
      <NetworkGuard />

      <section className="mb-6">
        <p className="label">litvmai</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Swap zkLTC</h1>
        <p className="mt-2 text-sm text-slate-400">
          Trade on LiteForge. Claim tracked gas under participate.
        </p>
      </section>

      <div className="space-y-6">
        <Swap />
        <Participate />
        <GasRefund />
        <WalletInfo />
      </div>

      <footer className="mt-12 text-center text-xs text-slate-500">
        Testnet only · zkLTC has no real value
      </footer>
    </main>
  );
}
