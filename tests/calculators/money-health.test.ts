import { describe, expect, it } from "vitest";
import { calculateMoneyHealthScore } from "@/lib/calculators/money-health";
import { demoProfiles } from "@/lib/data/demo-profiles";

describe("calculateMoneyHealthScore", () => {
  it("returns explainable dimension output", () => {
    const profile = demoProfiles.find((item) => item.email === "sunita@demo.in")!;
    const result = calculateMoneyHealthScore(profile);

    expect(result.dimensions).toHaveLength(6);
    expect(result.dimensions.every((dimension) => dimension.reason)).toBe(true);
    expect(result.scoreDrivers?.length).toBeGreaterThan(0);
    expect(result.missingDataThatCouldChangeThis?.length).toBeGreaterThan(0);
  });
});
