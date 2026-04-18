# Feature Story: Mortgage Calculator with Multi-Scenario Analysis and Amortization Schedule

## Epic Summary
Build an interactive mortgage calculator that allows users to quickly compare different loan scenarios and visualize payment breakdowns through amortization schedules.

---

## User Stories

### Story 1: Calculate Monthly Payment
**As a** mortgage calculator user  
**I want to** enter the house purchase price and down payment so that **I can** see my monthly payment amount

#### Acceptance Criteria
- [ ] User can input total house price (in Swedish Kronor/SEK)
- [ ] User can input down payment amount (SEK or percentage of house price)
- [ ] System validates inputs (positive numbers, down payment ≤ house price)
- [ ] Monthly payment is calculated automatically based on standard loan terms
- [ ] Monthly payment updates in real-time as inputs change
- [ ] Monthly payment is displayed prominently with clear formatting

#### Technical Requirements
- Loan amount = House price - Down payment
- Default loan term: 20 years (can be configurable)
- Default interest rate: 6% annual (can be configurable)
- Formula: Monthly Payment = P × [r(1+r)^n] / [(1+r)^n - 1]
  - P = Loan amount
  - r = Monthly interest rate (annual rate ÷ 12)
  - n = Total number of payments (years × 12)

#### Example
- House price: 2,000,000 SEK
- Down payment: 400,000 SEK (20%)
- Loan amount: 1,600,000 SEK
- Interest rate: 6%
- Loan term: 20 years
- **Expected monthly payment: ~11,550 SEK**

---

### Story 2: Multi-Scenario Comparison Table
**As a** mortgage calculator user  
**I want to** see the total cost for different scenarios (different interest rates and down payments) at the same time so that **I can** quickly compare options

#### Acceptance Criteria
- [ ] User can view a comparison table showing multiple scenarios
- [ ] Table displays scenarios with different interest rates (e.g., 4%, 5%, 6%, 7%, 8%)
- [ ] Table displays scenarios with different down payments (e.g., 10%, 15%, 20%, 25%, 30%)
- [ ] Table shows for each scenario:
  - Loan amount
  - Monthly payment
  - Total interest paid over loan term
  - Total cost of the house (down payment + all payments)
- [ ] User can modify the interest rate range and down payment range
- [ ] Table updates automatically when inputs change
- [ ] Scenarios are organized in a clear grid/matrix format (rows = down payment %, columns = interest rate %)
- [ ] Current scenario (based on main inputs) is highlighted

#### Technical Requirements
- Generate matrix of scenarios based on user-selected ranges
- Use same calculation formula as Story 1
- Format currency values consistently (SEK with proper separators)
- Performance: Should handle up to 25 scenarios (5×5 matrix) without lag

#### Example Matrix
```
                    | 4.0% | 5.0% | 6.0% | 7.0% | 8.0%
-------------------|------|------|------|------|------
10% Down Payment    | ...  | ...  | ...  | ...  | ...
15% Down Payment    | ...  | ...  | ...  | ...  | ...
20% Down Payment    | ...  | ...  | ...  | ...  | ...
25% Down Payment    | ...  | ...  | ...  | ...  | ...
30% Down Payment    | ...  | ...  | ...  | ...  | ...
```

---

### Story 3: Amortization Schedule (Amotering)
**As a** mortgage calculator user  
**I want to** see the amortization schedule so that **I can** understand how my payments are split between principal and interest

#### Acceptance Criteria
- [ ] User can view an amortization schedule for the current scenario
- [ ] Schedule shows data for each payment period (month/year)
- [ ] For each period, display:
  - Payment number
  - Monthly payment amount
  - Principal portion
  - Interest portion
  - Remaining balance
- [ ] Schedule is presented as a table with rows for each period
- [ ] User can toggle between monthly and yearly view
- [ ] Schedule can be exported/printed (nice to have)
- [ ] Schedule updates when any input parameters change

#### Technical Requirements
- Default view: Yearly summary (showing only year-end balances)
- Alternative view: Monthly details (all 240 payments for 20-year loan)
- For yearly view: Sum all monthly payments and interest within each year
- Calculation for each period n:
  - Interest = Remaining balance × (monthly interest rate)
  - Principal = Monthly payment - Interest
  - New remaining balance = Previous balance - Principal

#### Example Table (Yearly View)
```
Year | Payment # | Annual Payment | Annual Interest | Annual Principal | Remaining Balance
-----|-----------|----------------|-----------------|------------------|------------------
1    | 1-12      | 138,600 SEK    | 97,500 SEK      | 41,100 SEK       | 1,558,900 SEK
2    | 13-24     | 138,600 SEK    | 94,500 SEK      | 44,100 SEK       | 1,514,800 SEK
...  | ...       | ...            | ...             | ...              | ...
20   | 229-240   | 138,600 SEK    | 6,900 SEK       | 131,700 SEK      | 0 SEK
```

---

## UI/UX Specifications

### Layout
1. **Input Panel** (Left or Top)
   - House price input
   - Down payment input (with toggle: amount or percentage)
   - Interest rate slider/input
   - Loan term selector (with preset options)
   - Clear/Reset button

2. **Summary Card** (Prominent)
   - Current monthly payment (large, bold)
   - Total loan amount
   - Loan term
   - Interest rate
   - Total cost of house

3. **Scenario Comparison Section**
   - Interactive table/matrix
   - Highlighting for current scenario
   - Sortable columns (nice to have)

4. **Amortization Schedule Section**
   - Toggle: Monthly / Yearly view
   - Scrollable table
   - Year-by-year breakdown visible by default
   - Expandable rows for monthly details (nice to have)

### Responsive Design
- Mobile: Stack all sections vertically
- Tablet: Side-by-side layout with scrollable tables
- Desktop: Multi-column balanced layout

### Color/Visual Feedback
- Principal payments: Green highlight
- Interest payments: Red/Orange highlight
- Current scenario: Blue highlight in comparison table
- Input validation errors: Red border with message

---

## Data Model

### Input State
```typescript
{
  housePriceSeK: number;          // Total house price
  downPaymentSeK: number;         // Down payment in SEK
  interestRatePercent: number;    // Annual interest rate
  loanTermYears: number;          // Loan duration
  minRateScenario: number;        // Min interest for scenarios
  maxRateScenario: number;        // Max interest for scenarios
  downPaymentPercentages: number[]; // Array of down payment percentages
}
```

### Calculated State
```typescript
{
  loanAmountSeK: number;
  monthlyPaymentSeK: number;
  totalInterestSeK: number;
  totalCostSeK: number;
  scenarios: ScenarioResult[];
  amortizationSchedule: AmortizationRow[];
}
```

### AmortizationRow
```typescript
{
  period: number;                 // Year or month number
  paymentNumber: number;          // Sequential payment count
  monthlyPaymentSeK: number;
  annualPaymentSeK?: number;      // For yearly view
  principalSeK: number;
  interestSeK: number;
  remainingBalanceSeK: number;
}
```

---

## Acceptance Tests

### Scenario 1: Basic Calculation
- Input: 2,000,000 SEK house, 400,000 SEK down, 6% interest, 20 years
- Expected: Monthly payment ≈ 11,550 SEK

### Scenario 2: 100% Loan
- Input: 2,000,000 SEK house, 0 SEK down, 6% interest, 20 years
- Expected: Monthly payment ≈ 14,440 SEK

### Scenario 3: Large Down Payment
- Input: 2,000,000 SEK house, 1,000,000 SEK down, 6% interest, 20 years
- Expected: Monthly payment ≈ 7,220 SEK

### Scenario 4: Interest Rate Impact
- 4% interest scenario vs 8% interest scenario should show significant difference in total cost
- Total cost difference should be thousands of SEK

### Scenario 5: Amortization Accuracy
- Sum of all principal payments should equal loan amount (within rounding)
- Final remaining balance should be 0 or negligible
- Sum of all interest should equal total interest calculated

---

## Implementation Phases

### Phase 1 (MVP)
- ✅ Story 1: Calculate monthly payment
- ✅ Story 3: Basic amortization schedule (yearly view only)

### Phase 2
- ✅ Story 2: Multi-scenario comparison table
- Enhanced amortization with monthly details

### Phase 3 (Nice to Have)
- Export/print functionality
- Input validation with error messages
- Preset loan term options
- Interest rate slider
- Visual charts/graphs

---

## Notes for AI Agent

1. **Calculation Priority**: Ensure all monetary calculations are accurate to 2 decimal places (SEK)
2. **Formatting**: Always display SEK amounts with thousands separator and "SEK" suffix
3. **Input Validation**: Prevent negative values, down payment > purchase price, invalid rates
4. **State Management**: Use React hooks (useState, useCallback) for efficient updates
5. **Performance**: Memoize expensive calculations to prevent unnecessary recalculations
6. **Testing**: Include unit tests for calculation functions
7. **Accessibility**: Ensure all inputs have proper labels and form structure
8. **Swedish Localization**: Use Swedish number format (comma for decimals in display, if needed)

