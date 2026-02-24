import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DivisionBadge } from "@/components/shared/DivisionBadge";

async function getRanking(): Promise<{
  rows: LeaderboardRow[];
  season: { id: string; name: string; endDate: string } | null;
}> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/ranking?limit=50`, { cache: "no-store" });
  if (!res.ok) return { rows: [], season: null };
  const data = await res.json();
  return { rows: data.rows ?? [], season: data.season };
}

interface LeaderboardRow {
  rank: number;
  userId: string;
  username: string;
  skillRating: number;
  seasonPoints: number;
  winRate: number | null;
  avgMultiplier: number | null;
  totalPredictions: number;
}

export default async function RankingPage() {
  const user = await getCurrentUser();
  const { rows, season } = await getRanking();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Global ranking</h1>
        {season && (
          <p className="text-sm text-zinc-500">
            Season: {season.name} · ends {new Date(season.endDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="text-left py-2 font-medium">#</th>
                  <th className="text-left py-2 font-medium">Username</th>
                  <th className="text-left py-2 font-medium">Skill</th>
                  <th className="text-left py-2 font-medium">Season pts</th>
                  <th className="text-left py-2 font-medium">Win rate</th>
                  <th className="text-left py-2 font-medium">Avg mult.</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.userId}
                    className={`border-b border-zinc-100 dark:border-zinc-800 ${
                      user?.id === row.userId ? "bg-zinc-100 dark:bg-zinc-800/50" : ""
                    }`}
                  >
                    <td className="py-2">{row.rank}</td>
                    <td className="py-2">
                      <Link
                        href={`/profile/${row.userId}`}
                        className="hover:underline font-medium"
                      >
                        {row.username}
                      </Link>
                    </td>
                    <td className="py-2">
                      <DivisionBadge skillRating={row.skillRating} />
                      <span className="ml-1 font-mono">{row.skillRating}</span>
                    </td>
                    <td className="py-2 font-mono">{Math.round(row.seasonPoints)}</td>
                    <td className="py-2">
                      {row.winRate != null
                        ? `${Math.round(row.winRate * 100)}%`
                        : "—"}
                    </td>
                    <td className="py-2">
                      {row.avgMultiplier != null
                        ? row.avgMultiplier.toFixed(1)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <p className="text-zinc-500 py-4 text-center">No rankings yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
