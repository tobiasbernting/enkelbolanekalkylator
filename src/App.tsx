import {
  Container,
  VStack,
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { InputPanel } from './components/InputPanel'
import { SummaryCard } from './components/SummaryCard'
import { BankComparisonSection } from './components/BankComparisonSection'
import { AmortizationSchedule } from './components/AmortizationSchedule'
import { ScenarioComparison } from './components/ScenarioComparison'
import { useAutoAmortization } from './hooks/useAutoAmortization'
import { useMortgageCalculations } from './hooks/useMortgageCalculations'
import { useMortgageState } from './hooks/useMortgageState'
import './App.css'

function App() {
  const { state, actions } = useMortgageState()

  const calculations = useMortgageCalculations({
    housePrice: state.housePrice,
    downPayment: state.downPayment,
    monthlyIncome: state.monthlyIncome,
    monthlyAmortization: state.monthlyAmortization,
    monthlyOperatingCost: state.monthlyOperatingCost,
    monthlyBudgetItems: state.monthlyBudgetItems,
    selectedBank: state.selectedBank,
    selectedRateType: state.selectedRateType,
    loanPortions: state.loanPortions,
  })

  const amortizationControl = useAutoAmortization({
    monthlyAmortization: state.monthlyAmortization,
    isMonthlyAmortizationUserSet: state.isMonthlyAmortizationUserSet,
    requiredMonthlyAmortization: calculations.requiredMonthlyAmortization,
    setMonthlyAmortization: actions.setMonthlyAmortization,
    setIsMonthlyAmortizationUserSet: actions.setIsMonthlyAmortizationUserSet,
  })

  return (
    <Container maxW="8xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={2}>
            Enkel Bolånekalkylator
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Räkna ut din månatliga betalning och jämför olika scenarier
          </Text>
        </Box>

        {/* Main Content Grid */}
        <Grid
          templateColumns={{ base: '1fr', xl: '1.8fr 1fr' }}
          gap={6}
          width="100%"
        >
          {/* Left Column: Input */}
          <GridItem>
            <InputPanel
              housePrice={state.housePrice}
              downPayment={state.downPayment}
              monthlyIncome={state.monthlyIncome}
              monthlyAmortization={state.monthlyAmortization}
              monthlyOperatingCost={state.monthlyOperatingCost}
              minimumMonthlyAmortization={calculations.requiredMonthlyAmortization}
              isMonthlyAmortizationAuto={amortizationControl.isMonthlyAmortizationAuto}
              selectedBank={state.selectedBank}
              selectedRateType={state.selectedRateType}
              downPaymentMode={state.downPaymentMode}
              loanPortions={state.loanPortions}
              monthlyBudgetItems={state.monthlyBudgetItems}
              onHousePriceChange={actions.setHousePrice}
              onDownPaymentChange={actions.setDownPayment}
              onMonthlyIncomeChange={actions.setMonthlyIncome}
              onMonthlyAmortizationChange={amortizationControl.setManualMonthlyAmortization}
              onMonthlyOperatingCostChange={actions.setMonthlyOperatingCost}
              onMonthlyAmortizationModeChange={amortizationControl.setAmortizationMode}
              onSelectedBankChange={actions.setSelectedBank}
              onSelectedRateTypeChange={actions.setSelectedRateType}
              onDownPaymentModeChange={actions.setDownPaymentMode}
              onLoanPortionsChange={actions.setLoanPortions}
              onMonthlyBudgetItemsChange={actions.setMonthlyBudgetItems}
              onReset={actions.reset}
            />
          </GridItem>

          {/* Right Column: Summary */}
          <GridItem>
            <SummaryCard
              monthlyPayment={calculations.totalMonthlyCost}
              mortgageMonthlyCost={calculations.mortgageMonthlyCostSeK}
              budgetMonthlyCost={calculations.monthlyBudgetCostSeK}
              interestMonthlyPayment={calculations.loanCalculation.monthlyPaymentSeK}
              effectiveInterestMonthlyPayment={calculations.selectedEffectiveMonthlyInterestSeK}
              effectiveMonthlyPayment={calculations.selectedEffectiveMonthlyCostSeK}
              nominalRatePercent={calculations.selectedNominalRatePercent}
              effectiveRatePercent={calculations.selectedEffectiveRatePercent}
              effectiveYearlyCost={calculations.selectedEffectiveYearlyCostSeK}
              monthlyOperatingCost={state.monthlyOperatingCost}
              requiredMonthlyAmortization={calculations.effectiveMonthlyAmortization}
              requiredAmortizationRate={calculations.requiredAmortizationRate}
              amortizationExplanation={calculations.amortizationExplanation}
              loanAmount={calculations.loanCalculation.loanAmountSeK}
              downPaymentSeK={state.downPayment}
              totalInterest={calculations.loanCalculation.totalInterestSeK}
              totalCost={calculations.loanCalculation.totalCostSeK}
              amountToFinanceSeK={calculations.loanCalculation.amountToFinanceSeK}
            />
          </GridItem>
        </Grid>

        <BankComparisonSection
          rows={calculations.perBankSummary}
          selectedBankId={state.selectedBank}
        />

        {/* Amortization Schedule */}
        <AmortizationSchedule
          schedule={calculations.amortizationSchedule}
          initialLoanAmount={calculations.loanCalculation.loanAmountSeK}
          housePrice={state.housePrice}
          annualIncome={calculations.annualIncome}
        />

        {/* Scenario Comparison */}
        <ScenarioComparison
          loanPortions={calculations.effectivePortions}
          monthlyAmortizationSeK={calculations.effectiveMonthlyAmortization}
          monthlyOperatingCostSeK={state.monthlyOperatingCost}
          monthlyBudgetCostSeK={calculations.monthlyBudgetCostSeK}
          selectedBank={state.selectedBank}
          selectedRateType={state.selectedRateType}
        />
      </VStack>
    </Container>
  )
}

export default App
