import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";
import { SkillRatingDisplay } from "@/components/shared/SkillRatingDisplay";
import { Progress } from "@/components/ui/progress";
import { getDivision, DIVISION_THRESHOLDS } from "@/types";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const [matches, season, predictionsToday] = await Promise.all([
    prisma.match.findMany({
      where: { matchDatetime: { gte: todayStart, lte: todayEnd } },
      include: { homeTeam: true, awayTeam: true, league: true },
      orderBy: { matchDatetime: "asc" },
    }),
    prisma.season.findFirst({
      where: { startDate: { lte: now }, endDate: { gte: now } },
    }),
    prisma.prediction.findMany({
      where: {
        userId: user.id,
        match: { matchDatetime: { gte: todayStart, lte: todayEnd } },
      },
      include: { match: true },
    }),
  ]);

  const seasonPoints = season
    ? (
        await prisma.seasonStat.findUnique({
          where: { userId_seasonId: { userId: user.id, seasonId: season.id } },
        })
      )?.totalPoints ?? 0
    : 0;

  const usedConfidence = predictionsToday.reduce((s, p) => s + p.confidenceUsed, 0);
  const remainingConfidence = 100 - usedConfidence;
  const division = getDivision(user.profile.skillRating);
  const nextThreshold =
    division === "BRONZE"
      ? DIVISION_THRESHOLDS.SILVER
      : division === "SILVER"
        ? DIVISION_THRESHOLDS.GOLD
        : division === "GOLD"
          ? DIVISION_THRESHOLDS.PLATINUM
          : division === "PLATINUM"
            ? DIVISION_THRESHOLDS.ELITE
            : DIVISION_THRESHOLDS.ELITE;
  const currentThreshold =
    division === "BRONZE"
      ? 0
      : division === "SILVER"
        ? DIVISION_THRESHOLDS.BRONZE
        : division === "GOLD"
          ? DIVISION_THRESHOLDS.SILVER
          : division === "PLATINUM"
            ? DIVISION_THRESHOLDS.GOLD
            : DIVISION_THRESHOLDS.PLATINUM;
  const progressToNext =
    nextThreshold > currentThreshold
      ? ((user.profile.skillRating - currentThreshold) /
          (nextThreshold - currentThreshold)) *
        100
      : 100;

  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const closingSoon = matches.filter((m) => m.matchDatetime <= twoHoursFromNow && m.matchDatetime > now);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <section className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900">
        <SkillRatingDisplay skillRating={user.profile.skillRating} />
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-sm">Season points</span>
          <span className="font-mono font-semibold">{Math.round(seasonPoints)}</span>
        </div>
        <div className="flex-1 min-w-[120px]">
          <p className="text-xs text-zinc-500 mb-1">Progress to next division</p>
          <Progress value={progressToNext} max={100} className="h-2" />
        </div>
      </section>

      {closingSoon.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
            Closing soon (under 2 hours)
          </h2>
          <ul className="space-y-1 text-sm">
            {closingSoon.map((m) => (
              <li key={m.id}>
                {m.homeTeam.name} v {m.awayTeam.name} — {m.matchDatetime.toISOString()}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-2">Today&apos;s matches</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Remaining confidence: <strong>{remainingConfidence}</strong> / 100
        </p>
        <DashboardClient
          matches={matches.map((m) => ({
            id: m.id,
            matchDatetime: m.matchDatetime.toISOString(),
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            league: m.league,
            homeProb: m.homeProb,
            drawProb: m.drawProb,
            awayProb: m.awayProb,
            multiplierHome: m.multiplierHome,
            multiplierDraw: m.multiplierDraw,
            multiplierAway: m.multiplierAway,
            result: m.result,
          }))}
          predictionsToday={predictionsToday.map((p) => ({
            matchId: p.matchId,
            selectedOutcome: p.selectedOutcome,
            confidenceUsed: p.confidenceUsed,
          }))}
          remainingConfidence={remainingConfidence}
        />
      </section>

      <section className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm">
        <h3 className="font-medium mb-2">Bonus tracker</h3>
        <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
          <li>+10% when you make at least 5 predictions this matchday</li>
          <li>+5% per 3 consecutive correct predictions (cap 25%)</li>
        </ul>
      </section>
    </div>
  );
}
