import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-lg">Prediqo</span>
        <nav className="flex items-center gap-4">
          <Link href="/how-it-works" className="text-sm hover:underline">
            How it works
          </Link>
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

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Prove Your Sports IQ.
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
          Compete globally. No money. Pure skill.
        </p>
        <Link href="/register">
          <Button size="lg">Join free</Button>
        </Link>

        <section className="mt-16 text-left w-full space-y-6">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <ol className="list-decimal list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Predict match outcomes (home win, draw, away win) using our probability model.</li>
            <li>Assign confidence points (5–50 per match, 100 per matchday).</li>
            <li>Earn points when you&apos;re right; climb divisions and the global ranking.</li>
          </ol>
        </section>

        <section className="mt-12 w-full text-left">
          <h2 className="text-xl font-semibold mb-2">Seasonal rewards</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Seasons run 30 days. Top 100 get a badge; top 10 are featured. Your skill rating never
            resets — only season points do.
          </p>
        </section>

        <section className="mt-12 w-full text-left">
          <h2 className="text-xl font-semibold mb-2">FAQ</h2>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <strong>Is this real money?</strong> No. Prediqo is skill-based only. You never pay or
              win money.
            </li>
            <li>
              <strong>Where do results come from?</strong> Match results are set by Prediqo from
              the official full-time score.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
