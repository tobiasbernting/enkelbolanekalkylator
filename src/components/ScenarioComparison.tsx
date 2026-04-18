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
          Simulera hur din månadskostnad påverkas om endast 3-månadersräntan ändras. Övriga räntor ligger kvar enligt vald bank.
        </Text>

        <Box bg="gray.50" borderRadius="md" p={3}>
          <Text fontSize="sm" fontWeight="semibold" mb={1}>
            Nuvarande ränteläge
          </Text>
          <Text fontSize="sm" color="gray.700">
            Viktad nominell snittränta: {viewModel.weightedAverageRate.toFixed(2)}% (spann {viewModel.minRate.toFixed(2)}% - {viewModel.maxRate.toFixed(2)}%)
          </Text>
          <Text fontSize="sm" color="gray.700">
            Viktad effektiv snittränta: {viewModel.weightedAverageEffectiveRate.toFixed(2)}% ({formatCurrency(viewModel.baseMonthlyEffectiveTotal)}/mån, spann {viewModel.minEffectiveRate.toFixed(2)}% - {viewModel.maxEffectiveRate.toFixed(2)}%)
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
                <Th isNumeric>Nominell ränta/mån</Th>
                <Th isNumeric>Nominell kostnad/mån</Th>
                <Th isNumeric>Effektiv ränta/mån</Th>
                <Th isNumeric>Effektiv kostnad/mån</Th>
                <Th isNumeric>Skillnad mot nu (effektiv)</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr bg="orange.50">
                <Td fontWeight="bold">Nuvarande</Td>
                {viewModel.sortedPortions.map((portion) => (
                  <Td key={`base-${portion.id}`} isNumeric>
                    <Text>{viewModel.getBaseRateForPortion(portion).toFixed(2)}%</Text>
                    <Text fontSize="xs" color="gray.600">
                      Eff: {viewModel.getBaseEffectiveRateForPortion(portion).toFixed(2)}%
                    </Text>
                  </Td>
                ))}
                <Td isNumeric fontWeight="bold">{formatCurrency(viewModel.baseMonthlyInterest)}</Td>
                <Td isNumeric fontWeight="bold">{formatCurrency(viewModel.baseMonthlyTotal)}</Td>
                <Td isNumeric fontWeight="bold">{formatCurrency(viewModel.baseMonthlyEffectiveInterest)}</Td>
                <Td isNumeric fontWeight="bold">{formatCurrency(viewModel.baseMonthlyEffectiveTotal)}</Td>
                <Td isNumeric>0 SEK</Td>
              </Tr>
              <Tr>
                <Td>Justerat ({viewModel.deltaLabel})</Td>
                {viewModel.sortedPortions.map((portion) => {
                  const adjustedRate = viewModel.getAdjustedRateForPortion(portion)
                  const adjustedEffectiveRate = viewModel.getAdjustedEffectiveRateForPortion(portion)
                  return (
                    <Td key={`adjusted-${portion.id}`} isNumeric>
                      <Text>{adjustedRate.toFixed(2)}%</Text>
                      <Text fontSize="xs" color="gray.600">
                        Eff: {adjustedEffectiveRate.toFixed(2)}%
                      </Text>
                    </Td>
                  )
                })}
                <Td isNumeric>{formatCurrency(viewModel.adjustedMonthlyInterest)}</Td>
                <Td isNumeric>{formatCurrency(viewModel.adjustedMonthlyTotal)}</Td>
                <Td isNumeric>{formatCurrency(viewModel.adjustedMonthlyEffectiveInterest)}</Td>
                <Td isNumeric>{formatCurrency(viewModel.adjustedMonthlyEffectiveTotal)}</Td>
                <Td
                  isNumeric
                  color={
                    viewModel.adjustedMonthlyEffectiveTotal > viewModel.baseMonthlyEffectiveTotal
                      ? 'orange.600'
                      : viewModel.adjustedMonthlyEffectiveTotal < viewModel.baseMonthlyEffectiveTotal
                        ? 'green.600'
                        : 'gray.600'
                  }
                >
                  {formatCurrency(
                    viewModel.adjustedMonthlyEffectiveTotal - viewModel.baseMonthlyEffectiveTotal
                  )}
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
                  <Th isNumeric>{viewModel.selectedPresetLabel} ({viewModel.rateTypeLabel}) nominell</Th>
                  <Th isNumeric>{viewModel.selectedPresetLabel} ({viewModel.rateTypeLabel}) effektiv</Th>
                  <Th isNumeric>Simulerad nominell</Th>
                  <Th isNumeric>Simulerad effektiv</Th>
                </Tr>
              </Thead>
              <Tbody>
                  {viewModel.sortedPortions.map((portion) => {
                    const baseBankRate = viewModel.bankRatesByTerm[portion.termYears]
                    const baseEffectiveBankRate = viewModel.effectiveBankRatesByTerm[portion.termYears]
                    const simulatedRate = viewModel.getAdjustedRateForPortion(portion)
                    const simulatedEffectiveRate = viewModel.getAdjustedEffectiveRateForPortion(portion)

                  return (
                    <Tr key={portion.id}>
                        <Td>{viewModel.formatTerm(portion.termYears)}</Td>
                      <Td isNumeric>{baseBankRate !== undefined ? `${baseBankRate.toFixed(2)}%` : '-'}</Td>
                      <Td isNumeric>
                        {baseEffectiveBankRate !== undefined ? `${baseEffectiveBankRate.toFixed(2)}%` : '-'}
                      </Td>
                      <Td isNumeric>{`${simulatedRate.toFixed(2)}%`}</Td>
                      <Td isNumeric>{`${simulatedEffectiveRate.toFixed(2)}%`}</Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </Box>
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="semibold" mb={2}>
            Historiska scenarier kopplat till världshändelser
          </Text>
          {viewModel.historicalScenarios.length === 0 ? (
            <Text fontSize="sm" color="gray.500">
              Inget 3-månaderslån finns i upplägget, så historiska rörliga scenarier kan inte beräknas.
            </Text>
          ) : (
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Scenario</Th>
                    <Th>Världshändelse</Th>
                    <Th isNumeric>Styrränta</Th>
                    <Th isNumeric>Förändring mot nuvarande 3 mån</Th>
                    <Th isNumeric>Nominell månadskostnad</Th>
                    <Th isNumeric>Effektiv månadskostnad</Th>
                    <Th isNumeric>Skillnad mot nu (effektiv)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {viewModel.historicalScenarios.map((scenario) => (
                    <Tr key={scenario.id}>
                      <Td>
                        <Text fontWeight="medium">{scenario.label}</Text>
                        <Text fontSize="xs" color="gray.500">{scenario.period}</Text>
                      </Td>
                      <Td>{scenario.worldEvent}</Td>
                      <Td isNumeric>{scenario.policyRate.toFixed(2)}%</Td>
                      <Td isNumeric>
                        {scenario.deltaPercentPoints > 0 ? '+' : ''}
                        {scenario.deltaPercentPoints.toFixed(2)}
                      </Td>
                      <Td isNumeric fontWeight="semibold">{formatCurrency(scenario.monthlyTotalSeK)}</Td>
                      <Td isNumeric fontWeight="semibold">{formatCurrency(scenario.monthlyEffectiveTotalSeK)}</Td>
                      <Td
                        isNumeric
                        color={
                          scenario.monthlyEffectiveDeltaSeK > 0
                            ? 'orange.600'
                            : scenario.monthlyEffectiveDeltaSeK < 0
                              ? 'green.600'
                              : 'gray.600'
                        }
                      >
                        {formatCurrency(scenario.monthlyEffectiveDeltaSeK)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>

        <HStack justify="space-between" fontSize="sm" color="gray.600" flexWrap="wrap">
          <Text>
            Aktiv 3-mån förändring: {viewModel.hasThreeMonthPortion ? viewModel.deltaLabel : 'ingen 3-månadersdel'}
          </Text>
          <Text>Amortering i simulering: {formatCurrency(monthlyAmortizationSeK)}/mån</Text>
        </HStack>
      </VStack>
    </Box>
  )
}
