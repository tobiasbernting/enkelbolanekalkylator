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
- Formula: Monthly Payment = P × [r(1+r)^n] / [(1+r)^n - 1]
   - P = Loan amount
   - r = Monthly interest rate (annual rate ÷ 12)
   - n = Total number of payments (years × 12)
   - Interest rate is now set per loan portion, not in Lånevillkor

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

### Story 4: Multiple Loan Portions with Different Terms
**As a** mortgage calculator user  
**I want to** split my loan into multiple portions with different terms (3 months, 1 year, 2 years, 5 years, 10 years) so that **I can** see the combined monthly payment and details for each portion

#### Acceptance Criteria
- [x] User can add multiple loan portions with different loan amounts and terms
- [x] Predefined term options: 3 months, 1 year, 2 years, 5 years, 10 years
- [x] Each loan portion can have its own interest rate (different from global rate)
- [x] Down payment is calculated once from house price, then remaining amount is split into portions
- [x] System calculates monthly payment for each portion separately using its own interest rate
- [x] Total monthly payment is the sum of all portion payments
- [x] Display shows total aggregated payment prominently
- [x] Details table shows each loan portion with its amount, interest rate, term, and monthly payment
- [x] User can add/remove loan portions dynamically
- [x] Amortization schedule shows combined schedule for all portions
- [x] Scenario comparison works with total loan amount across all portions

#### Technical Requirements
- Each loan portion: { amount: number, termYears: number, termMonths?: number }
- For 3 months: termYears = 0.25 (or handle as months)
- Aggregate monthly payment = sum of all portion payments
- Amortization schedule combines all portions chronologically
- Update calculations to handle multiple loans

#### Example
- Total loan: 1,600,000 SEK
- Portion 1: 400,000 SEK for 3 months
- Portion 2: 600,000 SEK for 2 years  
- Portion 3: 600,000 SEK for 10 years
- **Total monthly payment: ~XX,XXX SEK** (sum of all portions)

---

## UI/UX Specifications

### Layout (Updated)
1. **Input Panel** (Left or Top)
   - House price input
   - Down payment input (with toggle: amount or percentage)
   - Interest rate slider/input
   - Loan term selector (with preset options)
   - **NEW: Multiple Loans Section**
     - Add loan portion button
     - List of loan portions with amount and term
     - Remove portion buttons
   - Clear/Reset button

2. **Summary Card** (Prominent)
   - Current monthly payment (large, bold) - **NOW TOTAL across all portions**
   - Amount to finance (house price - down payment)
   - Total loan amount (sum of all portions)
   - Loan terms (list of different terms used)
   - Interest rates (list of different rates used)
   - Total cost of the house (down payment + all payments)

3. **Loan Portions Details**
   - Table showing each portion: Amount, Interest Rate, Term, Monthly Payment
   - Total row with aggregated values

4. **Scenario Comparison Section**
   - Interactive table/matrix
   - Highlighting for current scenario
   - Sortable columns (nice to have)

5. **Amortization Schedule Section**
   - Toggle: Monthly / Yearly view
   - Scrollable table
   - Year-by-year breakdown visible by default
   - Expandable rows for monthly details (nice to have)
   - **UPDATED: Combined schedule for all loan portions**

### Responsive Design
- Mobile: Stack all sections vertically
- Tablet: Side-by-side layout with scrollable tables
- Desktop: Multi-column balanced layout

### Color/Visual Feedback

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
  loanTermYears: number;          // Default loan duration (for single loan)
  minRateScenario: number;        // Min interest for scenarios
  maxRateScenario: number;        // Max interest for scenarios
  downPaymentPercentages: number[]; // Array of down payment percentages
  loanPortions: LoanPortion[];    // NEW: Multiple loan portions
}
```

### LoanPortion
```typescript
{
  id: string;                     // Unique identifier
  amountSeK: number;              // Loan amount for this portion
  termYears: number;              // Term in years (can be fractional for months)
  interestRate: number;           // Interest rate for this portion (%)
}
```

### Calculated State
```typescript
{
  amountToFinanceSeK: number;     // House price - down payment
  loanAmountSeK: number;          // Total of all portion amounts
  monthlyPaymentSeK: number;      // Total monthly payment (sum of all portions)
  totalInterestSeK: number;       // Total interest across all portions
  totalCostSeK: number;           // Total cost of house
  scenarios: ScenarioResult[];    // Scenario comparisons
  amortizationSchedule: AmortizationRow[]; // Combined schedule
  portionDetails: PortionDetail[]; // NEW: Details for each portion
}
```

### PortionDetail
```typescript
{
  id: string;
  amountSeK: number;
  termYears: number;
  interestRate: number;           // Interest rate for this portion
  monthlyPaymentSeK: number;
  totalInterestSeK: number;
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

### Phase 3
- ✅ Story 4: Multiple loan portions with different terms
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

