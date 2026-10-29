import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react'
import { LoanPortionsPanel } from './LoanPortionsPanel'
import { MonthlyBudgetSection } from './MonthlyBudgetSection'
import type { LoanPortion } from '../utils/calculations'
import type { BankRateType } from '../data/bankRates'
import { useInputPanelState } from '../hooks/useInputPanelState'
import type { DownPaymentMode, LoanMode } from '../hooks/useMortgageState'
import type { MonthlyBudgetItem } from '../types/monthlyBudget'

interface InputPanelProps {
  loanMode?: LoanMode;
  housePrice: number;
  downPayment: number;
  monthlyIncome: number;
  monthlyAmortization: number;
  monthlyOperatingCost: number;
  minimumMonthlyAmortization: number;
  isMonthlyAmortizationAuto: boolean;
  selectedBank: string;
  selectedRateType: BankRateType;
  numberOfBorrowers: 1 | 2;
  downPaymentMode: DownPaymentMode;
  loanPortions: LoanPortion[];
  monthlyBudgetItems: MonthlyBudgetItem[];
  onHousePriceChange: (value: number) => void;
  onDownPaymentChange: (value: number) => void;
  onMonthlyIncomeChange: (value: number) => void;
  onMonthlyAmortizationChange: (value: number) => void;
  onMonthlyOperatingCostChange: (value: number) => void;
  onMonthlyAmortizationModeChange: (isAuto: boolean) => void;
  onSelectedBankChange: (bankId: string) => void;
  onSelectedRateTypeChange: (rateType: BankRateType) => void;
  onNumberOfBorrowersChange: (value: 1 | 2) => void;
  onDownPaymentModeChange: (mode: DownPaymentMode) => void;
  onLoanPortionsChange: (portions: LoanPortion[]) => void;
  onMonthlyBudgetItemsChange: (items: MonthlyBudgetItem[]) => void;
  onReset: () => void;
}

export function InputPanel({
  loanMode = 'new',
  housePrice,
  downPayment,
  monthlyIncome,
  monthlyAmortization,
  monthlyOperatingCost,
  minimumMonthlyAmortization,
  isMonthlyAmortizationAuto,
  selectedBank,
  selectedRateType,
  numberOfBorrowers,
  downPaymentMode,
  loanPortions,
  monthlyBudgetItems,
  onHousePriceChange,
  onDownPaymentChange,
  onMonthlyIncomeChange,
  onMonthlyAmortizationChange,
  onMonthlyOperatingCostChange,
  onMonthlyAmortizationModeChange,
  onSelectedBankChange,
  onSelectedRateTypeChange,
  onNumberOfBorrowersChange,
  onDownPaymentModeChange,
  onLoanPortionsChange,
  onMonthlyBudgetItemsChange,
  onReset,
}: InputPanelProps) {
  const isExistingLoan = loanMode === 'existing'
  const viewModel = useInputPanelState({
    loanMode,
    housePrice,
    downPayment,
    monthlyIncome,
    monthlyAmortization,
    monthlyOperatingCost,
    minimumMonthlyAmortization,
    isMonthlyAmortizationAuto,
    onHousePriceChange,
    onDownPaymentChange,
    onMonthlyIncomeChange,
    onMonthlyAmortizationChange,
    onMonthlyOperatingCostChange,
    onMonthlyAmortizationModeChange,
    onDownPaymentModeChange,
  })

  return (
    <Box bg="white" p={4} borderRadius="lg" boxShadow="md">
      <VStack spacing={4} align="stretch">
        <Text fontSize="md" fontWeight="bold">
          Lånevillkor
        </Text>

        {viewModel.isAmortizationBelowMinimum && (
          <Box
            p={2.5}
            bg="orange.50"
            borderWidth={1}
            borderColor="orange.200"
            borderRadius="md"
          >
            <Text fontSize="xs" color="orange.800" lineHeight="short">
              Angivet amorteringsvärde är under amorteringskravet för ett nytt lån
              ({Math.round(minimumMonthlyAmortization).toLocaleString('sv-SE')} SEK/mån).
            </Text>
            <Text fontSize="xs" color="orange.800" fontWeight="semibold" mt={1}>
              {isExistingLoan
                ? 'Ditt belopp används i beräkningen. Vad som gäller för ditt lån beror på när det togs och vilket värde banken räknar på – t.ex. är lån från före 2016 undantagna. Kontrollera med din bank.'
                : `Minst ${Math.round(minimumMonthlyAmortization).toLocaleString('sv-SE')} SEK/mån används i beräkningen.`}
            </Text>
          </Box>
        )}

        {viewModel.isAboveMortgageCap && (
          <Box p={2.5} bg="orange.50" borderWidth={1} borderColor="orange.200" borderRadius="md">
            <Text fontSize="xs" color="orange.800">
              Bolånetaket är 90 %: handpenningen behöver vara minst{' '}
              {viewModel.minimumDownPaymentSeK.toLocaleString('sv-SE')} SEK (10 % av priset).
            </Text>
          </Box>
        )}

        {viewModel.isLoanAboveHouseValue && (
          <Box p={2.5} bg="red.50" borderWidth={1} borderColor="red.200" borderRadius="md">
            <Text fontSize="xs" color="red.800">
              Kvarvarande lån är större än bostadens värde. Kontrollera beloppen.
            </Text>
          </Box>
        )}

        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', xl: '1fr 1fr 1fr' }} gap={4} alignItems="start">
          <FormControl>
            <FormLabel mb={2} lineHeight="short" whiteSpace="normal">
              {isExistingLoan ? 'Bostadens värde idag (SEK)' : 'Huspris (SEK)'}
            </FormLabel>
            <Input
              value={viewModel.housePriceFieldValue}
              onChange={(e) => viewModel.onHousePriceInputChange(e.target.value)}
              inputMode="numeric"
            />
          </FormControl>

          <FormControl>
            <FormLabel mb={2} lineHeight="short" whiteSpace="normal">
              Månadsinkomst före skatt (SEK, valfritt)
            </FormLabel>
            <Input
              value={viewModel.monthlyIncomeFieldValue}
              onChange={(e) => viewModel.onMonthlyIncomeInputChange(e.target.value)}
              inputMode="numeric"
            />
          </FormControl>

          {isExistingLoan ? (
            <FormControl>
              <FormLabel mb={2} lineHeight="short" whiteSpace="normal">Kvarvarande lån (SEK)</FormLabel>
              <Input
                value={viewModel.currentLoanFieldValue}
                onChange={(e) => viewModel.onCurrentLoanInputChange(e.target.value)}
                inputMode="numeric"
              />
            </FormControl>
          ) : (
            <FormControl position="relative">
              <FormLabel mb={2} lineHeight="short" whiteSpace="normal" pr={{ base: 0, md: '172px' }}>
                Handpenning
              </FormLabel>
              <HStack
                spacing={2}
                align="center"
                position={{ base: 'static', md: 'absolute' }}
                top="0"
                right="0"
                mb={{ base: 2, md: 0 }}
              >
                <Text fontSize="sm" fontWeight={downPaymentMode === 'amount' ? 'semibold' : 'medium'} color={downPaymentMode === 'amount' ? 'gray.900' : 'gray.600'}>
                  Belopp
                </Text>
                <Switch
                  id="down-payment-mode-switch"
                  aria-label="Ange handpenning i procent"
                  size="sm"
                  colorScheme="blue"
                  isChecked={downPaymentMode === 'percentage'}
                  onChange={(e) => viewModel.onDownPaymentModeSwitchChange(e.target.checked)}
                />
                <Text fontSize="sm" fontWeight={downPaymentMode === 'percentage' ? 'semibold' : 'medium'} color={downPaymentMode === 'percentage' ? 'gray.900' : 'gray.600'}>
                  Procent
                </Text>
              </HStack>
              {downPaymentMode === 'percentage' ? (
                <NumberInput
                  value={Number.isFinite(viewModel.downPaymentPercent) ? Number(viewModel.downPaymentPercent.toFixed(1)) : 0}
                  onChange={viewModel.onDownPaymentPercentChange}
                  min={0}
                  max={100}
                  step={0.1}
                  clampValueOnBlur={false}
                  keepWithinRange={false}
                >
                  <NumberInputField inputMode="decimal" />
                </NumberInput>
              ) : (
                <Input
                  value={viewModel.downPaymentFieldValue}
                  onChange={(e) => viewModel.onDownPaymentInputChange(e.target.value)}
                  inputMode="numeric"
                />
              )}

            </FormControl>
          )}
        </Grid>

        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} alignItems="start">
          <FormControl position="relative">
            <FormLabel mb={2} lineHeight="short" whiteSpace="normal" pr={{ base: 0, md: '156px' }}>
              Amortering/mån (SEK)
            </FormLabel>
            <HStack
              spacing={2}
              align="center"
              position={{ base: 'static', md: 'absolute' }}
              top="0"
              right="0"
              mb={{ base: 2, md: 0 }}
            >
              <Text fontSize="sm" fontWeight={isMonthlyAmortizationAuto ? 'semibold' : 'medium'} color={isMonthlyAmortizationAuto ? 'gray.900' : 'gray.600'}>
                Auto
              </Text>
              <Switch
                id="amortization-mode-switch"
                aria-label="Ange amortering manuellt"
                size="sm"
                colorScheme="blue"
                isChecked={!isMonthlyAmortizationAuto}
                onChange={(e) => viewModel.onAmortizationModeSwitchChange(e.target.checked)}
              />
              <Text fontSize="sm" fontWeight={!isMonthlyAmortizationAuto ? 'semibold' : 'medium'} color={!isMonthlyAmortizationAuto ? 'gray.900' : 'gray.600'}>
                Manuell
              </Text>
            </HStack>
            <Input
              value={viewModel.monthlyAmortizationFieldValue}
              onChange={(e) => viewModel.onMonthlyAmortizationInputChange(e.target.value)}
              inputMode="numeric"
            />
          </FormControl>

          <FormControl>
            <FormLabel mb={2} lineHeight="short" whiteSpace="normal">Driftskostnad/mån (SEK)</FormLabel>
            <Input
              value={viewModel.monthlyOperatingCostFieldValue}
              onChange={(e) => viewModel.onMonthlyOperatingCostInputChange(e.target.value)}
              inputMode="numeric"
            />
          </FormControl>

          <FormControl>
            <FormLabel mb={2} lineHeight="short" whiteSpace="normal">Antal låntagare</FormLabel>
            <HStack spacing={3}>
              <Button
                size="sm"
                variant={numberOfBorrowers === 1 ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => onNumberOfBorrowersChange(1)}
              >
                1
              </Button>
              <Button
                size="sm"
                variant={numberOfBorrowers === 2 ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => onNumberOfBorrowersChange(2)}
              >
                2
              </Button>
            </HStack>
          </FormControl>

        </Grid>

        <Text fontSize="xs" color="gray.500" mt={-2}>
          {isExistingLoan
            ? 'Fyll i det du betalar idag. Auto räknar fram amorteringskravet för ett nytt lån; välj Manuell för att ange din faktiska amortering.'
            : 'Amortering kan inte vara lägre än amorteringskravet: 1 % per år vid belåningsgrad över 50 %, 2 % över 70 %.'}
        </Text>

        <MonthlyBudgetSection
          items={monthlyBudgetItems}
          onItemsChange={onMonthlyBudgetItemsChange}
        />


        <LoanPortionsPanel
          portions={loanPortions}
          onPortionsChange={onLoanPortionsChange}
          selectedBank={selectedBank}
          selectedRateType={selectedRateType}
          onSelectedBankChange={onSelectedBankChange}
          onSelectedRateTypeChange={onSelectedRateTypeChange}
          defaultInterestRate={3.5}
          amountToFinance={housePrice - downPayment}
          loanMode={loanMode}
        />

        <Button colorScheme="gray" variant="outline" onClick={onReset} width="100%">
          Återställ
        </Button>
      </VStack>
    </Box>
  )
}
