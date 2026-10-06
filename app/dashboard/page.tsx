import { Suspense } from "react";
import { Header } from "@/components/Header";
import { NetworkGuard } from "@/components/NetworkGuard";
import { SocialDashboard } from "@/components/SocialDashboard";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-20">
      <Header />
      <NetworkGuard />

      <section className="mt-6 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Tasks</h1>
        <p className="mx-auto mt-2 max-w-lg text-slate-400">
          Connect X and Discord, then claim XP for each task.
        </p>
      </section>

      <div className="mt-8">
        <Suspense fallback={null}>
          <SocialDashboard />
        </Suspense>
      </div>

      <div className="mt-8 text-center">
        <a href="/" className="btn-secondary">
          Back to swap
        </a>
      </div>
    </main>
  );
}
