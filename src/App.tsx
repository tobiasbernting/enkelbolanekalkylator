import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { AmortizationSchedule } from './components/AmortizationSchedule'
import { ScenarioComparison } from './components/ScenarioComparison'
import {
  calculateMultipleLoans,
  generateCombinedAmortizationSchedule,
  calculateRequiredAmortizationRate,
  LoanPortion,
} from './utils/calculations'
import type { BankRateType } from './data/bankRates'
import './App.css'

const DEFAULT_HOUSE_PRICE = 2000000
const DEFAULT_DOWN_PAYMENT = 400000
const DEFAULT_MONTHLY_INCOME = 0
const DEFAULT_MONTHLY_AMORTIZATION = 0
const DEFAULT_LOAN_TERM = 20
const DEFAULT_BANK_ID = 'sbab'
const DEFAULT_RATE_TYPE: BankRateType = 'average'

function parseNumberParam(value: string | null, fallback: number): number {
  if (!value) {
    return fallback
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseDownPaymentModeParam(value: string | null): 'amount' | 'percentage' {
  return value === 'percentage' ? 'percentage' : 'amount'
}

function parseRateTypeParam(value: string | null): BankRateType {
  return value === 'list' ? 'list' : 'average'
}

function parseLoanPortionsParam(value: string | null): LoanPortion[] {
  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((item, index) => ({
        id: typeof item.id === 'string' && item.id.length > 0 ? item.id : `portion-${index}`,
        amountSeK: Number.isFinite(Number(item.amountSeK)) ? Number(item.amountSeK) : 0,
        termYears: Number.isFinite(Number(item.termYears)) ? Number(item.termYears) : 1,
        interestRate: Number.isFinite(Number(item.interestRate)) ? Number(item.interestRate) : 0,
      }))
      .filter((item) => item.amountSeK >= 0 && item.termYears > 0 && item.interestRate >= 0)
  } catch {
    return []
  }
}

function getInitialStateFromQuery() {
  const params = new URLSearchParams(window.location.search)
  const monthlyIncomeFromQuery = parseNumberParam(params.get('monthlyIncome'), DEFAULT_MONTHLY_INCOME)
  const annualIncomeFromLegacyQuery = parseNumberParam(params.get('annualIncome'), 0)

  return {
    housePrice: parseNumberParam(params.get('housePrice'), DEFAULT_HOUSE_PRICE),
    downPayment: parseNumberParam(params.get('downPayment'), DEFAULT_DOWN_PAYMENT),
    monthlyIncome: monthlyIncomeFromQuery > 0 ? monthlyIncomeFromQuery : annualIncomeFromLegacyQuery / 12,
    monthlyAmortization: parseNumberParam(params.get('monthlyAmortization'), DEFAULT_MONTHLY_AMORTIZATION),
    loanTerm: parseNumberParam(params.get('loanTerm'), DEFAULT_LOAN_TERM),
    selectedBank: params.get('bankId') || DEFAULT_BANK_ID,
    selectedRateType: parseRateTypeParam(params.get('rateType')),
    downPaymentMode: parseDownPaymentModeParam(params.get('downPaymentMode')),
    loanPortions: parseLoanPortionsParam(params.get('loanPortions')),
  }
}

function App() {
  const initialState = useMemo(() => getInitialStateFromQuery(), [])

  const [housePrice, setHousePrice] = useState(initialState.housePrice)
  const [downPayment, setDownPayment] = useState(initialState.downPayment)
  const [monthlyIncome, setMonthlyIncome] = useState(initialState.monthlyIncome)
  const [monthlyAmortization, setMonthlyAmortization] = useState(initialState.monthlyAmortization)
  const [loanTerm, setLoanTerm] = useState(initialState.loanTerm)
  const [selectedBank, setSelectedBank] = useState(initialState.selectedBank)
  const [selectedRateType, setSelectedRateType] = useState<BankRateType>(initialState.selectedRateType)
  const [downPaymentMode, setDownPaymentMode] = useState<'amount' | 'percentage'>(initialState.downPaymentMode)
  const [loanPortions, setLoanPortions] = useState<LoanPortion[]>(initialState.loanPortions)

  const annualIncome = useMemo(() => monthlyIncome * 12, [monthlyIncome])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    params.set('housePrice', String(housePrice))
    params.set('downPayment', String(downPayment))
    params.set('monthlyIncome', String(monthlyIncome))
    params.set('monthlyAmortization', String(monthlyAmortization))
    params.delete('annualIncome')
    params.set('loanTerm', String(loanTerm))
    params.set('bankId', selectedBank)
    params.set('rateType', selectedRateType)
    params.set('downPaymentMode', downPaymentMode)

    if (loanPortions.length > 0) {
      params.set('loanPortions', JSON.stringify(loanPortions))
    } else {
      params.delete('loanPortions')
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }, [housePrice, downPayment, monthlyIncome, monthlyAmortization, loanTerm, selectedBank, selectedRateType, downPaymentMode, loanPortions])

  const effectivePortions = useMemo(() => {
    if (loanPortions.length > 0) {
      return loanPortions
    }

    const amountToFinance = Math.max(0, housePrice - downPayment)
    if (amountToFinance <= 0) {
      return [] as LoanPortion[]
    }

    return [
      {
        id: 'default-portion',
        amountSeK: amountToFinance,
        termYears: loanTerm,
        interestRate: 6,
      },
    ]
  }, [housePrice, downPayment, loanPortions, loanTerm])

  // Calculate current loan using one consistent model
  const loanCalculation = useMemo(() => {
    const multiLoan = calculateMultipleLoans(housePrice, downPayment, effectivePortions)
    return {
      amountToFinanceSeK: multiLoan.amountToFinanceSeK,
      loanAmountSeK: multiLoan.totalLoanAmountSeK,
      monthlyPaymentSeK: multiLoan.totalMonthlyPaymentSeK,
      totalInterestSeK: multiLoan.totalInterestSeK,
      totalCostSeK: multiLoan.totalCostSeK,
      portionDetails: multiLoan.portionDetails,
    }
  }, [housePrice, downPayment, effectivePortions])

  const requiredAmortizationRate = useMemo(() => {
    return calculateRequiredAmortizationRate(
      loanCalculation.loanAmountSeK,
      housePrice,
      annualIncome
    )
  }, [annualIncome, housePrice, loanCalculation.loanAmountSeK])

  const requiredMonthlyAmortization = useMemo(
    () => (loanCalculation.loanAmountSeK * requiredAmortizationRate) / 12,
    [loanCalculation.loanAmountSeK, requiredAmortizationRate]
  )

  const effectiveMonthlyAmortization = useMemo(
    () => Math.max(requiredMonthlyAmortization, monthlyAmortization),
    [requiredMonthlyAmortization, monthlyAmortization]
  )

  const totalMonthlyCost = useMemo(
    () => loanCalculation.monthlyPaymentSeK + effectiveMonthlyAmortization,
    [loanCalculation.monthlyPaymentSeK, effectiveMonthlyAmortization]
  )

  // Generate amortization schedule
  const amortizationSchedule = useMemo(
    () =>
      generateCombinedAmortizationSchedule(
        effectivePortions,
        housePrice,
        annualIncome,
        80,
        effectiveMonthlyAmortization
      ),
    [effectivePortions, housePrice, annualIncome, effectiveMonthlyAmortization]
  )

  const handleReset = useCallback(() => {
    setHousePrice(DEFAULT_HOUSE_PRICE)
    setDownPayment(DEFAULT_DOWN_PAYMENT)
    setMonthlyIncome(DEFAULT_MONTHLY_INCOME)
    setMonthlyAmortization(DEFAULT_MONTHLY_AMORTIZATION)
    setLoanTerm(DEFAULT_LOAN_TERM)
    setSelectedBank(DEFAULT_BANK_ID)
    setSelectedRateType(DEFAULT_RATE_TYPE)
    setDownPaymentMode('amount')
    setLoanPortions([])
  }, [])

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
              housePrice={housePrice}
              downPayment={downPayment}
              monthlyIncome={monthlyIncome}
              monthlyAmortization={monthlyAmortization}
              minimumMonthlyAmortization={requiredMonthlyAmortization}
              loanTerm={loanTerm}
              selectedBank={selectedBank}
              selectedRateType={selectedRateType}
              downPaymentMode={downPaymentMode}
              loanPortions={loanPortions}
              onHousePriceChange={setHousePrice}
              onDownPaymentChange={setDownPayment}
              onMonthlyIncomeChange={setMonthlyIncome}
              onMonthlyAmortizationChange={setMonthlyAmortization}
              onSelectedBankChange={setSelectedBank}
              onSelectedRateTypeChange={setSelectedRateType}
              onDownPaymentModeChange={setDownPaymentMode}
              onLoanPortionsChange={setLoanPortions}
              onReset={handleReset}
            />
          </GridItem>

          {/* Right Column: Summary */}
          <GridItem>
            <SummaryCard
              monthlyPayment={totalMonthlyCost}
              interestMonthlyPayment={loanCalculation.monthlyPaymentSeK}
              requiredMonthlyAmortization={effectiveMonthlyAmortization}
              requiredAmortizationRate={requiredAmortizationRate}
              loanAmount={loanCalculation.loanAmountSeK}
              totalInterest={loanCalculation.totalInterestSeK}
              totalCost={loanCalculation.totalCostSeK}
              loanTerm={loanTerm}
              amountToFinanceSeK={loanCalculation.amountToFinanceSeK}
              portionDetails={'portionDetails' in loanCalculation ? loanCalculation.portionDetails : undefined}
            />
          </GridItem>
        </Grid>

        {/* Amortization Schedule */}
        <AmortizationSchedule
          schedule={amortizationSchedule}
          initialLoanAmount={loanCalculation.loanAmountSeK}
          housePrice={housePrice}
          annualIncome={annualIncome}
        />

        {/* Scenario Comparison */}
        <ScenarioComparison
          loanPortions={effectivePortions}
          monthlyAmortizationSeK={effectiveMonthlyAmortization}
          selectedBank={selectedBank}
          selectedRateType={selectedRateType}
        />
      </VStack>
    </Container>
  )
}

export default App
