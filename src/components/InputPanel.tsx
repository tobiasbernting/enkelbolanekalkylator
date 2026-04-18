import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  NumberInput,
  NumberInputField,
  Text,
  VStack,
} from '@chakra-ui/react'
import { LoanPortionsPanel } from './LoanPortionsPanel'
import type { LoanPortion } from '../utils/calculations'
import type { BankRateType } from '../data/bankRates'

interface InputPanelProps {
  housePrice: number;
  downPayment: number;
  monthlyIncome: number;
  monthlyAmortization: number;
  minimumMonthlyAmortization: number;
  loanTerm: number;
  selectedBank: string;
  selectedRateType: BankRateType;
  downPaymentMode: 'amount' | 'percentage';
  loanPortions: LoanPortion[];
  onHousePriceChange: (value: number) => void;
  onDownPaymentChange: (value: number) => void;
  onMonthlyIncomeChange: (value: number) => void;
  onMonthlyAmortizationChange: (value: number) => void;
  onSelectedBankChange: (bankId: string) => void;
  onSelectedRateTypeChange: (rateType: BankRateType) => void;
  onDownPaymentModeChange: (mode: 'amount' | 'percentage') => void;
  onLoanPortionsChange: (portions: LoanPortion[]) => void;
  onReset: () => void;
}

export function InputPanel({
  housePrice,
  downPayment,
  monthlyIncome,
  monthlyAmortization,
  minimumMonthlyAmortization,
  loanTerm,
  selectedBank,
  selectedRateType,
  downPaymentMode,
  loanPortions,
  onHousePriceChange,
  onDownPaymentChange,
  onMonthlyIncomeChange,
  onMonthlyAmortizationChange,
  onSelectedBankChange,
  onSelectedRateTypeChange,
  onDownPaymentModeChange,
  onLoanPortionsChange,
  onReset,
}: InputPanelProps) {
  const downPaymentPercent = housePrice > 0 ? (downPayment / housePrice) * 100 : 0
  const isAmortizationBelowMinimum = monthlyAmortization < minimumMonthlyAmortization

  return (
    <Box bg="white" p={4} borderRadius="lg" boxShadow="md">
      <VStack spacing={3} align="stretch">
        <Text fontSize="md" fontWeight="bold">
          Lånevillkor
        </Text>

        {isAmortizationBelowMinimum && (
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

        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', xl: '1.1fr 1.1fr 1.1fr 1.1fr auto' }} gap={3} alignItems="end">
          <FormControl>
            <FormLabel>Huspris (SEK)</FormLabel>
            <NumberInput
              value={housePrice}
              onChange={(valueString) => onHousePriceChange(parseFloat(valueString) || 0)}
              min={0}
              step={50000}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Månadsinkomst (SEK)</FormLabel>
            <NumberInput
              value={monthlyIncome}
              onChange={(valueString) => onMonthlyIncomeChange(parseFloat(valueString) || 0)}
              min={0}
              step={1000}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>
              Handpenning {downPaymentMode === 'percentage' && `(${downPaymentPercent.toFixed(1)}%)`}
            </FormLabel>
            <NumberInput
              value={downPaymentMode === 'percentage' ? downPaymentPercent : downPayment}
              onChange={(valueString) => {
                const value = parseFloat(valueString) || 0
                if (downPaymentMode === 'percentage') {
                  onDownPaymentChange((housePrice * value) / 100)
                } else {
                  onDownPaymentChange(value)
                }
              }}
              min={0}
              step={downPaymentMode === 'percentage' ? 1 : 50000}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Amortering/mån (SEK)</FormLabel>
            <NumberInput
              value={monthlyAmortization}
              onChange={(valueString) => {
                const value = parseFloat(valueString) || 0
                onMonthlyAmortizationChange(value)
              }}
              min={0}
              step={500}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Format</FormLabel>
            <HStack spacing={2}>
              <Button
                size="sm"
                colorScheme={downPaymentMode === 'amount' ? 'blue' : 'gray'}
                variant={downPaymentMode === 'amount' ? 'solid' : 'outline'}
                onClick={() => onDownPaymentModeChange('amount')}
              >
                Belopp
              </Button>
              <Button
                size="sm"
                colorScheme={downPaymentMode === 'percentage' ? 'blue' : 'gray'}
                variant={downPaymentMode === 'percentage' ? 'solid' : 'outline'}
                onClick={() => onDownPaymentModeChange('percentage')}
              >
                Procent
              </Button>
            </HStack>
          </FormControl>
        </Grid>

        <Text fontSize="xs" color="gray.500" mt={-1}>
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
          defaultLoanTerm={loanTerm}
          amountToFinance={housePrice - downPayment}
        />

        <Button colorScheme="gray" variant="outline" onClick={onReset} width="100%">
          Återställ
        </Button>
      </VStack>
    </Box>
  )
}
