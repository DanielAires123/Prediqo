/**
 * Points earned when prediction is correct.
 */
export function pointsEarned(
  confidenceUsed: number,
  multiplierSnapshot: number
): number {
  return confidenceUsed * multiplierSnapshot;
}

/**
 * Points lost when prediction is wrong.
 */
export function pointsLost(confidenceUsed: number): number {
  return confidenceUsed;
}

const STREAK_BONUS_PER_3 = 0.05;
const STREAK_CAP = 0.25;
const FIVE_PREDICTIONS_BONUS = 0.1;

/**
 * Bonus multiplier: +10% if >= 5 predictions in matchday, +5% per 3 consecutive correct (cap 25%).
 * Returns multiplier > 1, e.g. 1.15.
 */
export function bonusMultiplier(
  predictionsCount: number,
  consecutiveCorrect: number
): number {
  let bonus = 0;
  if (predictionsCount >= 5) bonus += FIVE_PREDICTIONS_BONUS;
  const streakBonus =
    Math.floor(consecutiveCorrect / 3) * STREAK_BONUS_PER_3;
  bonus += Math.min(streakBonus, STREAK_CAP);
  return 1 + bonus;
}

export type MatchResult = "HOME_WIN" | "DRAW" | "AWAY_WIN";
export type PredictionOutcome = "HOME_WIN" | "DRAW" | "AWAY_WIN";

export function isCorrect(
  selectedOutcome: PredictionOutcome,
  actualResult: MatchResult
): boolean {
  return selectedOutcome === actualResult;
}
