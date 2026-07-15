/**
 * Pearson product-moment correlation coefficient.
 * Returns null when there are fewer than 2 paired samples or either series has zero variance.
 */
export function pearsonCorrelation(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length || xs.length < 2) return null;

  const n = xs.length;
  let sumX = 0;
  let sumY = 0;
  let sumXX = 0;
  let sumYY = 0;
  let sumXY = 0;

  for (let i = 0; i < n; i++) {
    const x = xs[i];
    const y = ys[i];
    sumX += x;
    sumY += y;
    sumXX += x * x;
    sumYY += y * y;
    sumXY += x * y;
  }

  const numerator = n * sumXY - sumX * sumY;
  const denomX = n * sumXX - sumX * sumX;
  const denomY = n * sumYY - sumY * sumY;

  if (denomX <= 0 || denomY <= 0) return null;

  return numerator / Math.sqrt(denomX * denomY);
}
