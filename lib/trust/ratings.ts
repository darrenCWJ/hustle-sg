export interface RatingLike {
  from_id: string;
  stars: number;
}

export interface AggregatedRating {
  /** Pair-aware average: each unique rater contributes their mean ONCE. */
  average: number | null;
  /** Distinct people who rated. */
  uniqueRaters: number;
  /** Raw number of rating rows. */
  totalRatings: number;
}

/**
 * Collusion-resistant rating aggregation. A naive average lets one colluding
 * counterparty file dozens of 5★ reviews across repeat gigs and drag the
 * number wherever they want. Here every unique rater counts once (their own
 * ratings are averaged first), so a rating ring of size one moves the score
 * no more than any single honest client.
 */
export function aggregateRatings(ratings: RatingLike[]): AggregatedRating {
  if (ratings.length === 0) {
    return { average: null, uniqueRaters: 0, totalRatings: 0 };
  }

  const byRater = new Map<string, { sum: number; count: number }>();
  for (const r of ratings) {
    const entry = byRater.get(r.from_id) ?? { sum: 0, count: 0 };
    byRater.set(r.from_id, { sum: entry.sum + r.stars, count: entry.count + 1 });
  }

  const perRaterMeans = [...byRater.values()].map((e) => e.sum / e.count);
  const average =
    Math.round((perRaterMeans.reduce((s, m) => s + m, 0) / perRaterMeans.length) * 10) / 10;

  return { average, uniqueRaters: byRater.size, totalRatings: ratings.length };
}
