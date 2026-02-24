import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  // Public: no auth required to view leaderboard
  const { searchParams } = new URL(request.url);
  const seasonId = searchParams.get("seasonId");
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

  const season = seasonId
    ? await prisma.season.findUnique({ where: { id: seasonId } })
    : await prisma.season.findFirst({
        where: {
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });

  const profiles = await prisma.profile.findMany({
    orderBy: [{ skillRating: "desc" }, { createdAt: "asc" }],
    take: limit * 3,
    skip: 0,
  });

  const withStats = await Promise.all(
    profiles.map(async (p, idx) => {
      const predictions = await prisma.prediction.findMany({
        where: { userId: p.id, resolved: true },
      });
      const correct = predictions.filter((pr) => pr.pointsEarned != null && pr.pointsEarned > 0).length;
      const winRate = predictions.length ? correct / predictions.length : null;
      const avgMultiplier =
        predictions.length && predictions.every((pr) => pr.multiplierSnapshot != null)
          ? predictions.reduce((a, pr) => a + pr.multiplierSnapshot, 0) / predictions.length
          : null;

      let seasonPoints = 0;
      if (season) {
        const stat = await prisma.seasonStat.findUnique({
          where: { userId_seasonId: { userId: p.id, seasonId: season.id } },
        });
        seasonPoints = stat?.totalPoints ?? 0;
      }

      return {
        rank: idx + 1,
        userId: p.id,
        username: p.username,
        skillRating: p.skillRating,
        seasonPoints,
        winRate,
        avgMultiplier,
        totalPredictions: predictions.length,
        createdAt: p.createdAt.toISOString(),
      };
    })
  );

  const ordered = withStats.sort((a, b) => {
    if (b.skillRating !== a.skillRating) return b.skillRating - a.skillRating;
    if (b.seasonPoints !== a.seasonPoints) return b.seasonPoints - a.seasonPoints;
    if (b.totalPredictions !== a.totalPredictions) return b.totalPredictions - a.totalPredictions;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const paginated = ordered.slice(page * limit, (page + 1) * limit).map((row, i) => ({
    ...row,
    rank: page * limit + i + 1,
  }));

  return NextResponse.json({
    rows: paginated,
    season: season
      ? { id: season.id, name: season.name, endDate: season.endDate.toISOString() }
      : null,
  });
}
