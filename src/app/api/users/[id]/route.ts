import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDivision } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({
    where: { id },
  });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const predictions = await prisma.prediction.findMany({
    where: { userId: id, resolved: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  const correct = predictions.filter((p) => p.pointsEarned != null && p.pointsEarned > 0).length;
  const accuracy = predictions.length ? correct / predictions.length : null;
  const avgMultiplier =
    predictions.length && predictions.every((p) => p.multiplierSnapshot != null)
      ? predictions.reduce((a, p) => a + p.multiplierSnapshot, 0) / predictions.length
      : null;

  const seasonStats = await prisma.seasonStat.findMany({
    where: { userId: id },
    include: { season: true },
    orderBy: { season: { endDate: "desc" } },
    take: 12,
  });

  const division = getDivision(profile.skillRating);

  return NextResponse.json({
    profile: {
      id: profile.id,
      username: profile.username,
      skillRating: profile.skillRating,
      division,
      createdAt: profile.createdAt.toISOString(),
    },
    accuracy,
    avgMultiplier,
    totalPredictions: predictions.length,
    seasonStats: seasonStats.map((s) => ({
      seasonId: s.seasonId,
      seasonName: s.season.name,
      totalPoints: s.totalPoints,
      rank: s.rank,
    })),
  });
}
