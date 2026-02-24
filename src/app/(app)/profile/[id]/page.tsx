import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DivisionBadge } from "@/components/shared/DivisionBadge";

async function getUser(id: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/users/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProfileIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getUser(id);
  if (!data) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{data.profile.username}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <DivisionBadge skillRating={data.profile.skillRating} />
            <span className="font-mono font-semibold">{data.profile.skillRating}</span>
            <span className="text-zinc-500 text-sm">skill</span>
          </div>
          {data.accuracy != null && (
            <p className="text-sm">
              Accuracy: <strong>{Math.round(data.accuracy * 100)}%</strong>
            </p>
          )}
          {data.avgMultiplier != null && (
            <p className="text-sm">
              Average multiplier: <strong>{data.avgMultiplier.toFixed(1)}</strong>
            </p>
          )}
          {data.totalPredictions != null && (
            <p className="text-sm">Total predictions: <strong>{data.totalPredictions}</strong></p>
          )}
        </CardContent>
      </Card>

      {data.seasonStats?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Season history</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {data.seasonStats.map(
                (s: { seasonName: string; totalPoints: number; rank: number | null }) => (
                  <li key={s.seasonName}>
                    {s.seasonName}: {Math.round(s.totalPoints)} pts
                    {s.rank != null && ` · #${s.rank}`}
                  </li>
                )
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      <p>
        <Link href="/ranking" className="text-sm underline">
          Back to ranking
        </Link>
      </p>
    </div>
  );
}
