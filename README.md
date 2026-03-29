# AI Money Mentor

AI Money Mentor is a polished Next.js 14 fintech MVP for Indian users. It ships as a single repo with a production-style app structure, seeded demo accounts, deterministic financial calculators, local auth, and an AI-style insight layer grounded in computed profile data.

This project is an AI personal finance mentor for Indian users, and the important part is that it is **not just a chatbot with finance labels**. Each major page is backed by actual calculation logic, and AI is mainly used to explain those outputs in simple language.

## What is included

- 5-minute onboarding wizard
- Money Health Score across 6 deterministic dimensions
- FIRE Path Planner with corpus math, SIP requirement, and roadmap
- Life Event Financial Advisor for bonus, marriage, baby, inheritance, job loss, and home purchase
- Tax Wizard for salaried users with old vs new regime comparison
- Couple's Money Planner with combined emergency fund and SIP split
- Mutual Fund Portfolio X-Ray with manual entry, CSV import, PDF parsing attempt, confidence labels, and fallback-safe demo handling
- AI Insights chat grounded in profile data
- App Router loading states for slow page transitions
- Local demo auth and seeded data
- PostgreSQL/Supabase-compatible schema and seed SQL

## Tech stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Recharts
- Zod
- Local auth + demo in-memory store, with optional Supabase-backed persistence

## Folder structure

```text
ET_Gen_AI/
|-- app/
|   |-- (auth)/
|   |   |-- demo/page.tsx
|   |   |-- login/page.tsx
|   |   |-- signup/page.tsx
|   |   `-- layout.tsx
|   |-- (app)/
|   |   |-- dashboard/page.tsx
|   |   |-- onboarding/page.tsx
|   |   |-- money-health/page.tsx
|   |   |-- fire-planner/page.tsx
|   |   |-- life-events/page.tsx
|   |   |-- tax-wizard/page.tsx
|   |   |-- couple-planner/page.tsx
|   |   |-- portfolio-xray/page.tsx
|   |   |-- insights/page.tsx
|   |   |-- settings/page.tsx
|   |   |-- loading.tsx
|   |   `-- layout.tsx
|   |-- api/
|   |   |-- auth/login/route.ts
|   |   |-- auth/signup/route.ts
|   |   |-- auth/logout/route.ts
|   |   |-- profile/route.ts
|   |   |-- insights/route.ts
|   |   |-- ai-summary/route.ts
|   |   |-- uploads/route.ts
|   |   |-- money-health/route.ts
|   |   |-- fire/route.ts
|   |   |-- life-events/route.ts
|   |   |-- tax/route.ts
|   |   |-- couple/route.ts
|   |   `-- portfolio/route.ts
|   |-- globals.css
|   |-- layout.tsx
|   |-- loading.tsx
|   `-- page.tsx
|-- components/
|   |-- dashboard/
|   |-- forms/
|   |-- layout/
|   |   `-- page-loader.tsx
|   |-- modules/
|   |-- shared/
|   `-- ui/
|-- lib/
|   |-- ai/
|   |-- auth/
|   |-- calculators/
|   |-- config/
|   |-- data/
|   |-- parsers/
|   |-- services/
|   |-- supabase/
|   |-- types/
|   `-- utils.ts
|-- public/
|   `-- sample-portfolio.csv
|-- scripts/
|   `-- seed-demo.mjs
|-- supabase/
|   |-- schema.sql
|   `-- seed.sql
|-- .env.example
|-- package.json
|-- tailwind.config.ts
`-- tsconfig.json
```

## Demo accounts

Password for every seeded account: `demo123`

- `aanya@demo.in` - young salaried user
- `rohan@demo.in` - married user
- `priya@demo.in` - married partner profile
- `nikhil@demo.in` - high-saver FIRE aspirant
- `sunita@demo.in` - poor financial health profile
- `kabir@demo.in` - mutual fund portfolio sample user

## Environment variables

Create `.env.local` from `.env.example`.

```env
NEXT_PUBLIC_APP_NAME=AI Money Mentor
SESSION_COOKIE_NAME=ai-money-mentor-session
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash-lite
ENABLE_GEMINI_SUMMARIES=true
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The app runs without Supabase. Gemini-powered summaries require `GEMINI_API_KEY`, and you should restart the dev server after changing env values. Local demo mode still works out of the box.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Open:

   ```text
   http://localhost:3000
   ```

4. Log in with a demo account or create a local account.

## Optional database setup

The MVP itself uses a local in-memory store for zero-friction hackathon demos. If you want PostgreSQL or Supabase persistence:

1. Create a new Supabase project.
2. Run [`supabase/schema.sql`](./supabase/schema.sql).
3. Run [`supabase/seed.sql`](./supabase/seed.sql).
4. Replace the in-memory store in `lib/data/store.ts` with Supabase queries.

## Financial engine notes

- Money Health Score is deterministic and based on rules, ratios, and caps.
- FIRE math uses:
  - inflation-adjusted annual expenses at retirement
  - a 25x retirement corpus approximation
  - future value of current corpus and monthly SIP contributions
- Tax logic is rule-based for salaried users and includes:
  - HRA exemption under the old regime
  - common 80C, 80D, 80CCD(1B), employer NPS, and home-loan interest handling
  - old vs new regime tax comparison with rebate logic
- Portfolio X-Ray includes:
  - asset allocation reconstruction
  - overlap analysis using top holdings
  - expense ratio drag estimate
  - approximate annualized return and benchmark comparison

## Import flows

- Portfolio CSV:
  - Upload `public/sample-portfolio.csv`
  - Or upload your own CSV with these headers:

    ```text
    fundname,category,investedamount,currentvalue,expenseratio,benchmarkreturn,annualizedreturn,styletags
    ```

- Portfolio PDF:
  - Uses a working placeholder parser that loads realistic sample holdings

- Form 16 PDF:
  - Uses a working placeholder extractor that loads a structured salary input object

## AI insight prompts

Built-in sample prompts:

- Can I retire by 45 if I keep my current lifestyle?
- How much should I increase my SIP after my next appraisal?
- Is my emergency fund enough for a job loss shock?
- Which tax regime fits me better this year and why?
- What should we fix first as a couple?
- What should I do with a ₹5 lakh annual bonus?

Prompt helpers live in:

- `lib/ai/prompts.ts`
- `lib/ai/insights.ts`

## Useful scripts

- `npm run dev` - start local development
- `npm run build` - production build
- `npm run start` - run production build
- `npm run lint` - Next.js linting
- `npm run seed` - print demo account and SQL seeding info

## Product disclaimers

- All results are projections, estimates, or suggestions based on visible assumptions.
- The app does not promise guaranteed returns or guaranteed tax outcomes.
- Tax handling is optimized for standard salaried scenarios, not complex business, capital gains, or multi-source cases.
- Upload parsing for PDF statements/Form 16 is intentionally hackathon-safe and falls back to realistic structured sample extraction.
