export const BASE_ELO = 1500;
export const HOME_ADVANTAGE = 80;

/**
 * Expected score for team A vs team B (ELO formula).
 * Result is in [0, 1].
 */
export function expectedScore(eloA: number, eloB: number): number {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

/**
 * Three-way probabilities (home win, draw, away win) from ELO ratings.
 * Draw probability is clamped and then we normalize so sum = 1.
 */
export function threeWayProbabilities(
  homeElo: number,
  awayElo: number
): { homeProb: number; drawProb: number; awayProb: number } {
  const homeEffective = homeElo + HOME_ADVANTAGE;
  const homeWinProb = expectedScore(homeEffective, awayElo);
  const eloDiff = Math.abs(homeElo - awayElo);
  let drawProb = 0.28 - eloDiff / 2000;
  drawProb = Math.max(0.15, Math.min(0.3, drawProb));
  let awayProb = 1 - homeWinProb - drawProb;
  if (awayProb < 0) awayProb = 0;
  const sum = homeWinProb + drawProb + awayProb;
  return {
    homeProb: homeWinProb / sum,
    drawProb: drawProb / sum,
    awayProb: awayProb / sum,
  };
}

/**
 * Reward multiplier from probability. Higher for less likely outcomes.
 * Formula: 0.6 + (1/prob)^0.75 to avoid extreme multipliers.
 */
export function probabilityToMultiplier(prob: number): number {
  if (prob <= 0) return 4.8;
  const raw = 1 / prob;
  return 0.6 + Math.pow(raw, 0.75);
}

export interface MatchProbabilitiesAndMultipliers {
  homeProb: number;
  drawProb: number;
  awayProb: number;
  multiplierHome: number;
  multiplierDraw: number;
  multiplierAway: number;
}

export function computeMatchProbabilitiesAndMultipliers(
  homeElo: number,
  awayElo: number
): MatchProbabilitiesAndMultipliers {
  const { homeProb, drawProb, awayProb } = threeWayProbabilities(
    homeElo,
    awayElo
  );
  return {
    homeProb,
    drawProb,
    awayProb,
    multiplierHome: probabilityToMultiplier(homeProb),
    multiplierDraw: probabilityToMultiplier(drawProb),
    multiplierAway: probabilityToMultiplier(awayProb),
  };
}
