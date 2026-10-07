import { Header } from "@/components/Header";
import { NetworkGuard } from "@/components/NetworkGuard";
import { OgMint } from "@/components/OgMint";

export default function OgPage() {
  return (
    <main className="mx-auto max-w-xl px-4 pb-20">
      <Header />
      <NetworkGuard />
      <section className="mb-6">
        <p className="label">litvmai</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">OG badge</h1>
        <p className="mt-2 text-sm text-slate-400">A key for later features. No daily token payout.</p>
      </section>
      <OgMint />
    </main>
  );
}
