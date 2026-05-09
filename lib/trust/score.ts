export interface TrustInput {
  singpassVerified: boolean;
  verifiedCertCount: number;
  portfolioItemCount: number;
  hiredCount: number;
}

export interface TrustBreakdown {
  label: string;
  points: number;
  max: number;
}

export interface TrustResult {
  score: number;
  percentile: string;
  breakdown: TrustBreakdown[];
}

export function computeTrustScore(input: TrustInput): TrustResult {
  const singpassPoints = input.singpassVerified ? 30 : 0;
  const certPoints = Math.min(input.verifiedCertCount * 8, 32);
  const portfolioPoints = Math.min(input.portfolioItemCount * 4, 16);
  const trackPoints = Math.min(input.hiredCount * 2, 12);

  const score = Math.min(20 + singpassPoints + certPoints + portfolioPoints + trackPoints, 100);

  const percentile =
    score >= 90 ? "top 2%" :
    score >= 80 ? "top 10%" :
    score >= 70 ? "top 25%" :
    score >= 50 ? "above avg" :
    "verify to increase";

  return {
    score,
    percentile,
    breakdown: [
      { label: "Base score", points: 20, max: 20 },
      { label: "Singpass identity", points: singpassPoints, max: 30 },
      { label: "Verified credentials", points: certPoints, max: 32 },
      { label: "Portfolio items", points: portfolioPoints, max: 16 },
      { label: "Track record", points: trackPoints, max: 12 },
    ],
  };
}
