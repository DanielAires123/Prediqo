export type MatchResult = "HOME_WIN" | "DRAW" | "AWAY_WIN";
export type PredictionOutcome = "HOME_WIN" | "DRAW" | "AWAY_WIN";

export interface MatchWithTeams {
  id: string;
  matchDatetime: Date;
  result: MatchResult | null;
  homeProb: number;
  drawProb: number;
  awayProb: number;
  multiplierHome: number;
  multiplierDraw: number;
  multiplierAway: number;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
  league: { id: string; name: string };
}

export interface LeaderboardRow {
  rank: number;
  userId: string;
  username: string;
  skillRating: number;
  seasonPoints: number;
  winRate: number | null;
  avgMultiplier: number | null;
  totalPredictions: number;
}

export const DIVISION_THRESHOLDS = {
  BRONZE: 1200,
  SILVER: 1400,
  GOLD: 1600,
  PLATINUM: 1800,
  ELITE: 9999,
} as const;

export function getDivision(skillRating: number): keyof typeof DIVISION_THRESHOLDS {
  if (skillRating >= 1800) return "ELITE";
  if (skillRating >= 1600) return "PLATINUM";
  if (skillRating >= 1400) return "GOLD";
  if (skillRating >= 1200) return "SILVER";
  return "BRONZE";
}
