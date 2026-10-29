import {
  Box,
  Button,
  Divider,
  HStack,
  Input,
  InputGroup,
  InputRightAddon,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { formatCurrency } from '../utils/calculations'
import type { LoanMode } from '../hooks/useMortgageState'
import {
  RATE_CHANGE_MAX,
  RATE_CHANGE_MIN,
  RATE_CHANGE_PRESETS,
  RATE_CHANGE_STEP,
  usePlanControlsView,
} from '../hooks/usePlanControlsView'

interface PlanControlsProps {
  loanMode: LoanMode
  isAmortizationAuto: boolean
  effectiveMonthlyAmortizationSeK: number
  requiredMonthlyAmortizationSeK: number
  loanAmountSeK: number
  rateChange: number
  currentPaymentSeK: number
  baselinePaymentSeK: number
  onAmortizationChange: (value: number) => void
  onFollowRequirement: () => void
  onRateChange: (value: number) => void
}

export function PlanControls(props: PlanControlsProps) {
  const viewModel = usePlanControlsView(props)

  return (
    <Box bg="white" p={{ base: 4, md: 5 }} borderRadius="lg" boxShadow="md">
      <VStack spacing={5} align="stretch">
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            Justera din plan
          </Text>
          <Text fontSize="sm" color="gray.600">
            Allt på sidan räknas om direkt när du ändrar.
          </Text>
        </Box>

        <Box>
          <HStack justify="space-between" align="baseline" mb={2}>
            <Text as="label" htmlFor="plan-amortization" fontWeight="semibold">
              Amortering per månad
            </Text>
            {viewModel.isAmortizationAuto && (
              <Text fontSize="xs" color="blue.700" fontWeight="semibold">
                Följer amorteringskravet
              </Text>
            )}
          </HStack>
          <InputGroup size="md">
            <Input
              id="plan-amortization"
              value={viewModel.amortizationFieldValue}
              onChange={(e) => viewModel.onAmortizationInputChange(e.target.value)}
              onBlur={viewModel.onAmortizationInputBlur}
              inputMode="numeric"
            />
            <InputRightAddon>kr/mån</InputRightAddon>
          </InputGroup>
          <Slider
            aria-label="Amortering per månad"
            mt={3}
            min={viewModel.amortizationSliderMin}
            max={viewModel.amortizationSliderMax}
            step={viewModel.amortizationStep}
            value={viewModel.amortizationSliderValue}
            onChange={viewModel.onAmortizationSliderChange}
            colorScheme="blue"
            focusThumbOnChange={false}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={5} />
          </Slider>
          <HStack justify="space-between" fontSize="xs" color="gray.500">
            <Text>{formatCurrency(viewModel.amortizationSliderMin)}</Text>
            <Text>{viewModel.amortizationYearlyPercentLabel}</Text>
            <Text>{formatCurrency(viewModel.amortizationSliderMax)}</Text>
          </HStack>
          <Wrap spacing={2} mt={2}>
            <WrapItem>
              <Button
                size="sm"
                variant={viewModel.isAmortizationAuto ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={viewModel.onFollowRequirement}
              >
                Amorteringskravet ({formatCurrency(viewModel.requiredMonthlyAmortizationSeK)})
              </Button>
            </WrapItem>
            {viewModel.isExistingLoan && (
              <WrapItem>
                <Button size="sm" variant="outline" colorScheme="blue" onClick={viewModel.onNoAmortization}>
                  Ingen amortering
                </Button>
              </WrapItem>
            )}
          </Wrap>
          <Text fontSize="xs" color="gray.500" mt={2}>
            {viewModel.isExistingLoan
              ? viewModel.isBelowRequirement
                ? 'Under kravet för ett nytt lån. Det kan vara okej för äldre lån – kontrollera med din bank.'
                : 'Med amorteringskravet sänks amorteringen automatiskt när du passerar 70 % och 50 %.'
              : 'Ett nytt lån måste amorteras minst enligt kravet. Med kravet sänks amorteringen automatiskt när du passerar 70 % och 50 %.'}
          </Text>
        </Box>

        <Divider />

        <Box>
          <HStack justify="space-between" align="baseline" mb={2}>
            <Text fontWeight="semibold">Om räntan ändras</Text>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color={viewModel.rateChange > 0 ? 'red.600' : viewModel.rateChange < 0 ? 'green.700' : 'gray.600'}
            >
              {viewModel.rateChangeLabel}
            </Text>
          </HStack>
          <Slider
            aria-label="Ränteförändring i procentenheter"
            min={RATE_CHANGE_MIN}
            max={RATE_CHANGE_MAX}
            step={RATE_CHANGE_STEP}
            value={viewModel.rateChange}
            onChange={viewModel.onRateChange}
            colorScheme="blue"
            focusThumbOnChange={false}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={5} />
          </Slider>
          <Wrap spacing={2} mt={2}>
            {RATE_CHANGE_PRESETS.map((preset) => (
              <WrapItem key={preset}>
                <Button
                  size="sm"
                  variant={viewModel.rateChange === preset ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => viewModel.onRateChange(preset)}
                >
                  {preset > 0 ? '+' : '−'}
                  {Math.abs(preset).toLocaleString('sv-SE')} %
                </Button>
              </WrapItem>
            ))}
            <WrapItem>
              <Button
                size="sm"
                variant={viewModel.rateChange === 0 ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => viewModel.onRateChange(0)}
              >
                Dagens ränta
              </Button>
            </WrapItem>
          </Wrap>
          <Text fontSize="xs" color="gray.500" mt={2}>
            Ändringen läggs på alla lånedelar. Bundna lån påverkas först när bindningstiden löper ut.
          </Text>
        </Box>

        {viewModel.isChangedFromBaseline && (
          <>
            <Divider />
            <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
              <Text fontSize="sm" color="gray.700">
                {Math.abs(viewModel.paymentDeltaSeK) < 1
                  ? 'Samma månadsbetalning som med amorteringskravet och dagens ränta.'
                  : `${viewModel.paymentDeltaSeK > 0 ? '+' : '−'}${formatCurrency(Math.abs(viewModel.paymentDeltaSeK))}/mån jämfört med amorteringskravet och dagens ränta.`}
              </Text>
              <Button size="sm" variant="ghost" onClick={viewModel.onReset}>
                Återställ
              </Button>
            </HStack>
          </>
        )}
      </VStack>
    </Box>
  )
}
