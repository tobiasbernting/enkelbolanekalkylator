import {
  Box,
  Button,
  Container,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { InputPanel } from './InputPanel'
import { useAutoAmortization } from '../hooks/useAutoAmortization'
import { useMortgageCalculations } from '../hooks/useMortgageCalculations'
import { useMortgageState } from '../hooks/useMortgageState'
import { isMortgageFormComplete } from '../utils/mortgageFormCompletion'

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

  const resultHref = useMemo(() => {
    const params = new URLSearchParams()

    params.set('housePrice', String(state.housePrice))
    params.set('downPayment', String(state.downPayment))
    params.set('monthlyIncome', String(state.monthlyIncome))
    params.set('monthlyAmortization', String(state.monthlyAmortization))
    params.set('monthlyOperatingCost', String(state.monthlyOperatingCost))
    params.set('amortizationMode', state.isMonthlyAmortizationUserSet ? 'manual' : 'auto')
    params.set('loanTerm', String(state.loanTerm))
    params.set('bankId', state.selectedBank)
    params.set('rateType', state.selectedRateType)
    params.set('numberOfBorrowers', String(state.numberOfBorrowers))
    params.set('downPaymentMode', state.downPaymentMode)

    if (state.loanPortions.length > 0) {
      params.set('loanPortions', JSON.stringify(state.loanPortions))
    }

    if (state.monthlyBudgetItems.length > 0) {
      params.set('monthlyBudgetItems', JSON.stringify(state.monthlyBudgetItems))
    }

    return `/resultat?${params.toString()}`
  }, [state])

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

        <Box display="flex" justifyContent={{ base: 'center', md: 'flex-end' }}>
          <Box textAlign={{ base: 'center', md: 'right' }} w={{ base: '100%', md: 'auto' }}>
            {!isFormComplete && (
              <Text fontSize="sm" color="orange.700" mb={2}>
                Fyll i alla obligatoriska uppgifter (inklusive låneportion) för att gå vidare.
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
