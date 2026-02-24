"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatInTimeZone } from "date-fns-tz";

type Outcome = "HOME_WIN" | "DRAW" | "AWAY_WIN";

interface MatchRow {
  id: string;
  matchDatetime: string;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
  league: { id: string; name: string };
  homeProb: number;
  drawProb: number;
  awayProb: number;
  multiplierHome: number;
  multiplierDraw: number;
  multiplierAway: number;
  result: string | null;
}

interface PredictionRow {
  matchId: string;
  selectedOutcome: string;
  confidenceUsed: number;
}

export function DashboardClient({
  matches,
  predictionsToday,
  remainingConfidence,
}: {
  matches: MatchRow[];
  predictionsToday: PredictionRow[];
  remainingConfidence: number;
}) {
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<Record<string, number>>({});
  const [selectedOutcome, setSelectedOutcome] = useState<Record<string, Outcome | null>>({});
  const [localPredictions, setLocalPredictions] = useState<Set<string>>(
    new Set(predictionsToday.map((p) => p.matchId))
  );
  const [localUsed, setLocalUsed] = useState(
    predictionsToday.reduce((s, p) => s + p.confidenceUsed, 0)
  );

  const getRemaining = () => 100 - localUsed;

  function handleSubmit(matchId: string) {
    const outcome = selectedOutcome[matchId];
    if (!outcome) return;
    const conf = Math.min(50, Math.max(5, confidence[matchId] ?? 15));
    if (conf > getRemaining()) return;
    setSubmitting(matchId);
    fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        selectedOutcome: outcome,
        confidenceUsed: conf,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setLocalPredictions((prev) => new Set(prev).add(matchId));
          setLocalUsed((prev) => prev + conf);
          setSelectedOutcome((o) => ({ ...o, [matchId]: null }));
        }
        return res.json();
      })
      .catch(() => {})
      .finally(() => setSubmitting(null));
  }

  if (matches.length === 0) {
    return (
      <p className="text-zinc-500">No matches scheduled for today. Check back later.</p>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((m) => {
        const hasPrediction = localPredictions.has(m.id);
        const conf = Math.min(50, Math.max(5, confidence[m.id] ?? 15));
        const remaining = getRemaining();
        const selected = selectedOutcome[m.id];
        const canSubmit =
          !hasPrediction &&
          selected != null &&
          conf <= remaining &&
          conf >= 5 &&
          submitting !== m.id;

        return (
          <Card key={m.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">
                  {m.homeTeam.name} v {m.awayTeam.name}
                </span>
                <span className="text-sm text-zinc-500">
                  {formatInTimeZone(
                    new Date(m.matchDatetime),
                    Intl.DateTimeFormat().resolvedOptions().timeZone,
                    "EEE, HH:mm"
                  )}{" "}
                  your time
                </span>
              </div>
              <p className="text-xs text-zinc-500">{m.league.name}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <button
                  type="button"
                  onClick={() =>
                    !hasPrediction &&
                    setSelectedOutcome((o) => ({ ...o, [m.id]: "HOME_WIN" }))
                  }
                  disabled={hasPrediction}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selected === "HOME_WIN"
                      ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800"
                      : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div>1</div>
                  <div className="text-zinc-500">
                    {Math.round(m.homeProb * 100)}% · {m.multiplierHome.toFixed(1)}×
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    !hasPrediction &&
                    setSelectedOutcome((o) => ({ ...o, [m.id]: "DRAW" }))
                  }
                  disabled={hasPrediction}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selected === "DRAW"
                      ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800"
                      : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div>X</div>
                  <div className="text-zinc-500">
                    {Math.round(m.drawProb * 100)}% · {m.multiplierDraw.toFixed(1)}×
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    !hasPrediction &&
                    setSelectedOutcome((o) => ({ ...o, [m.id]: "AWAY_WIN" }))
                  }
                  disabled={hasPrediction}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selected === "AWAY_WIN"
                      ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800"
                      : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div>2</div>
                  <div className="text-zinc-500">
                    {Math.round(m.awayProb * 100)}% · {m.multiplierAway.toFixed(1)}×
                  </div>
                </button>
              </div>
              {!hasPrediction && (
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-[160px]">
                    <label className="text-xs text-zinc-500">
                      Confidence: {conf} (min 5, max 50)
                    </label>
                    <Slider
                      min={5}
                      max={50}
                      value={conf}
                      onValueChange={(v) =>
                        setConfidence((c) => ({ ...c, [m.id]: v }))
                      }
                    />
                  </div>
                  <Button
                    size="sm"
                    disabled={!canSubmit}
                    onClick={() => handleSubmit(m.id)}
                  >
                    {submitting === m.id ? "Submitting…" : "Submit prediction"}
                  </Button>
                </div>
              )}
              {hasPrediction && (
                <p className="text-sm text-zinc-500">
                  You submitted a prediction for this match.
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
