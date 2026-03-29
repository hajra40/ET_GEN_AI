# Assumptions Reference

## Why this exists

The app now surfaces the main planning assumptions instead of hiding them inside calculators.
Every major module can attach:

- assumptions used
- confidence level
- missing inputs that could improve accuracy
- source provenance where available

## Core planning assumptions

### FIRE and goals

- Planning inflation: `6%`
- Retirement corpus multiple: `25x` inflation-adjusted annual expenses
- Short-term goal return assumption: `7%`
- Medium-term goal return assumption: `9%`
- Long-term goal return assumption: `11%`
- Risk-adjusted return defaults:
  - conservative: `8%`
  - balanced: `9.5%`
  - growth: `11%`
  - aggressive: `12%`

### Emergency fund

- Single / no dependents baseline: `6 months`
- Family / dependents baseline: `9 months`
- Conservative buffer add-on: `+1 month`

### Insurance

- Life cover baseline: `12x annual income`
- Dependent reserve add-on: `Rs.500,000` per dependent
- Disability cover baseline: `5x annual income`
- Personal accident cover baseline: `6x annual income`
- Health cover baseline:
  - single adult: `Rs.500,000`
  - family baseline: `Rs.1,000,000`
  - metro add-on: `Rs.250,000`

### Debt stress

- EMI watch threshold: `30%` of monthly income
- EMI critical threshold: `45%` of monthly income

### Money-health score weighting

- Emergency preparedness: `18%`
- Insurance coverage: `18%`
- Investment diversification: `14%`
- Debt health: `16%`
- Tax efficiency: `14%`
- Retirement readiness: `20%`

## Tax assumptions

Versioned tax rules now live in `lib/config/tax-rules.ts`.

- Supported tax years:
  - `AY2025-26`
  - `AY2026-27`
- Supported typical salaried-user items:
  - standard deduction
  - HRA
  - professional tax
  - 80C
  - 80D
  - NPS employee / employer
  - home-loan interest in the old regime

## Portfolio assumptions

- Benchmark mapping is category-based when exact benchmark history is unavailable.
- XIRR is only shown when dated transaction cash flows exist.
- Overlap is:
  - exact when underlying holdings exist
  - estimated when only category / style clues exist
  - unavailable when neither exists

## Trust labels used in the UI

- `exact`: supported directly by the available inputs or transaction history
- `estimated`: deterministic output based on partial data or explicit assumptions
- `unavailable`: cannot be computed honestly from available inputs
- `demo`: safe fallback sample data was loaded

## Files to review

- `lib/config/finance-assumptions.ts`
- `lib/config/tax-rules.ts`
- `lib/config/benchmarks.ts`
- `components/shared/assumptions-panel.tsx`
- `components/shared/confidence-badge.tsx`
- `components/shared/source-badge.tsx`
