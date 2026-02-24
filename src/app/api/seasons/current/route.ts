import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const now = new Date();
  const season = await prisma.season.findFirst({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });
  if (!season) {
    return NextResponse.json({ season: null });
  }
  return NextResponse.json({
    season: {
      id: season.id,
      name: season.name,
      startDate: season.startDate.toISOString(),
      endDate: season.endDate.toISOString(),
    },
  });
}
