import {
  Box,
  Grid,
  GridItem,
  Heading,
  HStack,
  NumberInput,
  NumberInputField,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Table,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tbody,
  VStack,
} from '@chakra-ui/react'
import { formatCurrency, LoanPortion } from '../utils/calculations'
import { BankRateType } from '../data/bankRates'
import { useScenarioComparison } from '../hooks/useScenarioComparison'

interface ScenarioComparisonProps {
  loanPortions: LoanPortion[]
  monthlyAmortizationSeK: number
  selectedBank: string
  selectedRateType: BankRateType
}

export function ScenarioComparison({
  loanPortions,
  monthlyAmortizationSeK,
  selectedBank,
  selectedRateType,
}: ScenarioComparisonProps) {
  const viewModel = useScenarioComparison({
    loanPortions,
    monthlyAmortizationSeK,
    selectedBank,
    selectedRateType,
  })

  if (!viewModel.hasPortions) {
    return (
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
        <Heading as="h2" size="lg" mb={3}>
          Scenarioanalys
        </Heading>
        <Text color="gray.500">Lägg till låneportioner för att simulera ränteförändring.</Text>
      </Box>
    )
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
      <VStack spacing={4} align="stretch">
        <Heading as="h2" size="lg">
          Scenarioanalys
        </Heading>

        <Text fontSize="sm" color="gray.600">
          Simulera hur din månadskostnad påverkas om räntan för alla låneportioner går upp eller ner med samma nivå.
        </Text>

        <Box bg="gray.50" borderRadius="md" p={3}>
          <Text fontSize="sm" fontWeight="semibold" mb={1}>
            Nuvarande ränteläge
          </Text>
          <Text fontSize="sm" color="gray.700">
            Viktad snittränta: {viewModel.weightedAverageRate.toFixed(2)}% (spann {viewModel.minRate.toFixed(2)}% - {viewModel.maxRate.toFixed(2)}%)
          </Text>
          <Text fontSize="sm" color="gray.700">
            Totalt lånebelopp: {formatCurrency(viewModel.totalLoanAmountSeK)}
          </Text>
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="semibold" mb={2}>
            Justera ränteförändring (%-enheter)
          </Text>
          <Grid templateColumns={{ base: '1fr', md: '1fr 120px' }} gap={4} alignItems="center">
            <GridItem>
              <Slider
                min={-10}
                max={10}
                step={0.01}
                value={viewModel.rateShiftPercentPoints}
                onChange={viewModel.onRateShiftChange}
                colorScheme="orange"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </GridItem>
            <GridItem>
              <NumberInput
                min={-10}
                max={10}
                step={0.01}
                value={viewModel.rateShiftPercentPoints}
                onChange={viewModel.onRateShiftInputChange}
              >
                <NumberInputField />
              </NumberInput>
            </GridItem>
          </Grid>
        </Box>

        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Scenario</Th>
                {viewModel.sortedPortions.map((portion, index) => (
                  <Th key={portion.id} isNumeric>
                    <Text>{viewModel.formatPortionHeader(index)}</Text>
                    <Text fontWeight="normal">({viewModel.formatTerm(portion.termYears)})</Text>
                  </Th>
                ))}
                <Th isNumeric>Månadsränta</Th>
                <Th isNumeric>Månadskostnad inkl amortering</Th>
                <Th isNumeric>Skillnad mot nu</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr bg="orange.50">
                <Td fontWeight="bold">Nuvarande</Td>
                {viewModel.sortedPortions.map((portion) => (
                  <Td key={`base-${portion.id}`} isNumeric>{portion.interestRate.toFixed(2)}%</Td>
                ))}
                <Td isNumeric fontWeight="bold">{formatCurrency(viewModel.baseMonthlyInterest)}</Td>
                <Td isNumeric fontWeight="bold">{formatCurrency(viewModel.baseMonthlyTotal)}</Td>
                <Td isNumeric>0 SEK</Td>
              </Tr>
              <Tr>
                <Td>Justerat ({viewModel.deltaLabel})</Td>
                {viewModel.sortedPortions.map((portion) => {
                  const adjustedRate = Math.max(0, portion.interestRate + viewModel.rateShiftPercentPoints)
                  return (
                    <Td key={`adjusted-${portion.id}`} isNumeric>{adjustedRate.toFixed(2)}%</Td>
                  )
                })}
                <Td isNumeric>{formatCurrency(viewModel.adjustedMonthlyInterest)}</Td>
                <Td isNumeric>{formatCurrency(viewModel.adjustedMonthlyTotal)}</Td>
                <Td
                  isNumeric
                  color={
                    viewModel.adjustedMonthlyTotal > viewModel.baseMonthlyTotal
                      ? 'orange.600'
                      : viewModel.adjustedMonthlyTotal < viewModel.baseMonthlyTotal
                        ? 'green.600'
                        : 'gray.600'
                  }
                >
                  {formatCurrency(viewModel.adjustedMonthlyTotal - viewModel.baseMonthlyTotal)}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="semibold" mb={2}>
            Ränta per lån (följer förändringen)
          </Text>
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Löptid</Th>
                  <Th isNumeric>{viewModel.selectedPresetLabel} ({viewModel.rateTypeLabel})</Th>
                  <Th isNumeric>Bank justerad</Th>
                  <Th isNumeric>Din ränta</Th>
                  <Th isNumeric>Din justerad</Th>
                </Tr>
              </Thead>
              <Tbody>
                  {viewModel.sortedPortions.map((portion) => {
                    const baseBankRate = viewModel.bankRatesByTerm[portion.termYears]
                  const adjustedBankRate =
                    baseBankRate !== undefined
                        ? Math.max(0, baseBankRate + viewModel.rateShiftPercentPoints)
                      : null
                    const adjustedUserRate = Math.max(0, portion.interestRate + viewModel.rateShiftPercentPoints)

                  return (
                    <Tr key={portion.id}>
                        <Td>{viewModel.formatTerm(portion.termYears)}</Td>
                      <Td isNumeric>{baseBankRate !== undefined ? `${baseBankRate.toFixed(2)}%` : '-'}</Td>
                      <Td isNumeric>{adjustedBankRate !== null ? `${adjustedBankRate.toFixed(2)}%` : '-'}</Td>
                      <Td isNumeric>{portion.interestRate.toFixed(2)}%</Td>
                      <Td isNumeric>{adjustedUserRate.toFixed(2)}%</Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </Box>
        </Box>

        <HStack justify="space-between" fontSize="sm" color="gray.600" flexWrap="wrap">
          <Text>Aktiv förändring: {viewModel.deltaLabel}</Text>
          <Text>Amortering i simulering: {formatCurrency(monthlyAmortizationSeK)}/mån</Text>
        </HStack>
      </VStack>
    </Box>
  )
}
