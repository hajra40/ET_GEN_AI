# Demo vs Real Modes

## Goal

The app should stay usable even when uploads are weak, live sources are off, or external services fail.
It now distinguishes between real, estimated, unavailable, and demo states instead of silently pretending all data is equally trustworthy.

## Mode definitions

### Exact

Used when the app has the required inputs directly.

Examples:

- transaction-based XIRR from dated cash flows
- calculator outputs from complete manual inputs
- exact overlap from actual underlying holdings

### Estimated

Used when the app can produce a deterministic answer, but not from complete inputs.

Examples:

- tax score using profile-level rent proxy
- portfolio overlap inferred from category and style tags
- statement parsing with partial field coverage

### Unavailable

Used when the app cannot compute a result honestly.

Examples:

- XIRR from snapshot-only holdings
- exact overlap when no holdings or style clues exist

### Demo

Used when the app falls back to demo-safe sample data.

Examples:

- low-confidence Form 16 upload fallback
- low-confidence portfolio PDF upload fallback

## Current fallback paths

### Form 16 uploads

1. Try real text extraction and regex parsing
2. Score extraction confidence
3. If confidence is usable:
   - return extracted or estimated draft values
4. If confidence is too low:
   - load the existing demo-safe sample tax payload

### Portfolio uploads

1. Try CSV parsing
2. Try statement-derived PDF/text parsing when enabled
3. If parsing is usable:
   - save reconstructed funds
4. If parsing is too weak:
   - load the existing demo-safe sample portfolio

## UI indicators

Shared trust components now live in:

- `components/shared/confidence-badge.tsx`
- `components/shared/source-badge.tsx`
- `components/shared/assumptions-panel.tsx`

These are intended to make mode state obvious on:

- FIRE planner
- Tax wizard
- Portfolio X-Ray
- Money health
- Couple planner
- Settings
