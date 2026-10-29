# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:5173 (auto-opens browser)
npm run build      # TypeScript check + Vite production build → dist/
npm run test       # Run all tests once (Vitest)
npm run test:watch # Run tests in watch mode
npm run lint       # ESLint
npm run preview    # Preview production build locally
npm run deploy     # Publish dist/ to GitHub Pages via gh-pages
```

Run a single test file:
```bash
npx vitest run src/hooks/__tests__/useMortgageCalculations.bct.test.ts
```

## Architecture

This is a single-page React + TypeScript app (Vite) for Swedish mortgage calculations, deployed to GitHub Pages at enkelbolånekalkylator.se.

### State lives in the URL

All mortgage inputs are encoded in query parameters and parsed on load by `useMortgageState` (`src/hooks/useMortgageState.ts`). The hook writes back to `window.history.replaceState` on every state change, making every calculator state shareable/bookmarkable. On the form page (`/`), URL writes are intentionally suppressed to avoid scroll-to-top jitter while typing.

### New vs. existing loan

`loanMode` (`'new'` | `'existing'`, URL param `loanMode`) is chosen at the top of the form page. In existing mode the form asks for the property's current value and the remaining debt (stored internally as `downPayment = value − debt`), income is optional, and a manually entered amortization may be below amorteringskravet (old loans can be exempt). New loans always use at least the required amortization.

### Two-page flow

- `/` — `MortgageFormPage`: input form, no results shown until form is complete
- `/resultat` — `App.tsx`: results page, reads state from URL, redirects back if form incomplete
- `/sparade-berakningar` — `SavedCalculationsPage`: saved calculations (stored in `localStorage`)

Routing is done with TanStack Router, defined entirely in `src/router.tsx`.

### Calculation pipeline

```
useMortgageState (state + URL sync)
    ↓
useMortgageCalculations (all derived numbers, memoized)
    ├── effectivePortions — loan portions, or a synthesized single portion if none set
    ├── loanCalculation — from calculateMultipleLoans() in utils/calculations.ts
    ├── perBankSummary — re-runs calculations for all banks in BANK_RATE_PRESETS
    └── amortizationSchedule — combined schedule via generateCombinedAmortizationSchedule()
```

Rates shown for the user's own loan (nominal, effective, ränteavdrag) come from the portions' `interestRate`, so custom rates are respected; bank presets are only used for the bank comparison. `getEffectiveRateForPortion()` in `bankRates.ts` uses the bank's published effective rate when the portion still has the bank's nominal rate, otherwise monthly compounding.

The "Vad händer om…?" panel (`WhatIfPanel` / `useWhatIfView`) uses `calculateWhatIf()` to compare today's cost against a rate change (all portions) and/or new monthly amortization.

The core math lives in `src/utils/calculations.ts`. Bank interest rate data (nominal + effective, by term) is in `src/data/bankRates.ts` as `BANK_RATE_PRESETS`.

### Loan portions

A loan can be split into multiple portions (`LoanPortion[]`), each with its own bank, term, and interest rate. When the house price or down payment changes, `useMortgageState` automatically rebalances portion amounts proportionally to match the new financing amount.

### Interest deduction

Swedish ränteavdrag (interest deduction) is calculated by `calculateYearlyInterestDeduction()` in `utils/calculations.ts`: 30% on the first 100 000 kr per borrower annually, 21% above that threshold. The number of borrowers (1 or 2) affects the threshold.

### Amortization rules

Swedish mortgage amortization requirements (amorteringskrav) are calculated in `calculateRequiredAmortizationRate()`: 2% if LTV > 70%, 1% if LTV > 50% (up to 70%), 0% at or below 50%, plus an extra 1% if debt-to-income ratio > 4.5×.

### Component structure

Components are thin presentational wrappers. Each has a corresponding view hook that derives display-ready values:
- `SummaryCard` / `useSummaryCardView`
- `BankComparisonSection` / `useBankComparisonView`
- `AmortizationSchedule` / `useAmortizationScheduleView`
- `WhatIfPanel` / `useWhatIfView`

`InputPanel` contains the full form including `LoanPortionsPanel` for managing loan splits.

### Testing

Tests use Vitest + jsdom + Testing Library. Tests for hooks call the hook directly and mock `window.location` for URL state. BCT (business correctness tests) are in files suffixed `.bct.test.ts` and verify calculation accuracy against known Swedish mortgage examples.
