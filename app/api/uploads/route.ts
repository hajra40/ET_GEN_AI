import { NextResponse } from "next/server";
import { mockParseForm16, parsePortfolioCsv } from "@/lib/calculators/portfolio";
import { getServerSession } from "@/lib/auth/session";
import { demoPortfolios } from "@/lib/data/demo-portfolios";
import { setPortfolioByEmail } from "@/lib/data/store";

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
    return NextResponse.json({
      extracted: mockParseForm16(),
      message: file.name.endsWith(".pdf")
        ? "Loaded a sample Form 16 extraction from the PDF placeholder flow."
        : "Loaded sample salary data from the uploaded file."
    });
  }

  if (kind === "portfolio") {
    if (file.name.endsWith(".csv")) {
      const text = await file.text();
      const funds = parsePortfolioCsv(text);
      setPortfolioByEmail(session.email, funds);
      return NextResponse.json({
        funds,
        message: "CSV parsed successfully and portfolio holdings were reconstructed."
      });
    }

    const funds = demoPortfolios["kabir@demo.in"] ?? [];
    setPortfolioByEmail(session.email, funds);
    return NextResponse.json({
      funds,
      message: "PDF/CAMS/KFintech parser is running in demo mode, so a realistic sample portfolio was loaded."
    });
  }

  return NextResponse.json({ error: "Unsupported upload kind." }, { status: 400 });
}
