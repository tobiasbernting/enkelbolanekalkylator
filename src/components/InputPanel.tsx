import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  NumberInput,
  NumberInputField,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react'

interface InputPanelProps {
  housePrice: number
  downPayment: number
  interestRate: number
  loanTerm: number
  downPaymentMode: 'amount' | 'percentage'
  onHousePriceChange: (value: number) => void
  onDownPaymentChange: (value: number) => void
  onInterestRateChange: (value: number) => void
  onLoanTermChange: (value: number) => void
  onDownPaymentModeChange: (mode: 'amount' | 'percentage') => void
  onReset: () => void
}

export function InputPanel({
  housePrice,
  downPayment,
  interestRate,
  loanTerm,
  downPaymentMode,
  onHousePriceChange,
  onDownPaymentChange,
  onInterestRateChange,
  onLoanTermChange,
  onDownPaymentModeChange,
  onReset,
}: InputPanelProps) {
  const downPaymentPercent = housePrice > 0 ? (downPayment / housePrice) * 100 : 0

  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          Lånevillkor
        </Text>

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

        <HStack spacing={3}>
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
          {downPaymentMode === 'percentage' && (
            <Text fontSize="xs" color="gray.500">
              Ange handpenning i procent, t.ex. 20
            </Text>
          )}
        </FormControl>

        <FormControl>
          <FormLabel>Räntesats</FormLabel>
          <NumberInput
            value={interestRate}
            onChange={(valueString) => onInterestRateChange(parseFloat(valueString) || 0)}
            min={0.1}
            max={20}
            step={0.01}
            precision={2}
          >
            <NumberInputField placeholder="2.97" />
          </NumberInput>
          <Text fontSize="xs" color="gray.500" mt={2}>
            Ange räntesatsen manuellt i procent, t.ex. 2.97
          </Text>
        </FormControl>

        <FormControl>
          <FormLabel>Lånetid (år)</FormLabel>
          <Select value={loanTerm} onChange={(e) => onLoanTermChange(parseInt(e.target.value) || 20)}>
            <option value={10}>10 år</option>
            <option value={15}>15 år</option>
            <option value={20}>20 år</option>
            <option value={25}>25 år</option>
            <option value={30}>30 år</option>
          </Select>
        </FormControl>

        <Button colorScheme="gray" variant="outline" onClick={onReset} width="100%">
          Återställ
        </Button>
      </VStack>
    </Box>
  )
}
