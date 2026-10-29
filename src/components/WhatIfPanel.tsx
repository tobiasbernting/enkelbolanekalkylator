import {
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { formatCurrency, type LoanPortion } from '../utils/calculations'
import type { LoanMode } from '../hooks/useMortgageState'
import {
  formatMonthsToDebtFree,
  formatRateChange,
  RATE_CHANGE_MAX,
  RATE_CHANGE_MIN,
  RATE_CHANGE_PRESETS,
  useWhatIfView,
} from '../hooks/useWhatIfView'

interface WhatIfPanelProps {
  loanPortions: LoanPortion[]
  currentMonthlyAmortizationSeK: number
  requiredMonthlyAmortizationSeK: number
  numberOfBorrowers: 1 | 2
  loanMode: LoanMode
}

function formatDelta(value: number): string {
  if (Math.abs(value) < 0.5) {
    return '–'
  }

  return `${value > 0 ? '+' : '−'}${formatCurrency(Math.abs(value))}`
}

function formatRate(value: number): string {
  return `${value.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`
}

function formatOptionalCurrency(value: number | null): string {
  return value === null ? '–' : formatCurrency(value)
}

export function WhatIfPanel({
  loanPortions,
  currentMonthlyAmortizationSeK,
  requiredMonthlyAmortizationSeK,
  numberOfBorrowers,
  loanMode,
}: WhatIfPanelProps) {
  const viewModel = useWhatIfView({
    loanPortions,
    currentMonthlyAmortizationSeK,
    requiredMonthlyAmortizationSeK,
    numberOfBorrowers,
    loanMode,
  })

  if (!viewModel.hasLoan) {
    return null
  }

  const { current, scenario } = viewModel.result
  const rows: { label: string; current: string; scenario: string; delta: string }[] = [
    {
      label: 'Genomsnittlig ränta',
      current: formatRate(current.averageRatePercent),
      scenario: formatRate(scenario.averageRatePercent),
      delta:
        viewModel.rateChangePercentPoints === 0 ? '–' : formatRateChange(viewModel.rateChangePercentPoints),
    },
    {
      label: 'Räntekostnad/mån',
      current: formatCurrency(current.monthlyInterestSeK),
      scenario: formatCurrency(scenario.monthlyInterestSeK),
      delta: formatDelta(scenario.monthlyInterestSeK - current.monthlyInterestSeK),
    },
    {
      label: 'Amortering/mån',
      current: formatCurrency(current.monthlyAmortizationSeK),
      scenario: formatCurrency(scenario.monthlyAmortizationSeK),
      delta: formatDelta(scenario.monthlyAmortizationSeK - current.monthlyAmortizationSeK),
    },
    {
      label: 'Att betala/mån',
      current: formatCurrency(current.monthlyPaymentSeK),
      scenario: formatCurrency(scenario.monthlyPaymentSeK),
      delta: formatDelta(viewModel.result.monthlyPaymentDeltaSeK),
    },
    {
      label: 'Ränteavdrag/mån',
      current: formatCurrency(current.monthlyInterestDeductionSeK),
      scenario: formatCurrency(scenario.monthlyInterestDeductionSeK),
      delta: formatDelta(scenario.monthlyInterestDeductionSeK - current.monthlyInterestDeductionSeK),
    },
    {
      label: 'Netto efter ränteavdrag/mån',
      current: formatCurrency(current.monthlyNetPaymentSeK),
      scenario: formatCurrency(scenario.monthlyNetPaymentSeK),
      delta: formatDelta(viewModel.result.monthlyNetPaymentDeltaSeK),
    },
    {
      label: 'Skuldfri om',
      current: formatMonthsToDebtFree(current.monthsToDebtFree),
      scenario: formatMonthsToDebtFree(scenario.monthsToDebtFree),
      delta: '',
    },
    {
      label: 'Total ränta tills skuldfri',
      current: formatOptionalCurrency(current.totalInterestUntilDebtFreeSeK),
      scenario: formatOptionalCurrency(scenario.totalInterestUntilDebtFreeSeK),
      delta:
        current.totalInterestUntilDebtFreeSeK !== null && scenario.totalInterestUntilDebtFreeSeK !== null
          ? formatDelta(scenario.totalInterestUntilDebtFreeSeK - current.totalInterestUntilDebtFreeSeK)
          : '',
    },
  ]

  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="md" borderTopWidth="4px" borderTopColor="teal.400">
      <VStack spacing={5} align="stretch">
        <Box>
          <Heading as="h2" size="lg">
            Vad händer om räntan eller amorteringen ändras?
          </Heading>
          <Text fontSize="sm" color="gray.600" mt={1}>
            {loanMode === 'existing'
              ? 'Testa hur ditt nuvarande lån påverkas om räntan går upp eller ner, eller om du ändrar hur mycket du amorterar.'
              : 'Testa hur lånet påverkas om räntan går upp eller ner, eller om du amorterar mer eller mindre.'}
          </Text>
        </Box>

        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
          <GridItem>
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="semibold">Ränteförändring</Text>
              <Text fontWeight="bold" color={viewModel.rateChangePercentPoints > 0 ? 'red.600' : viewModel.rateChangePercentPoints < 0 ? 'green.600' : 'gray.700'}>
                {viewModel.rateChangeLabel}
              </Text>
            </HStack>
            <Slider
              aria-label="Ränteförändring i procentenheter"
              min={RATE_CHANGE_MIN}
              max={RATE_CHANGE_MAX}
              step={0.05}
              value={viewModel.rateChangePercentPoints}
              onChange={viewModel.onRateChange}
              colorScheme="teal"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            <Wrap spacing={2} mt={2}>
              {RATE_CHANGE_PRESETS.map((preset) => (
                <WrapItem key={preset}>
                  <Button
                    size="sm"
                    variant={viewModel.rateChangePercentPoints === preset ? 'solid' : 'outline'}
                    colorScheme="teal"
                    onClick={() => viewModel.onRateChange(preset)}
                  >
                    {preset > 0 ? '+' : '−'}
                    {Math.abs(preset).toLocaleString('sv-SE')} %
                  </Button>
                </WrapItem>
              ))}
              <WrapItem>
                <Button size="sm" variant="ghost" onClick={() => viewModel.onRateChange(0)}>
                  Nollställ
                </Button>
              </WrapItem>
            </Wrap>
            <Text fontSize="xs" color="gray.500" mt={2}>
              Ändringen läggs på alla lånedelar. Bundna lån påverkas först när bindningstiden löper ut.
            </Text>
          </GridItem>

          <GridItem>
            <Text fontWeight="semibold" mb={2}>
              Ny amortering (SEK/mån)
            </Text>
            <Input
              aria-label="Ny amortering i kronor per månad"
              value={viewModel.newMonthlyAmortizationFieldValue}
              onChange={(e) => viewModel.onNewMonthlyAmortizationInputChange(e.target.value)}
              inputMode="numeric"
            />
            <Wrap spacing={2} mt={2}>
              {viewModel.amortizationPresets.map((preset) => (
                <WrapItem key={preset.label}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="teal"
                    onClick={() => viewModel.onNewMonthlyAmortizationChange(preset.valueSeK)}
                  >
                    {preset.label}
                  </Button>
                </WrapItem>
              ))}
            </Wrap>
            {viewModel.isNewAmortizationBelowRequirement && (
              <Text fontSize="xs" color="orange.700" mt={2}>
                {loanMode === 'existing'
                  ? `Under amorteringskravet för ett nytt lån (${formatCurrency(requiredMonthlyAmortizationSeK)}/mån). Kontrollera med din bank vilket krav som gäller för ditt lån.`
                  : `Under amorteringskravet (${formatCurrency(requiredMonthlyAmortizationSeK)}/mån). Ett nytt lån måste amorteras minst så mycket.`}
              </Text>
            )}
          </GridItem>
        </Grid>

        <Box
          p={4}
          borderRadius="md"
          bg={viewModel.isUnchanged ? 'gray.50' : viewModel.isScenarioCheaper ? 'green.50' : 'orange.50'}
          borderWidth={1}
          borderColor={viewModel.isUnchanged ? 'gray.200' : viewModel.isScenarioCheaper ? 'green.200' : 'orange.200'}
        >
          <Text fontWeight="semibold">{viewModel.summaryText}</Text>
        </Box>

        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th></Th>
                <Th isNumeric>Idag</Th>
                <Th isNumeric>Med ändring</Th>
                <Th isNumeric>Skillnad</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((row) => (
                <Tr key={row.label}>
                  <Td fontWeight="medium">{row.label}</Td>
                  <Td isNumeric>{row.current}</Td>
                  <Td isNumeric fontWeight="semibold">{row.scenario}</Td>
                  <Td isNumeric>{row.delta}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <HStack justify="space-between" flexWrap="wrap" gap={2}>
          <Text fontSize="xs" color="gray.500" maxW="3xl">
            Amortering är sparande i bostaden, inte en kostnad. Ränteavdraget räknas på årets ränta (30 % upp till
            100 000 kr per låntagare, 21 % över). Tid och total ränta tills skuldfri förutsätter rak amortering och
            oförändrad ränta.
          </Text>
          <Button size="sm" variant="outline" onClick={viewModel.reset}>
            Återställ scenario
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}
