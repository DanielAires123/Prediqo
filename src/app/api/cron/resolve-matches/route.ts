import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pointsEarned, pointsLost, bonusMultiplier, isCorrect } from "@/lib/scoring";
import { updateSkillRating } from "@/lib/skillRating";
import { expectedScore } from "@/lib/elo";

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  if (CRON_SECRET && request.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matches = await prisma.match.findMany({
    where: { result: { not: null } },
    include: { predictions: { where: { resolved: false }, include: { user: true } } },
  });

  for (const match of matches) {
    const result = match.result!;
    for (const pred of match.predictions) {
      const correct = isCorrect(
        pred.selectedOutcome as "HOME_WIN" | "DRAW" | "AWAY_WIN",
        result as "HOME_WIN" | "DRAW" | "AWAY_WIN"
      );
      const matchdayStart = new Date(match.matchDatetime);
      matchdayStart.setUTCHours(0, 0, 0, 0);
      const matchdayEnd = new Date(matchdayStart);
      matchdayEnd.setUTCDate(matchdayEnd.getUTCDate() + 1);

      const sameMatchdayPreds = await prisma.prediction.findMany({
        where: {
          userId: pred.userId,
          resolved: true,
          match: { matchDatetime: { gte: matchdayStart, lt: matchdayEnd } },
        },
        orderBy: { createdAt: "asc" },
      });
      let consecutiveCorrect = 0;
      for (let i = sameMatchdayPreds.length - 1; i >= 0; i--) {
        const p = sameMatchdayPreds[i];
        if (p.pointsEarned != null && p.pointsEarned > 0) consecutiveCorrect++;
        else break;
      }
      const allMatchdayPreds = await prisma.prediction.count({
        where: {
          userId: pred.userId,
          match: { matchDatetime: { gte: matchdayStart, lt: matchdayEnd } },
        },
      });
      const countAfterThis = allMatchdayPreds;
      const bonus = bonusMultiplier(countAfterThis, consecutiveCorrect);

      const earned = correct
        ? pointsEarned(pred.confidenceUsed, pred.multiplierSnapshot) * bonus
        : 0;
      const lost = correct ? 0 : pointsLost(pred.confidenceUsed);
      const net = earned - lost;

      await prisma.prediction.update({
        where: { id: pred.id },
        data: { pointsEarned: correct ? earned : -lost, resolved: true },
      });

      const season = await prisma.season.findFirst({
        where: {
          startDate: { lte: match.matchDatetime },
          endDate: { gte: match.matchDatetime },
        },
      });
      if (season) {
        await prisma.seasonStat.upsert({
          where: { userId_seasonId: { userId: pred.userId, seasonId: season.id } },
          create: { userId: pred.userId, seasonId: season.id, totalPoints: net },
          update: { totalPoints: { increment: net } },
        });
      }

      const profile = pred.user;
      const expectedScoreVal = 0;
      const newRating = updateSkillRating(
        profile.skillRating,
        net,
        expectedScoreVal
      );
      await prisma.profile.update({
        where: { id: pred.userId },
        data: { skillRating: newRating },
      });
    }
  }

  const K_TEAM = 32;
  for (const match of matches) {
    const homeElo = match.homeEloSnapshot;
    const awayElo = match.awayEloSnapshot;
    const homeEffective = homeElo + 80;
    const expectedHome = expectedScore(homeEffective, awayElo);
    const actual =
      match.result === "HOME_WIN" ? 1 : match.result === "DRAW" ? 0.5 : 0;
    const delta = K_TEAM * (actual - expectedHome);
    const homeTeam = await prisma.team.findUnique({
      where: { id: match.homeTeamId },
    });
    const awayTeam = await prisma.team.findUnique({
      where: { id: match.awayTeamId },
    });
    if (homeTeam)
      await prisma.team.update({
        where: { id: homeTeam.id },
        data: { eloRating: Math.round(homeTeam.eloRating + delta) },
      });
    if (awayTeam)
      await prisma.team.update({
        where: { id: awayTeam.id },
        data: { eloRating: Math.round(awayTeam.eloRating - delta) },
      });
  }

  return NextResponse.json({ ok: true, processed: matches.length });
}
