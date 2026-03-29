import { NextResponse } from "next/server";
import { mockParseForm16 } from "@/lib/calculators/portfolio";
import { getServerSession } from "@/lib/auth/session";
import { demoPortfolios } from "@/lib/data/demo-portfolios";
import { setPortfolioByEmail } from "@/lib/data/store";
import { featureFlags } from "@/lib/config/feature-flags";
import { assessForm16Confidence } from "@/lib/parsers/form16/confidence";
import { extractTextFromDocumentBytes } from "@/lib/parsers/form16/extract-text";
import { mapForm16ToTaxInput } from "@/lib/parsers/form16/map-to-tax-input";
import { parseForm16Text } from "@/lib/parsers/form16/parse-form16";
import { parseCasPdf } from "@/lib/parsers/portfolio/parse-cas-pdf";
import { parsePortfolioCsvText } from "@/lib/parsers/portfolio/parse-csv";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const kind = String(formData.get("kind") ?? "");
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required." }, { status: 400 });
  }

  if (kind === "form16") {
    if (featureFlags.enableRealUploadParsing) {
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const text = extractTextFromDocumentBytes(bytes);
        const parsed = parseForm16Text(text);
        const confidence = assessForm16Confidence(parsed);

        if (confidence.score >= 45) {
          const extracted = {
            ...mapForm16ToTaxInput(parsed),
            dataQuality: confidence.label,
            sourceLabel:
              confidence.score >= 75 ? "Extracted from file" : "Estimated from template"
          };

          return NextResponse.json({
            extracted,
            confidence,
            mode: confidence.score >= 75 ? "extracted" : "estimated",
            message:
              confidence.score >= 75
                ? "Extracted key salary fields from the uploaded file. Please confirm rent, city type, and any missing deductions."
                : "Estimated draft values from the uploaded template. Please confirm each field before relying on the tax result."
          });
        }
      } catch {
        // Fall back to demo-safe behavior below.
      }
    }

    return NextResponse.json({
      extracted: mockParseForm16(),
      confidence: {
        label: "demo",
        score: 25,
        explanation:
          "The file could not be parsed confidently, so a demo-safe sample was loaded instead.",
        lastUpdated: new Date().toISOString()
      },
      mode: "demo",
      message: "Demo sample loaded because the uploaded Form 16 could not be parsed with enough confidence."
    });
  }

  if (kind === "portfolio") {
    try {
      if (file.name.toLowerCase().endsWith(".csv")) {
        const text = await file.text();
        const funds = parsePortfolioCsvText(text);

        if (funds.length > 0) {
          const savedFunds = await setPortfolioByEmail(session.email, funds);
          return NextResponse.json({
            funds: savedFunds,
            confidence: {
              label: funds.some((fund) => (fund.transactions?.length ?? 0) > 0) ? "estimated" : "exact",
              score: funds.some((fund) => (fund.transactions?.length ?? 0) > 0) ? 78 : 88,
              explanation:
                funds.some((fund) => (fund.transactions?.length ?? 0) > 0)
                  ? "CSV parsed successfully. Snapshot values are solid, though some benchmarks and holdings may still be estimated."
                  : "CSV snapshot parsed successfully. XIRR will remain unavailable until transaction dates are provided.",
              lastUpdated: new Date().toISOString()
            },
            mode: "extracted",
            message: "CSV parsed successfully and portfolio holdings were reconstructed."
          });
        }
      }

      if (featureFlags.enableRealUploadParsing && file.name.toLowerCase().endsWith(".pdf")) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const parsed = parseCasPdf(bytes);

        if (parsed.funds.length > 0) {
          const savedFunds = await setPortfolioByEmail(session.email, parsed.funds);
          return NextResponse.json({
            funds: savedFunds,
            confidence: parsed.confidence,
            mode: "estimated",
            message: "Estimated portfolio rows were extracted from the uploaded statement text. Please review fund names and values."
          });
        }
      }

      const demoFunds = demoPortfolios["kabir@demo.in"] ?? [];
      const savedFunds = await setPortfolioByEmail(session.email, demoFunds);
      return NextResponse.json({
        funds: savedFunds,
        confidence: {
          label: "demo",
          score: 25,
          explanation:
            "The uploaded statement could not be parsed confidently, so a demo-safe sample portfolio was loaded.",
          lastUpdated: new Date().toISOString()
        },
        mode: "demo",
        message: "Demo sample loaded because the uploaded portfolio statement could not be parsed confidently."
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Unable to save portfolio." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Unsupported upload kind." }, { status: 400 });
}
