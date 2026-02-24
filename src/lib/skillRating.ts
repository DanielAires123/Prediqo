const K_USER = 20;
const BASE_RATING = 1200;

/**
 * After a matchday, update user skill rating (ELO-style).
 * expectedScore can be derived from the average multiplier risk the user took
 * vs actual performance. Simplified: use (actualPoints - expectedPoints) where
 * expectedPoints could be 0 for a neutral prior, or based on average multiplier.
 */
export function updateSkillRating(
  currentRating: number,
  actualScore: number,
  expectedScore: number
): number {
  const delta = K_USER * (actualScore - expectedScore);
  const newRating = currentRating + delta;
  return Math.round(Math.max(800, Math.min(2500, newRating)));
}

export { BASE_RATING, K_USER };
