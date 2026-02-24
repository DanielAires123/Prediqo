import { PrismaClient } from "@prisma/client";
import { computeMatchProbabilitiesAndMultipliers } from "../src/lib/elo";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const seasonStart = new Date(now);
  seasonStart.setDate(1);
  seasonStart.setHours(0, 0, 0, 0);
  const seasonEnd = new Date(seasonStart);
  seasonEnd.setMonth(seasonEnd.getMonth() + 1);
  seasonEnd.setDate(0);

  const season = await prisma.season.upsert({
    where: { id: "seed-season-1" },
    create: {
      id: "seed-season-1",
      name: `${seasonStart.toLocaleString("default", { month: "long" })} ${seasonStart.getFullYear()}`,
      startDate: seasonStart,
      endDate: seasonEnd,
    },
    update: {},
  });

  const leagues = await Promise.all([
    prisma.league.upsert({
      where: { id: "league-1" },
      create: { id: "league-1", name: "Premier League", countryCode: "EN" },
      update: {},
    }),
    prisma.league.upsert({
      where: { id: "league-2" },
      create: { id: "league-2", name: "La Liga", countryCode: "ES" },
      update: {},
    }),
    prisma.league.upsert({
      where: { id: "league-3" },
      create: { id: "league-3", name: "Bundesliga", countryCode: "DE" },
      update: {},
    }),
  ]);

  const teamNames: Record<string, string[]> = {
    "league-1": ["Arsenal", "Chelsea", "Liverpool", "Manchester City", "Manchester United"],
    "league-2": ["Barcelona", "Real Madrid", "Atletico Madrid", "Sevilla", "Villarreal"],
    "league-3": ["Bayern Munich", "Borussia Dortmund", "RB Leipzig", "Bayer Leverkusen", "Eintracht Frankfurt"],
  };

  const teamIds: string[] = [];
  for (const league of leagues) {
    const names = teamNames[league.id] ?? [];
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const id = `${league.id}-team-${i + 1}`;
      await prisma.team.upsert({
        where: { id },
        create: { id, name, eloRating: 1500, leagueId: league.id },
        update: { name },
      });
      teamIds.push(id);
    }
  }

  const teams = await prisma.team.findMany();
  const matchDatetime = new Date(now);
  matchDatetime.setHours(20, 0, 0, 0);
  if (matchDatetime < now) matchDatetime.setDate(matchDatetime.getDate() + 1);

  for (let i = 0; i < Math.min(5, teams.length); i += 2) {
    if (i + 1 >= teams.length) break;
    const home = teams[i];
    const away = teams[i + 1];
    const { homeProb, drawProb, awayProb, multiplierHome, multiplierDraw, multiplierAway } =
      computeMatchProbabilitiesAndMultipliers(home.eloRating, away.eloRating);
    await prisma.match.upsert({
      where: { id: `match-${i}` },
      create: {
        id: `match-${i}`,
        homeTeamId: home.id,
        awayTeamId: away.id,
        homeEloSnapshot: home.eloRating,
        awayEloSnapshot: away.eloRating,
        homeProb,
        drawProb,
        awayProb,
        multiplierHome,
        multiplierDraw,
        multiplierAway,
        matchDatetime,
        leagueId: home.leagueId,
        seasonId: season.id,
      },
      update: {},
    });
  }

  console.log("Seed done: season, 3 leagues, teams, and sample matches.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
