import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");
  const leagueId = searchParams.get("leagueId");

  const date = dateStr ? new Date(dateStr) : new Date();
  const start = startOfDay(date);
  const end = endOfDay(date);

  const matches = await prisma.match.findMany({
    where: {
      matchDatetime: { gte: start, lte: end },
      ...(leagueId ? { leagueId } : {}),
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
    orderBy: { matchDatetime: "asc" },
  });

  const serialized = matches.map((m) => ({
    ...m,
    matchDatetime: m.matchDatetime.toISOString(),
  }));

  return NextResponse.json(serialized);
}
