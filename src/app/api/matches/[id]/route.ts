import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const match = await prisma.match.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true, league: true },
  });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await getCurrentUser();
  let prediction = null;
  if (user) {
    prediction = await prisma.prediction.findUnique({
      where: { userId_matchId: { userId: user.id, matchId: id } },
    });
  }

  return NextResponse.json({
    ...match,
    matchDatetime: match.matchDatetime.toISOString(),
    prediction: prediction
      ? { ...prediction, createdAt: prediction.createdAt.toISOString() }
      : null,
  });
}
