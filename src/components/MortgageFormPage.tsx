import {
  Box,
  Button,
  Container,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { InputPanel } from './InputPanel'
import { useAutoAmortization } from '../hooks/useAutoAmortization'
import { useMortgageCalculations } from '../hooks/useMortgageCalculations'
import { buildMortgageSearchParams, useMortgageState, type LoanMode } from '../hooks/useMortgageState'
import { isMortgageFormComplete } from '../utils/mortgageFormCompletion'

const LOAN_MODE_OPTIONS: { mode: LoanMode; title: string; description: string }[] = [
  {
    mode: 'new',
    title: 'Jag ska ta ett nytt bolån',
    description: 'Räkna på huspris, handpenning och vad lånet kommer att kosta.',
  },
  {
    mode: 'existing',
    title: 'Jag har redan ett bolån',
    description: 'Fyll i ditt lån och se vad som händer om räntan eller amorteringen ändras.',
  },
]

export function MortgageFormPage() {
  const { state, actions } = useMortgageState()

  const isFormComplete = useMemo(
    () =>
      isMortgageFormComplete({
        housePrice: state.housePrice,
        downPayment: state.downPayment,
        monthlyIncome: state.monthlyIncome,
        loanPortions: state.loanPortions,
      }),
    [state.housePrice, state.downPayment, state.monthlyIncome, state.loanPortions]
  )

  const resultHref = useMemo(
    () => `/resultat?${buildMortgageSearchParams(state).toString()}`,
    [state]
  )

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
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize={{ base: '3xl', md: '5xl' }} fontWeight="black" color="gray.800">
            Fyll i dina uppgifter
          </Text>
          <Text fontSize="lg" color="gray.600" mt={2}>
            Ange alla lånevillkor och gå sedan vidare till resultatsidan.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} role="radiogroup" aria-label="Typ av beräkning">
          {LOAN_MODE_OPTIONS.map((option) => {
            const isSelected = state.loanMode === option.mode
            return (
              <Box
                key={option.mode}
                as="button"
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => actions.setLoanMode(option.mode)}
                textAlign="left"
                p={4}
                borderRadius="lg"
                borderWidth={2}
                borderColor={isSelected ? 'blue.500' : 'gray.200'}
                bg={isSelected ? 'blue.50' : 'white'}
                boxShadow={isSelected ? 'md' : 'sm'}
                _hover={{ borderColor: isSelected ? 'blue.500' : 'blue.200' }}
              >
                <Text fontWeight="bold" fontSize="lg" color={isSelected ? 'blue.800' : 'gray.800'}>
                  {option.title}
                </Text>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  {option.description}
                </Text>
              </Box>
            )
          })}
        </SimpleGrid>

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

        <Box display="flex" justifyContent={{ base: 'center', md: 'flex-end' }}>
          <Box textAlign={{ base: 'center', md: 'right' }} w={{ base: '100%', md: 'auto' }}>
            {!isFormComplete && (
              <Text fontSize="sm" color="orange.700" mb={2}>
                {state.loanMode === 'existing'
                  ? 'Fyll i bostadens värde, kvarvarande lån och minst en låneportion för att gå vidare.'
                  : 'Fyll i alla obligatoriska uppgifter (inklusive låneportion) för att gå vidare.'}
              </Text>
            )}
            <Button
              as={Link}
              to={resultHref}
              colorScheme="blue"
              size="lg"
              isDisabled={!isFormComplete}
              w={{ base: '100%', md: 'auto' }}
            >
              Nästa: resultat
            </Button>
          </Box>
        </Box>
      </VStack>
    </Container>
  )
}
