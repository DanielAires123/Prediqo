import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createPredictionSchema } from "@/lib/validation";
import { startOfDay, endOfDay } from "date-fns";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createPredictionSchema.safeParse({
    ...body,
    confidenceUsed: body.confidenceUsed ?? body.confidence_used,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { matchId, selectedOutcome, confidenceUsed } = parsed.data;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const now = new Date();
  const lockWindow = new Date(match.matchDatetime.getTime() - 5 * 60 * 1000);
  if (now >= lockWindow) {
    return NextResponse.json(
      { error: "Predictions are closed for this match" },
      { status: 400 }
    );
  }

  const matchdayStart = startOfDay(match.matchDatetime);
  const matchdayEnd = endOfDay(match.matchDatetime);

  const usedThisMatchday = await prisma.prediction.aggregate({
    where: {
      userId: user.id,
      match: {
        matchDatetime: { gte: matchdayStart, lte: matchdayEnd },
      },
    },
    _sum: { confidenceUsed: true },
  });
  const totalUsed = (usedThisMatchday._sum.confidenceUsed ?? 0) + confidenceUsed;
  if (totalUsed > 100) {
    return NextResponse.json(
      { error: "You have only 100 confidence points per matchday. Reduce amount or choose another match." },
      { status: 400 }
    );
  }

  const multiplier =
    selectedOutcome === "HOME_WIN"
      ? match.multiplierHome
      : selectedOutcome === "DRAW"
        ? match.multiplierDraw
        : match.multiplierAway;

  const prediction = await prisma.prediction.create({
    data: {
      userId: user.id,
      matchId,
      selectedOutcome: selectedOutcome as "HOME_WIN" | "DRAW" | "AWAY_WIN",
      confidenceUsed,
      multiplierSnapshot: multiplier,
    },
  });

  return NextResponse.json({
    ...prediction,
    createdAt: prediction.createdAt.toISOString(),
  });
}
