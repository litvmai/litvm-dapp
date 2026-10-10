import { Header } from "@/components/Header";
import { NetworkGuard } from "@/components/NetworkGuard";
import { OgMint } from "@/components/OgMint";

export default function OgPage() {
  return (
    <main className="mx-auto max-w-xl px-4 pb-20">
      <Header />
      <NetworkGuard />
      <section className="mb-6 flex items-center gap-4">
        <img src="/logo.png" alt="litvmai OG" className="h-16 w-16 rounded-full border border-white/10" />
        <div>
          <p className="label">litvmai</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">OG badge</h1>
          <p className="mt-1 text-sm text-slate-400">5,000 total. One per wallet.</p>
        </div>
      </section>
      <OgMint />
      <div className="mt-6 grid gap-3 text-sm text-slate-300">
        <div className="rounded-2xl border border-white/10 p-4">4,000 for approved content. Send the post link, then the owner mints it.</div>
        <div className="rounded-2xl border border-white/10 p-4">1,000 for sale in zkLTC. Payment and mint both happen on LiteForge.</div>
        <div className="rounded-2xl border border-white/10 p-4">No daily token. The badge is only a key for later features.</div>
      </div>
    </main>
  );
}
