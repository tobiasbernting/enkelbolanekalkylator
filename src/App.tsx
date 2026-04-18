import { useCallback, useMemo, useState } from 'react'
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
  calculateLoan,
  generateAmortizationSchedule,
  generateScenarios,
} from './utils/calculations'
import './App.css'

const DEFAULT_HOUSE_PRICE = 2000000
const DEFAULT_DOWN_PAYMENT = 400000
const DEFAULT_INTEREST_RATE = 6
const DEFAULT_LOAN_TERM = 20

function App() {
  const [housePrice, setHousePrice] = useState(DEFAULT_HOUSE_PRICE)
  const [downPayment, setDownPayment] = useState(DEFAULT_DOWN_PAYMENT)
  const [interestRate, setInterestRate] = useState(DEFAULT_INTEREST_RATE)
  const [loanTerm, setLoanTerm] = useState(DEFAULT_LOAN_TERM)
  const [downPaymentMode, setDownPaymentMode] = useState<'amount' | 'percentage'>('amount')

  // Calculate current loan
  const loanCalculation = useMemo(
    () => calculateLoan(housePrice, downPayment, interestRate, loanTerm),
    [housePrice, downPayment, interestRate, loanTerm]
  )

  // Generate amortization schedule
  const amortizationSchedule = useMemo(
    () =>
      generateAmortizationSchedule(
        loanCalculation.loanAmountSeK,
        interestRate,
        loanTerm
      ),
    [loanCalculation.loanAmountSeK, interestRate, loanTerm]
  )

  // Generate scenarios for comparison
  const scenarios = useMemo(
    () =>
      generateScenarios(
        housePrice,
        [10, 15, 20, 25, 30],
        [3, 4, 5, 6, 7, 8],
        loanTerm
      ),
    [housePrice, loanTerm]
  )

  const downPaymentPercent =
    housePrice > 0 ? (downPayment / housePrice) * 100 : 0

  const handleReset = useCallback(() => {
    setHousePrice(DEFAULT_HOUSE_PRICE)
    setDownPayment(DEFAULT_DOWN_PAYMENT)
    setInterestRate(DEFAULT_INTEREST_RATE)
    setLoanTerm(DEFAULT_LOAN_TERM)
    setDownPaymentMode('amount')
  }, [])

  return (
    <Container maxW="7xl" py={8}>
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
          templateColumns={{ base: '1fr', lg: '1fr 2fr' }}
          gap={6}
          width="100%"
        >
          {/* Left Column: Input */}
          <GridItem>
            <InputPanel
              housePrice={housePrice}
              downPayment={downPayment}
              interestRate={interestRate}
              loanTerm={loanTerm}
              downPaymentMode={downPaymentMode}
              onHousePriceChange={setHousePrice}
              onDownPaymentChange={setDownPayment}
              onInterestRateChange={setInterestRate}
              onLoanTermChange={setLoanTerm}
              onDownPaymentModeChange={setDownPaymentMode}
              onReset={handleReset}
            />
          </GridItem>

          {/* Right Column: Summary */}
          <GridItem>
            <SummaryCard
              monthlyPayment={loanCalculation.monthlyPaymentSeK}
              loanAmount={loanCalculation.loanAmountSeK}
              totalInterest={loanCalculation.totalInterestSeK}
              totalCost={loanCalculation.totalCostSeK}
              interestRate={interestRate}
              loanTerm={loanTerm}
            />
          </GridItem>
        </Grid>

        {/* Amortization Schedule */}
        <AmortizationSchedule schedule={amortizationSchedule} />

        {/* Scenario Comparison */}
        <ScenarioComparison
          scenarios={scenarios}
          currentDownPaymentPercent={downPaymentPercent}
          currentInterestRate={interestRate}
        />
      </VStack>
    </Container>
  )
}

export default App
