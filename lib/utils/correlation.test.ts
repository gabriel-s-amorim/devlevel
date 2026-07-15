import { describe, it, expect } from "vitest";
import { pearsonCorrelation } from "@/lib/utils/correlation";

describe("pearsonCorrelation", () => {
  it("returns null for mismatched or short series", () => {
    expect(pearsonCorrelation([1], [2])).toBeNull();
    expect(pearsonCorrelation([1, 2], [1])).toBeNull();
    expect(pearsonCorrelation([], [])).toBeNull();
  });

  it("returns null when variance is zero", () => {
    expect(pearsonCorrelation([2, 2, 2], [1, 2, 3])).toBeNull();
    expect(pearsonCorrelation([1, 2, 3], [5, 5, 5])).toBeNull();
  });

  it("returns 1 for perfect positive correlation", () => {
    const r = pearsonCorrelation([1, 2, 3, 4], [2, 4, 6, 8]);
    expect(r).not.toBeNull();
    expect(r!).toBeCloseTo(1, 10);
  });

  it("returns -1 for perfect negative correlation", () => {
    const r = pearsonCorrelation([1, 2, 3, 4], [8, 6, 4, 2]);
    expect(r).not.toBeNull();
    expect(r!).toBeCloseTo(-1, 10);
  });

  it("returns a value in (-1, 1) for partial correlation", () => {
    const r = pearsonCorrelation([1, 2, 3, 4, 5], [1, 2, 2.5, 4, 4.5]);
    expect(r).not.toBeNull();
    expect(r!).toBeGreaterThan(0.9);
    expect(r!).toBeLessThan(1);
  });
});
