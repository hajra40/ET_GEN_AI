# Implementation Plan

## Audit Snapshot

### Current app surface

- App routes already present:
  - `app/(app)/money-health/page.tsx`
  - `app/(app)/fire-planner/page.tsx`
  - `app/(app)/tax-wizard/page.tsx`
  - `app/(app)/couple-planner/page.tsx`
  - `app/(app)/portfolio-xray/page.tsx`
  - `app/(app)/life-events/page.tsx`
  - `app/(app)/insights/page.tsx`
  - `app/(app)/settings/page.tsx`
- API routes already present:
  - `app/api/fire/route.ts`
  - `app/api/tax/route.ts`
  - `app/api/couple/route.ts`
  - `app/api/money-health/route.ts`
  - `app/api/portfolio/route.ts`
  - `app/api/uploads/route.ts`
  - `app/api/insights/route.ts`
  - `app/api/ai-summary/route.ts`
  - `app/api/profile/route.ts`
- Primary finance calculators:
  - `lib/calculators/fire.ts`
  - `lib/calculators/tax.ts`
  - `lib/calculators/couple.ts`
  - `lib/calculators/portfolio.ts`
  - `lib/calculators/money-health.ts`
  - `lib/calculators/life-events.ts`
  - `lib/calculators/shared.ts`
- Shared types and schemas:
  - `lib/types/finance.ts`
  - `lib/types/schemas.ts`
  - `lib/types/index.ts`
- Demo and persistence layer:
  - `lib/data/demo-profiles.ts`
  - `lib/data/demo-portfolios.ts`
  - `lib/data/demo-meta.ts`
  - `lib/data/store.ts`
- AI layer:
  - `lib/ai/client.ts`
  - `lib/ai/gemini-service.ts`
  - `lib/ai/insights.ts`
  - `lib/ai/prompts.ts`

### Current data flow

- User profile data is typed in `lib/types/finance.ts`, validated in `lib/types/schemas.ts`, loaded and persisted via `lib/data/store.ts`.
- Dashboard and module pages receive a `UserProfile`, then compute results in-process with deterministic calculators.
- API routes in `app/api/*/route.ts` are very thin wrappers around calculators and currently preserve direct JSON contracts.
- `lib/data/compose.ts` builds the cross-module insight context by combining money health, FIRE, tax, and portfolio outputs.
- Uploads currently flow through `app/api/uploads/route.ts`, which branches by `kind` and either:
  - uses `parsePortfolioCsv()` for CSV portfolios,
  - uses `mockParseForm16()` for Form 16,
  - loads `demoPortfolios["kabir@demo.in"]` for PDF portfolio fallback.

### Current calculator contracts

- `calculateFirePlan(input: FirePlanInput): FirePlanResult`
  - Inputs: age, income, expenses, savings, investments, retirement age, inflation, return assumption, goals, risk appetite
  - Outputs: target corpus, projected corpus, SIP need, annual savings rate, emergency target, fallback suggestions, insurance suggestions, yearly roadmap, allocation guidance, summary
- `compareTaxRegimes(input: TaxWizardInput): TaxWizardResult`
  - Inputs: salary fields, HRA, rent, city type, 80C/80D/NPS, home loan interest, other deductions
  - Outputs: old vs new tax, taxable income, best regime, savings delta, missed deductions, ranked suggestions, explanation
- `calculateMoneyHealthScore(profile: UserProfile): MoneyHealthScoreResult`
  - Inputs: full profile
  - Outputs: overall score, six dimension scores, recommendations, narrative
- `calculateCouplePlan(input: CouplePlannerInput): CouplePlannerResult`
  - Inputs: partner A, partner B, shared expenses, joint goals
  - Outputs: combined income/expenses/net worth, joint emergency target, SIP split, suggestions, solo vs joint delta
- `calculatePortfolioXRay(funds: PortfolioFund[]): PortfolioXRayResult`
  - Inputs: portfolio funds
  - Outputs: asset allocation, overlap, expense drag, benchmark comparison, xirr approximation, suggestions, warnings
- `buildLifeEventPlan(profile, input): LifeEventActionPlan`
  - Inputs: profile plus event answers
  - Outputs: emergency guidance, allocation guidance, insurance/tax note, now/3 months/12 months actions

## Audit Findings

### Existing strengths to preserve

- The repo already has a clean module-per-route structure.
- Demo accounts and demo portfolios are seeded and should remain untouched as a fallback experience.
- Calculator-backed UX already exists for every major screen, so the safest path is to deepen outputs rather than redesign flows.
- Thin route handlers mean we can upgrade calculators while preserving route URLs and call sites.

### Current hardcoded assumptions to centralize

- FIRE hardcodes:
  - inflation defaults
  - expected return defaults by risk appetite
  - retirement corpus multiple of `25x`
  - emergency target of `6` or `9` months
  - generic insurance guidance
- Tax hardcodes:
  - slab structures
  - rebate logic
  - deduction caps
  - standard deduction values
  - annual-year-specific logic inline in calculator code
- Money health hardcodes:
  - emergency target months
  - insurance target multipliers
  - diversification scoring
  - debt stress scoring
  - tax score weighting
  - retirement score assumptions
- Portfolio hardcodes:
  - default benchmark return
  - default annualized return assumptions in manual data paths
  - placeholder top holdings
  - `xirrApproximation = portfolioReturn`
- UI copy currently references approximate or sample behavior without a reusable trust-state model.

### Current mocked, estimated, or placeholder behavior

- `app/api/uploads/route.ts`
  - Form 16 upload uses `mockParseForm16()`
  - PDF portfolio upload loads demo holdings
- `lib/calculators/portfolio.ts`
  - CSV parsing assumes exact headers and injects placeholder holdings
  - benchmark return defaults to `11`
  - overlap math silently depends on placeholder holdings
  - XIRR is not real
- `components/modules/portfolio-xray.tsx`
  - badge and AI context present approximate XIRR as if it were available
- `lib/ai/insights.ts`
  - explanatory layer references approximate outputs directly and is not grounded in structured facts packets
- `components/modules/tax-wizard.tsx`
  - upload message implies sample extraction, but confidence and source provenance are not modeled

### Goals, risk, tax, and portfolio data currently passed through the app

- Goals:
  - captured in onboarding schema and stored in profile
  - displayed in dashboard and used in `FirePlanInput.lifeGoals`
  - not yet deeply used in planning or couple optimization
- Risk appetite:
  - stored on profile
  - used to select expected return defaults in FIRE and compose layer
  - not yet used to set explicit goal-bucket allocations from shared assumptions
- Tax regime:
  - stored as preference
  - compared against calculated winner in money health
  - old/new comparison already available in tax wizard
- Portfolio data:
  - stored by email in `lib/data/store.ts`
  - consumed by insight context and portfolio module
  - upload pipeline is partly real for CSV and demo-only for PDF/CAS

### Compatibility constraints discovered during audit

- API routes currently return raw calculator results, so calculator output changes must be backward-compatible or coordinated with module components.
- Demo mode relies on in-memory/local fallback behavior plus seeded profiles; this must remain the final fallback path when parsing or external sync fails.
- There is no current dedicated test framework configured in `package.json`, so test infrastructure needs to be added carefully.
- The worktree already contains unrelated edits in `components/forms/auth-form.tsx` and an untracked `components.zip`; these should remain untouched unless the task requires otherwise.

## Delivery Strategy

### Phase 0

- [x] Audit routes, calculators, types, data flow, and existing mock/demo paths.
- [x] Create this implementation plan document.

### Phase 1: Central assumptions and trust metadata

- [ ] Add:
  - `lib/config/finance-assumptions.ts`
  - `lib/config/tax-rules.ts`
  - `lib/config/benchmarks.ts`
  - `lib/config/feature-flags.ts`
- [ ] Add typed assumption model and helpers like `getAssumptionsForModule()`.
- [ ] Expand finance types to support:
  - assumptions
  - confidence
  - source provenance
  - freshness timestamps
  - exact vs estimated vs unavailable vs demo states

### Phase 2: Goal and protection engines

- [ ] Add `lib/calculators/goals.ts`.
- [ ] Add `lib/calculators/insurance.ts`.
- [ ] Extend `UserProfile` and related schemas for:
  - deeper goals
  - city tier
  - employer benefits
  - debt details
  - uploaded-data override metadata
- [ ] Integrate goal funding and insurance gaps into:
  - FIRE
  - money health
  - couple planner
  - life events

### Phase 3: FIRE planner upgrade

- [ ] Preserve existing yearly summary.
- [ ] Add monthly roadmap generation and yearly rollups.
- [ ] Integrate retirement plus non-retirement goals into funding math.
- [ ] Surface assumptions, funding waterfall, underfunded items, and immediate actions.
- [ ] Update `components/modules/fire-planner.tsx` to add:
  - monthly plan
  - goal funding
  - assumptions
  - what to do now

### Phase 4: Money health score 2.0

- [ ] Keep six-dimension layout intact.
- [ ] Return richer dimension objects with reasons, inputs, assumptions, severity, and top action.
- [ ] Add missing-data and score-driver sections.
- [ ] Replace hidden proxies with visible proxy assumptions where unavoidable.

### Phase 5: Tax engine versioning and Form 16 pipeline

- [ ] Version tax rules by financial year / assessment year.
- [ ] Keep old/new comparison, HRA, 80C, 80D, NPS, and home-loan logic.
- [ ] Expand result explanation and ranked actions.
- [ ] Add real parser path under:
  - `lib/parsers/form16/extract-text.ts`
  - `lib/parsers/form16/parse-form16.ts`
  - `lib/parsers/form16/map-to-tax-input.ts`
  - `lib/parsers/form16/confidence.ts`
- [ ] Preserve explicit fallback labels:
  - extracted from file
  - estimated from template
  - demo sample loaded

### Phase 6: Portfolio X-Ray honesty upgrade

- [ ] Add:
  - `lib/parsers/portfolio/parse-csv.ts`
  - `lib/parsers/portfolio/parse-cas-text.ts`
  - `lib/parsers/portfolio/parse-cas-pdf.ts`
  - `lib/parsers/portfolio/normalize-schemes.ts`
  - `lib/calculators/xirr.ts`
  - `lib/calculators/holdings-overlap.ts`
  - `lib/services/amfi.ts`
  - `lib/services/benchmarks.ts`
- [ ] Replace fake XIRR with:
  - exact XIRR when cash flows exist
  - explicit unavailable state for snapshot-only data
  - separate estimated return only when honestly labeled
- [ ] Replace silent placeholder holdings with estimated or unavailable overlap states.
- [ ] Preserve demo PDF fallback with explicit demo badge.

### Phase 7: Couple planner and life events

- [ ] Make couple planner consume real `jointGoals`.
- [ ] Run partner-wise tax comparison and contribution split scenarios.
- [ ] Add insurance split and goal ownership rationale.
- [ ] Make life events re-run monthly roadmap and reprioritization logic instead of returning static heuristics.

### Phase 8: External data and AI explainer

- [ ] Add:
  - `lib/services/http.ts`
  - `lib/services/cache.ts`
  - `lib/services/income-tax-metadata.ts`
  - `lib/services/cams-kfintech.ts`
  - `lib/services/nse-benchmarks.ts`
  - `lib/ai/grounded-explanations.ts`
- [ ] Use official-source-backed adapters with timeouts, retries, provenance, and graceful fallback.
- [ ] Keep Gemini as optional explainer only, never the source of numeric truth.

### Phase 9: Shared trust UX

- [ ] Add:
  - `components/shared/assumptions-panel.tsx`
  - `components/shared/confidence-badge.tsx`
  - `components/shared/source-badge.tsx`
- [ ] Use these across FIRE, tax, portfolio, money health, couple planner, and uploads.

### Phase 10: Test and verify

- [ ] Add unit tests for every modified calculator.
- [ ] Add parser fixtures and parser tests.
- [ ] Add API integration coverage for key routes.
- [ ] Add snapshot coverage for assumptions panel.
- [ ] Add regression coverage for demo flows.
- [ ] Run typecheck, lint, tests, and production build before finishing.

## Safe rollout order

1. Add typed config, assumption, confidence, and provenance primitives.
2. Expand finance types and schemas without breaking current routes.
3. Upgrade calculators behind backward-compatible result extensions.
4. Update module UIs to consume richer results while keeping current summary cards.
5. Add parsers and external adapters behind feature flags and graceful fallbacks.
6. Add grounded AI explanations based on deterministic facts packets.
7. Add tests, then run full verification.

## Explicit non-goals for the refactor

- Do not remove demo mode.
- Do not remove or rename existing routes.
- Do not move core numeric logic into AI.
- Do not silently present estimates as exact values.
- Do not rely on external services for the app to remain usable.
