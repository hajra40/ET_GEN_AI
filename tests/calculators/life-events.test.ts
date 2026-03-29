import { describe, expect, it } from "vitest";
import { buildLifeEventPlan } from "@/lib/calculators/life-events";
import { demoProfiles } from "@/lib/data/demo-profiles";

describe("buildLifeEventPlan", () => {
  it("supports emergency medical event planning", () => {
    const profile = demoProfiles.find((item) => item.email === "aanya@demo.in")!;
    const result = buildLifeEventPlan(profile, {
      eventType: "emergency_medical_event",
      answers: {
        medicalCost: 300000,
        incomePauseMonths: 1,
        insuranceReimbursement: 150000
      }
    });

    expect(result.now.length).toBeGreaterThan(0);
    expect(result.insuranceAndTaxNote).toContain("claim");
  });
});
