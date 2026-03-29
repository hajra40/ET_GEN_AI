# Testing Checklist

## Automated checks

Run these before shipping:

1. `npm.cmd run typecheck`
2. `npm.cmd run lint`
3. `npm.cmd test`
4. `npm.cmd run build`

## Current automated coverage

### Calculator tests

- FIRE planner
- tax comparison
- insurance gap detection
- goal funding waterfall
- money-health score explainability
- portfolio X-Ray exact vs unavailable XIRR behavior
- couple planner scenario output
- life-event planning

### Parser tests

- Form 16 text parsing
- CSV portfolio parsing
- statement text parsing
- PDF-like statement extraction path

### Route tests

- `app/api/fire/route.ts`
- `app/api/tax/route.ts`
- `app/api/portfolio/route.ts`
- `app/api/uploads/route.ts`

### Service tests

- AMFI timeout fallback

### UI snapshot tests

- assumptions panel

## Required user scenarios

- Demo profile Aanya
- no-goals user
- underfunded user
- high-income old-regime user
- new-regime better user
- portfolio with only snapshot values
- portfolio with transactions enabling exact XIRR
- upload parse success
- upload parse low-confidence fallback
- external source timeout fallback

## Manual verification notes

- Confirm demo login still works
- Confirm dashboard and all major routes still render
- Confirm uploads show exact / estimated / demo labels clearly
- Confirm FIRE planner exposes monthly plan, goals, assumptions, and immediate actions
- Confirm tax wizard shows tax year and confidence
- Confirm portfolio X-Ray does not fake XIRR
