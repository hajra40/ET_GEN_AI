import { describe, expect, it } from "vitest";
import { calculateInsuranceGap } from "@/lib/calculators/insurance";
import { demoProfiles } from "@/lib/data/demo-profiles";

describe("calculateInsuranceGap", () => {
  it("identifies protection gaps for underinsured users", () => {
    const profile = demoProfiles.find((item) => item.email === "sunita@demo.in")!;
    const result = calculateInsuranceGap(profile);

    expect(result.lifeCoverGap).toBeGreaterThan(0);
    expect(result.healthCoverGap).toBeGreaterThan(0);
    expect(result.recommendedActions.length).toBeGreaterThan(0);
  });
});
