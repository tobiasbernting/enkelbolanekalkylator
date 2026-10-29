import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Container,
  VStack,
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
  HStack,
  Button,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { InputPanel } from './components/InputPanel'
import { SaveCalculationDialog } from './components/SaveCalculationDialog'
import { SummaryCard } from './components/SummaryCard'
import { BankComparisonSection } from './components/BankComparisonSection'
import { AmortizationSchedule } from './components/AmortizationSchedule'
import { ScenarioComparison } from './components/ScenarioComparison'
import { LoanToValueChart } from './components/LoanToValueChart'
import { PlanControls } from './components/PlanControls'
import { PlanOverview } from './components/PlanOverview'
import { PlanStickySummary } from './components/PlanStickySummary'
import { useAutoAmortization } from './hooks/useAutoAmortization'
import { useMortgageCalculations } from './hooks/useMortgageCalculations'
import { useMortgageState } from './hooks/useMortgageState'
import { formatCurrency } from './utils/calculations'
import { isMortgageFormComplete } from './utils/mortgageFormCompletion'
import { getPlanStartDate } from './utils/planFormatting'
import './App.css'

function App() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { state, actions } = useMortgageState()
  const planStartDate = useMemo(() => getPlanStartDate(), [])
  const isExistingLoan = state.loanMode === 'existing'
  const isFormComplete = isMortgageFormComplete({
    housePrice: state.housePrice,
    downPayment: state.downPayment,
    monthlyIncome: state.monthlyIncome,
    loanPortions: state.loanPortions,
  })

  const backHref = '/'

  const calculations = useMortgageCalculations({
    housePrice: state.housePrice,
    downPayment: state.downPayment,
    monthlyIncome: state.monthlyIncome,
    monthlyAmortization: state.monthlyAmortization,
    monthlyOperatingCost: state.monthlyOperatingCost,
    monthlyBudgetItems: state.monthlyBudgetItems,
    selectedBank: state.selectedBank,
    selectedRateType: state.selectedRateType,
    numberOfBorrowers: state.numberOfBorrowers,
    loanPortions: state.loanPortions,
    loanMode: state.loanMode,
    isMonthlyAmortizationUserSet: state.isMonthlyAmortizationUserSet,
    rateChangePercentPoints: state.rateChange,
  })

  const amortizationControl = useAutoAmortization({
    monthlyAmortization: state.monthlyAmortization,
    isMonthlyAmortizationUserSet: state.isMonthlyAmortizationUserSet,
    requiredMonthlyAmortization: calculations.requiredMonthlyAmortization,
    setMonthlyAmortization: actions.setMonthlyAmortization,
    setIsMonthlyAmortizationUserSet: actions.setIsMonthlyAmortizationUserSet,
  })

  if (!isFormComplete) {
    return (
      <Container maxW="4xl" py={10}>
        <VStack spacing={5} align="stretch">
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Text fontSize="xl" fontWeight="bold" mb={2}>
              Du kan inte visa resultat ännu
            </Text>
            <Text color="gray.600" mb={4}>
              Fyll i alla obligatoriska uppgifter och minst en låneportion först.
            </Text>
            <Button as={Link} to={backHref} colorScheme="blue">
              Skapa ny beräkning
            </Button>
          </Box>
        </VStack>
      </Container>
    )
  }

  const loanAmountSeK = Math.max(0, state.housePrice - state.downPayment)
  const inputSummary = [
    `${isExistingLoan ? 'Värde' : 'Pris'} ${formatCurrency(state.housePrice)}`,
    `Lån ${formatCurrency(loanAmountSeK)}`,
    `Ränta ${calculations.selectedNominalRatePercent.toLocaleString('sv-SE', { maximumFractionDigits: 2 })} %`,
  ].join(' · ')

  return (
    // Extra bottom padding on small screens keeps content clear of the sticky summary bar.
    <Container maxW="8xl" pt={{ base: 4, md: 8 }} pb={{ base: 24, lg: 8 }} px={{ base: 0, md: 4 }}>
      <VStack spacing={6} align="stretch">
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          justify="space-between"
          align={{ base: 'stretch', lg: 'center' }}
          gap={4}
        >
          <Box>
            <Heading as="h1" size={{ base: 'xl', md: '2xl' }} mb={1}>
              {isExistingLoan ? 'Ditt bolån' : 'Ditt nya bolån'}
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Se vad du betalar varje månad och när belåningsgraden sjunker.
            </Text>
          </Box>

          <HStack justify={{ base: 'stretch', lg: 'flex-end' }} spacing={3} flexWrap="wrap">
            <Button onClick={onOpen} colorScheme="blue" flex={{ base: 1, sm: 'none' }}>
              Spara beräkning
            </Button>
            <Button as={Link} to={backHref} variant="outline" colorScheme="blue" flex={{ base: 1, sm: 'none' }}>
              Ny beräkning
            </Button>
          </HStack>
        </Flex>

        <Accordion allowToggle defaultIndex={[]}>
          <AccordionItem borderWidth={1} borderColor="gray.200" borderRadius="lg" bg="white">
            <AccordionButton py={3} px={4} _hover={{ bg: 'gray.50' }} borderRadius="lg">
              <Box flex="1" textAlign="left">
                <Text fontWeight="semibold" color="gray.800">
                  Dina uppgifter
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {inputSummary} · Klicka för att ändra
                </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pt={2} pb={4}>
              <InputPanel
                loanMode={state.loanMode}
                housePrice={state.housePrice}
                downPayment={state.downPayment}
                monthlyIncome={state.monthlyIncome}
                monthlyAmortization={state.monthlyAmortization}
                monthlyOperatingCost={state.monthlyOperatingCost}
                minimumMonthlyAmortization={calculations.requiredMonthlyAmortization}
                isMonthlyAmortizationAuto={amortizationControl.isMonthlyAmortizationAuto}
                selectedBank={state.selectedBank}
                selectedRateType={state.selectedRateType}
                numberOfBorrowers={state.numberOfBorrowers}
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
                onNumberOfBorrowersChange={actions.setNumberOfBorrowers}
                onDownPaymentModeChange={actions.setDownPaymentMode}
                onLoanPortionsChange={actions.setLoanPortions}
                onMonthlyBudgetItemsChange={actions.setMonthlyBudgetItems}
                onReset={actions.reset}
              />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        {/* Controls sit beside the results on wide screens so every change is visible at once. */}
        <Grid templateColumns={{ base: '1fr', lg: '380px 1fr' }} gap={6} alignItems="start">
          <GridItem position={{ base: 'static', lg: 'sticky' }} top={{ lg: '88px' }}>
            <PlanControls
              loanMode={state.loanMode}
              isAmortizationAuto={amortizationControl.isMonthlyAmortizationAuto}
              effectiveMonthlyAmortizationSeK={calculations.effectiveMonthlyAmortization}
              requiredMonthlyAmortizationSeK={calculations.requiredMonthlyAmortization}
              loanAmountSeK={calculations.projection.initialBalanceSeK}
              rateChange={state.rateChange}
              currentPaymentSeK={calculations.projection.months[0]?.paymentSeK ?? 0}
              baselinePaymentSeK={calculations.baselineProjection.months[0]?.paymentSeK ?? 0}
              onAmortizationChange={amortizationControl.setManualMonthlyAmortization}
              onFollowRequirement={() => amortizationControl.setAmortizationMode(true)}
              onRateChange={actions.setRateChange}
            />
          </GridItem>
          <GridItem minW={0}>
            <VStack spacing={6} align="stretch">
              <PlanOverview
                projection={calculations.projection}
                baselineProjection={calculations.baselineProjection}
                startDate={planStartDate}
                monthlyInterestDeductionSeK={calculations.selectedMonthlyInterestDeductionSeK}
                monthlyOperatingCostSeK={state.monthlyOperatingCost}
                monthlyBudgetCostSeK={calculations.monthlyBudgetCostSeK}
              />
              <LoanToValueChart projection={calculations.projection} startDate={planStartDate} />
            </VStack>
          </GridItem>
        </Grid>

        <Box bg="white" borderRadius="lg" boxShadow="md" p={{ base: 3, md: 5 }}>
          <Tabs colorScheme="blue" isLazy>
            <TabList overflowX="auto" overflowY="hidden" whiteSpace="nowrap">
              <Tab>Amorteringsplan</Tab>
              <Tab>Månadskostnad</Tab>
              <Tab>Jämför banker</Tab>
              <Tab>Scenarioanalys</Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}>
                <AmortizationSchedule projection={calculations.projection} startDate={planStartDate} />
              </TabPanel>
              <TabPanel px={0}>
                <SummaryCard
                  monthlyPayment={calculations.totalMonthlyCost}
                  budgetMonthlyCost={calculations.monthlyBudgetCostSeK}
                  interestMonthlyPayment={calculations.loanCalculation.monthlyPaymentSeK}
                  effectiveInterestMonthlyPayment={calculations.selectedEffectiveMonthlyInterestSeK}
                  monthlyInterestDeduction={calculations.selectedMonthlyInterestDeductionSeK}
                  yearlyInterestDeduction={calculations.selectedYearlyInterestDeductionSeK}
                  yearlyInterestDeductionPerBorrower={calculations.selectedYearlyInterestDeductionPerBorrowerSeK}
                  numberOfBorrowers={state.numberOfBorrowers}
                  monthlyInterestDeductionRatePercent={calculations.selectedMonthlyInterestDeductionRatePercent}
                  effectiveMonthlyPayment={calculations.selectedEffectiveMonthlyCostSeK}
                  nominalRatePercent={calculations.selectedNominalRatePercent}
                  effectiveRatePercent={calculations.selectedEffectiveRatePercent}
                  monthlyOperatingCost={state.monthlyOperatingCost}
                  requiredMonthlyAmortization={calculations.effectiveMonthlyAmortization}
                  loanAmount={calculations.loanCalculation.loanAmountSeK}
                  amountToFinanceSeK={calculations.loanCalculation.amountToFinanceSeK}
                />
              </TabPanel>
              <TabPanel px={0}>
                <BankComparisonSection rows={calculations.perBankSummary} selectedBankId={state.selectedBank} />
              </TabPanel>
              <TabPanel px={0}>
                <ScenarioComparison
                  loanPortions={calculations.effectivePortions}
                  monthlyAmortizationSeK={calculations.effectiveMonthlyAmortization}
                  monthlyOperatingCostSeK={state.monthlyOperatingCost}
                  monthlyBudgetCostSeK={calculations.monthlyBudgetCostSeK}
                  selectedBank={state.selectedBank}
                  selectedRateType={state.selectedRateType}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        <SaveCalculationDialog isOpen={isOpen} onClose={onClose} />
      </VStack>

      <PlanStickySummary
        projection={calculations.projection}
        baselineProjection={calculations.baselineProjection}
        startDate={planStartDate}
        monthlyInterestDeductionSeK={calculations.selectedMonthlyInterestDeductionSeK}
        monthlyOperatingCostSeK={state.monthlyOperatingCost}
        monthlyBudgetCostSeK={calculations.monthlyBudgetCostSeK}
      />
    </Container>
  )
}

export default App
