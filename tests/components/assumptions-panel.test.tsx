import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AssumptionsPanel } from "@/components/shared/assumptions-panel";

describe("AssumptionsPanel", () => {
  it("matches the trust-surface snapshot", () => {
    const html = renderToStaticMarkup(
      React.createElement(AssumptionsPanel, {
        assumptions: [
          {
            id: "inflation-default",
            label: "Planning inflation",
            value: 6,
            unit: "percent",
            source: "Planner defaults",
            userVisible: true,
            module: "fire",
            description: "Used for long-term expense inflation.",
            effectiveFrom: "2025-04-01",
            confidence: "medium"
          }
        ],
        confidence: {
          label: "estimated",
          score: 78,
          explanation: "Forward-looking assumptions are still required.",
          lastUpdated: "2026-03-29"
        },
        missingInputs: ["Exact rent would improve tax precision."]
      })
    );

    expect(html).toMatchSnapshot();
  });
});
