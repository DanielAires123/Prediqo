import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { SkillRatingDisplay } from "@/components/shared/SkillRatingDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/users/${user.id}`,
    { cache: "no-store" }
  );
  const data = res.ok ? await res.json() : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>{user.profile.username}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SkillRatingDisplay skillRating={user.profile.skillRating} />
          {data?.accuracy != null && (
            <p className="text-sm">
              Accuracy: <strong>{Math.round(data.accuracy * 100)}%</strong>
            </p>
          )}
          {data?.avgMultiplier != null && (
            <p className="text-sm">
              Average multiplier chosen: <strong>{data.avgMultiplier.toFixed(1)}</strong>
            </p>
          )}
          {data?.totalPredictions != null && (
            <p className="text-sm">
              Total predictions: <strong>{data.totalPredictions}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      {data?.seasonStats?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Season history</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {data.seasonStats.map((s: { seasonName: string; totalPoints: number; rank: number | null }) => (
                <li key={s.seasonName}>
                  {s.seasonName}: {Math.round(s.totalPoints)} pts
                  {s.rank != null && ` · Rank #${s.rank}`}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
