import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Divider,
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
  useDisclosure,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { InputPanel } from './components/InputPanel'
import { SaveCalculationDialog } from './components/SaveCalculationDialog'
import { SummaryCard } from './components/SummaryCard'
import { BankComparisonSection } from './components/BankComparisonSection'
import { AmortizationSchedule } from './components/AmortizationSchedule'
import { ScenarioComparison } from './components/ScenarioComparison'
import { useAutoAmortization } from './hooks/useAutoAmortization'
import { useMortgageCalculations } from './hooks/useMortgageCalculations'
import { useMortgageState } from './hooks/useMortgageState'
import { isMortgageFormComplete } from './utils/mortgageFormCompletion'
import './App.css'

function App() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { state, actions } = useMortgageState()
  const hasLoanPortions = state.loanPortions.length > 0
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

  return (
    <Container maxW="8xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          justify="space-between"
          align={{ base: 'stretch', lg: 'center' }}
          gap={4}
        >
          <Box textAlign={{ base: 'center', lg: 'left' }}>
            <Heading as="h1" size="2xl" mb={2}>
              Dina beräknade resultat
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Utifrån dina inmatade uppgifter visas din boendekostnad och jämförelser.
            </Text>
          </Box>

          <HStack justify={{ base: 'center', lg: 'flex-end' }} spacing={3} flexWrap="wrap">
            <Button onClick={onOpen} colorScheme="blue" w={{ base: '100%', sm: 'auto' }}>
              Spara beräkning
            </Button>
            <Button as={Link} to={backHref} variant="outline" colorScheme="blue" w={{ base: '100%', sm: 'auto' }}>
              Skapa ny beräkning
            </Button>
          </HStack>
        </Flex>

        <Box bg="white" p={5} borderRadius="lg" boxShadow="md" borderLeftWidth="4px" borderLeftColor="blue.500">
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                Dina uppgifter
              </Text>
              <Badge colorScheme="blue" px={2} py={1} borderRadius="md">
                Underlag för beräkning
              </Badge>
            </HStack>
            <Divider />
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }} gap={4}>
              <GridItem>
                <Text fontSize="xs" color="gray.500">Huspris</Text>
                <Text fontSize="lg" fontWeight="semibold">{state.housePrice.toLocaleString('sv-SE')} kr</Text>
              </GridItem>
              <GridItem>
                <Text fontSize="xs" color="gray.500">Handpenning</Text>
                <Text fontSize="lg" fontWeight="semibold">{state.downPayment.toLocaleString('sv-SE')} kr</Text>
              </GridItem>
              <GridItem>
                <Text fontSize="xs" color="gray.500">Månadsinkomst</Text>
                <Text fontSize="lg" fontWeight="semibold">{state.monthlyIncome.toLocaleString('sv-SE')} kr</Text>
              </GridItem>
              <GridItem>
                <Text fontSize="xs" color="gray.500">Driftskostnad/mån</Text>
                <Text fontSize="lg" fontWeight="semibold">{state.monthlyOperatingCost.toLocaleString('sv-SE')} kr</Text>
              </GridItem>
            </Grid>
          </VStack>
        </Box>

        <Accordion allowToggle defaultIndex={[]}>
          <AccordionItem borderWidth={1} borderColor="gray.200" borderRadius="lg" bg="white">
            <AccordionButton py={3} px={4} _hover={{ bg: 'gray.50' }}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="semibold" color="gray.700">Justera inmatade uppgifter</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pt={2} pb={4}>
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

        {hasLoanPortions && (
          <BankComparisonSection
            rows={calculations.perBankSummary}
            selectedBankId={state.selectedBank}
          />
        )}

        {hasLoanPortions && (
          <>
            <AmortizationSchedule
              schedule={calculations.amortizationSchedule}
              initialLoanAmount={calculations.loanCalculation.loanAmountSeK}
              housePrice={state.housePrice}
              annualIncome={calculations.annualIncome}
            />

            <ScenarioComparison
              loanPortions={calculations.effectivePortions}
              monthlyAmortizationSeK={calculations.effectiveMonthlyAmortization}
              monthlyOperatingCostSeK={state.monthlyOperatingCost}
              monthlyBudgetCostSeK={calculations.monthlyBudgetCostSeK}
              selectedBank={state.selectedBank}
              selectedRateType={state.selectedRateType}
            />
          </>
        )}

        <SaveCalculationDialog isOpen={isOpen} onClose={onClose} />
      </VStack>
    </Container>
  )
}

export default App
