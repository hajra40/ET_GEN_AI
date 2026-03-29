import { afterEach, describe, expect, it, vi } from "vitest";

describe("AMFI service fallback", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("fails gracefully when the external NAV source times out", async () => {
    vi.doMock("@/lib/config/feature-flags", () => ({
      featureFlags: {
        amfiNavBaseUrl: "https://www.amfiindia.com",
        nseDataBaseUrl: "https://www.nseindia.com",
        enableAmfiSync: true,
        enableBenchmarkSync: false,
        enableRealUploadParsing: true,
        enableGeminiSummaries: false
      }
    }));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("timeout");
      })
    );

    const { fetchLatestNavBySchemeCode } = await import("@/lib/services/amfi");
    const result = await fetchLatestNavBySchemeCode("123456");

    expect(result).toBeNull();
  });
});
