# External Data Sources

## Design principles

- Prefer official sources only
- Add timeouts and fail gracefully
- Never block the app when a source is unavailable
- Always preserve demo-safe fallback behavior
- Surface provenance and freshness when possible

## Config and flags

Environment variables supported:

- `AMFI_NAV_BASE_URL`
- `NSE_DATA_BASE_URL`
- `ENABLE_AMFI_SYNC`
- `ENABLE_BENCHMARK_SYNC`
- `ENABLE_REAL_UPLOAD_PARSING`
- `ENABLE_GEMINI_SUMMARIES`

## Current adapters

### AMFI

- Service file: `lib/services/amfi.ts`
- Purpose:
  - scheme-name normalization
  - latest NAV lookup by scheme code when enabled
- Official references:
  - `https://www.amfiindia.com/net-asset-value`
  - `https://www.amfiindia.com/net-asset-value/nav-download`

### Income Tax references

- Service file: `lib/services/income-tax-metadata.ts`
- Rules file: `lib/config/tax-rules.ts`
- Purpose:
  - tax-year metadata
  - source provenance for rule versions
- Official references:
  - `https://www.incometax.gov.in/iec/foportal/income-tax-calculator`
  - `https://www.incometax.gov.in/iec/foportal/help/new-tax-vs-old-tax-regime-faqs`

### CAMS / KFintech statement support

- Service file: `lib/services/cams-kfintech.ts`
- Parser files:
  - `lib/parsers/portfolio/parse-cas-text.ts`
  - `lib/parsers/portfolio/parse-cas-pdf.ts`
- Purpose:
  - identify likely statement source
  - parse statement-derived text where feasible
- Official references:
  - `https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement`
  - `https://www.camsonline.com/Investors/Statements/CAS-CAMS`
  - `https://mfs.kfintech.com/investor/General/ConsolidatedAccountStatement`
  - `https://mfs.kfintech.com/investor/General/AccountStatement`

### NSE benchmarks

- Service file: `lib/services/benchmarks.ts`
- Config file: `lib/config/benchmarks.ts`
- Purpose:
  - category-to-benchmark mapping
  - future benchmark sync point when enabled
- Official references:
  - `https://www.nseindia.com/reports-indices-historical-index-data`
  - `https://www.nseindia.com/all-reports`

## Failure behavior

If a live source fails or sync is disabled:

- AMFI lookup returns `null` and the app continues with existing local data
- benchmark service falls back to visible category-mapped estimates
- upload parsers continue with estimated parsing when possible
- if parsing confidence is too low, the app falls back to explicit demo mode

## What is still intentionally conservative

- NSE benchmark-history ingestion is still mapped through category defaults unless live sync is explicitly enabled
- AMFI sync is off by default for safety
- statement parsing remains confidence-aware and does not overclaim completeness
