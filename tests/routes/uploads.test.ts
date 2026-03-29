import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getServerSession: vi.fn(async () => ({ email: "aanya@demo.in", name: "Aanya" }))
}));

vi.mock("@/lib/data/store", () => ({
  setPortfolioByEmail: vi.fn(async (_email: string, funds: unknown) => funds)
}));

describe("uploads route", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("parses Form 16 text with an extracted or estimated result", async () => {
    const fixture = fs.readFileSync(path.resolve("tests/fixtures/form16-sample.txt"), "utf8");
    const { POST } = await import("@/app/api/uploads/route");
    const formData = new FormData();
    formData.append("kind", "form16");
    formData.append("file", new File([fixture], "sample-form16.pdf", { type: "application/pdf" }));

    const response = await POST(
      new Request("http://localhost/api/uploads", {
        method: "POST",
        body: formData
      })
    );
    const data = await response.json();

    expect(["extracted", "estimated"]).toContain(data.mode);
    expect(data.extracted.annualGrossSalary).toBeGreaterThan(0);
  });

  it("falls back to demo mode for low-confidence Form 16 uploads", async () => {
    const { POST } = await import("@/app/api/uploads/route");
    const formData = new FormData();
    formData.append("kind", "form16");
    formData.append("file", new File(["no usable fields"], "unknown.pdf", { type: "application/pdf" }));

    const response = await POST(
      new Request("http://localhost/api/uploads", {
        method: "POST",
        body: formData
      })
    );
    const data = await response.json();

    expect(data.mode).toBe("demo");
    expect(data.confidence.label).toBe("demo");
  });
});
