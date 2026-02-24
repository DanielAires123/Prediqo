import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          Prediqo
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Join free</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 max-w-2xl mx-auto p-8 space-y-8">
        <h1 className="text-3xl font-bold">How we set probability</h1>

        <p className="text-zinc-600 dark:text-zinc-400">
          Prediqo uses an <strong>ELO-based model</strong> to compute match probabilities. We do not
          use bookmaker or external odds. Everything is based on team strength and home advantage.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">Team strength (ELO)</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Each team has a rating (default 1500). Home teams get a +80 advantage. We combine these
            to get an expected score, then convert that into three-way probabilities: home win, draw,
            away win. Draw probability is adjusted by how evenly matched the teams are.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Reward multiplier</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            The less likely an outcome, the higher the reward when you predict it correctly. We use a
            smoothed formula so multipliers stay reasonable (no extreme values). Your multiplier is
            fixed at the time you submit your prediction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Where results come from</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Match results are set by Prediqo from the official full-time score. They are final once
            published. We do not use live or in-play data for the MVP.
          </p>
        </section>

        <Link href="/">
          <Button variant="outline">Back to home</Button>
        </Link>
      </main>
    </div>
  );
}
