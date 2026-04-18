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
import type { LoanPortion } from '../utils/calculations'
import type { BankRateType } from '../data/bankRates'
import { useInputPanelState } from '../hooks/useInputPanelState'
import type { DownPaymentMode } from '../hooks/useMortgageState'

interface InputPanelProps {
  housePrice: number;
  downPayment: number;
  monthlyIncome: number;
  monthlyAmortization: number;
  monthlyOperatingCost: number;
  minimumMonthlyAmortization: number;
  isMonthlyAmortizationAuto: boolean;
  selectedBank: string;
  selectedRateType: BankRateType;
  downPaymentMode: DownPaymentMode;
  loanPortions: LoanPortion[];
  onHousePriceChange: (value: number) => void;
  onDownPaymentChange: (value: number) => void;
  onMonthlyIncomeChange: (value: number) => void;
  onMonthlyAmortizationChange: (value: number) => void;
  onMonthlyOperatingCostChange: (value: number) => void;
  onMonthlyAmortizationModeChange: (isAuto: boolean) => void;
  onSelectedBankChange: (bankId: string) => void;
  onSelectedRateTypeChange: (rateType: BankRateType) => void;
  onDownPaymentModeChange: (mode: DownPaymentMode) => void;
  onLoanPortionsChange: (portions: LoanPortion[]) => void;
  onReset: () => void;
}

export function InputPanel({
  housePrice,
  downPayment,
  monthlyIncome,
  monthlyAmortization,
  monthlyOperatingCost,
  minimumMonthlyAmortization,
  isMonthlyAmortizationAuto,
  selectedBank,
  selectedRateType,
  downPaymentMode,
  loanPortions,
  onHousePriceChange,
  onDownPaymentChange,
  onMonthlyIncomeChange,
  onMonthlyAmortizationChange,
  onMonthlyOperatingCostChange,
  onMonthlyAmortizationModeChange,
  onSelectedBankChange,
  onSelectedRateTypeChange,
  onDownPaymentModeChange,
  onLoanPortionsChange,
  onReset,
}: InputPanelProps) {
  const viewModel = useInputPanelState({
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
              Angivet amorteringsvärde är under minimikravet.
            </Text>
            <Text fontSize="xs" color="orange.800" fontWeight="semibold" mt={1}>
              Minst {Math.round(minimumMonthlyAmortization).toLocaleString('sv-SE')} SEK/mån används i beräkningen.
            </Text>
          </Box>
        )}

        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', xl: '1fr 1fr 1fr' }} gap={4} alignItems="start">
          <FormControl>
            <FormLabel mb={2} lineHeight="short" whiteSpace="normal">Huspris (SEK)</FormLabel>
            <Input
              value={viewModel.housePriceFieldValue}
              onChange={(e) => viewModel.onHousePriceInputChange(e.target.value)}
              inputMode="numeric"
            />
          </FormControl>

          <FormControl>
            <FormLabel mb={2} lineHeight="short" whiteSpace="normal">Månadsinkomst (SEK)</FormLabel>
            <Input
              value={viewModel.monthlyIncomeFieldValue}
              onChange={(e) => viewModel.onMonthlyIncomeInputChange(e.target.value)}
              inputMode="numeric"
            />
          </FormControl>

          <FormControl>
            <FormLabel mb={2} lineHeight="short" whiteSpace="normal">
              <HStack justify="space-between" align="center" spacing={2} flexWrap="wrap">
                <Text fontSize="inherit" fontWeight="inherit">
                  Handpenning {downPaymentMode === 'percentage' && `(${viewModel.downPaymentPercent.toFixed(1)}%)`}
                </Text>
                <HStack spacing={2} align="center">
                  <Text fontSize="sm" fontWeight={downPaymentMode === 'amount' ? 'semibold' : 'medium'} color={downPaymentMode === 'amount' ? 'gray.900' : 'gray.600'}>
                    Belopp
                  </Text>
                  <Switch
                    size="sm"
                    colorScheme="blue"
                    isChecked={downPaymentMode === 'percentage'}
                    onChange={(e) => viewModel.onDownPaymentModeSwitchChange(e.target.checked)}
                  />
                  <Text fontSize="sm" fontWeight={downPaymentMode === 'percentage' ? 'semibold' : 'medium'} color={downPaymentMode === 'percentage' ? 'gray.900' : 'gray.600'}>
                    Procent
                  </Text>
                </HStack>
              </HStack>
            </FormLabel>
            {downPaymentMode === 'percentage' ? (
              <NumberInput
                value={Number.isFinite(viewModel.downPaymentPercent) ? viewModel.downPaymentPercent : 0}
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
        </Grid>

        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', xl: '1fr 1fr 1fr' }} gap={4} alignItems="end">
          <FormControl>
            <FormLabel mb={2} lineHeight="short" whiteSpace="normal">Amortering/mån (SEK)</FormLabel>
            <Input
              value={viewModel.monthlyAmortizationFieldValue}
              onChange={(e) => viewModel.onMonthlyAmortizationInputChange(e.target.value)}
              inputMode="numeric"
            />
            <HStack spacing={2} mt={2} align="center">
              <Text fontSize="sm" fontWeight={isMonthlyAmortizationAuto ? 'semibold' : 'medium'} color={isMonthlyAmortizationAuto ? 'gray.900' : 'gray.600'}>
                Auto
              </Text>
              <Switch
                size="sm"
                colorScheme="blue"
                isChecked={!isMonthlyAmortizationAuto}
                onChange={(e) => viewModel.onAmortizationModeSwitchChange(e.target.checked)}
              />
              <Text fontSize="sm" fontWeight={!isMonthlyAmortizationAuto ? 'semibold' : 'medium'} color={!isMonthlyAmortizationAuto ? 'gray.900' : 'gray.600'}>
                Manuell
              </Text>
            </HStack>
          </FormControl>

          <FormControl>
            <FormLabel mb={2} lineHeight="short" whiteSpace="normal">Driftskostnad/mån (SEK)</FormLabel>
            <Input
              value={viewModel.monthlyOperatingCostFieldValue}
              onChange={(e) => viewModel.onMonthlyOperatingCostInputChange(e.target.value)}
              inputMode="numeric"
            />
          </FormControl>

        </Grid>

        <Text fontSize="xs" color="gray.500" mt={-2}>
          Årsinkomst beräknas automatiskt som månadsinkomst × 12. Amortering kan inte vara lägre än amorteringskravet.
        </Text>


        <LoanPortionsPanel
          portions={loanPortions}
          onPortionsChange={onLoanPortionsChange}
          selectedBank={selectedBank}
          selectedRateType={selectedRateType}
          onSelectedBankChange={onSelectedBankChange}
          onSelectedRateTypeChange={onSelectedRateTypeChange}
          defaultInterestRate={6}
          amountToFinance={housePrice - downPayment}
        />

        <Button colorScheme="gray" variant="outline" onClick={onReset} width="100%">
          Återställ
        </Button>
      </VStack>
    </Box>
  )
}
