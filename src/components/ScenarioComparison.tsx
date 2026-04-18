import { useMemo, useState } from 'react'
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
import { BANK_RATE_PRESETS, BankRateType, getRatesByType } from '../data/bankRates'

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
  const [rateShiftPercentPoints, setRateShiftPercentPoints] = useState(0)

  if (loanPortions.length === 0) {
    return (
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
        <Heading as="h2" size="lg" mb={3}>
          Scenarioanalys
        </Heading>
        <Text color="gray.500">Lägg till låneportioner för att simulera ränteförändring.</Text>
      </Box>
    )
  }

  const monthlyInterestForShift = (shiftPercentPoints: number): number => {
    return loanPortions.reduce((sum, portion) => {
      const shiftedRate = Math.max(0, portion.interestRate + shiftPercentPoints)
      return sum + (portion.amountSeK * shiftedRate) / 100 / 12
    }, 0)
  }

  const clampShift = (value: number): number => Math.min(10, Math.max(-10, value))

  const selectedPreset =
    BANK_RATE_PRESETS.find((preset) => preset.id === selectedBank) ?? BANK_RATE_PRESETS[0]
  const bankRatesByTerm = getRatesByType(selectedPreset, selectedRateType)
  const rateTypeLabel = selectedRateType === 'list' ? 'Listränta' : 'Snittränta'

  const totalLoanAmountSeK = useMemo(
    () => loanPortions.reduce((sum, portion) => sum + portion.amountSeK, 0),
    [loanPortions]
  )

  const weightedAverageRate = useMemo(() => {
    if (totalLoanAmountSeK <= 0) {
      return 0
    }

    const weightedSum = loanPortions.reduce(
      (sum, portion) => sum + portion.interestRate * portion.amountSeK,
      0
    )
    return weightedSum / totalLoanAmountSeK
  }, [loanPortions, totalLoanAmountSeK])

  const minRate = useMemo(
    () => Math.min(...loanPortions.map((portion) => portion.interestRate)),
    [loanPortions]
  )

  const maxRate = useMemo(
    () => Math.max(...loanPortions.map((portion) => portion.interestRate)),
    [loanPortions]
  )

  const baseMonthlyInterest = useMemo(() => monthlyInterestForShift(0), [loanPortions])
  const adjustedMonthlyInterest = useMemo(
    () => monthlyInterestForShift(rateShiftPercentPoints),
    [loanPortions, rateShiftPercentPoints]
  )

  const baseMonthlyTotal = baseMonthlyInterest + monthlyAmortizationSeK
  const adjustedMonthlyTotal = adjustedMonthlyInterest + monthlyAmortizationSeK

  const deltaLabel = `${rateShiftPercentPoints > 0 ? '+' : ''}${rateShiftPercentPoints.toFixed(2)} %-enheter`

  const sortedPortions = useMemo(
    () => [...loanPortions].sort((a, b) => a.termYears - b.termYears),
    [loanPortions]
  )

  const formatTerm = (termYears: number): string => {
    if (termYears === 0.25) return '3 mån'
    return `${termYears} år`
  }

  const formatPortionHeader = (index: number): string => {
    return `Lån ${index + 1}`
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
            Viktad snittränta: {weightedAverageRate.toFixed(2)}% (spann {minRate.toFixed(2)}% - {maxRate.toFixed(2)}%)
          </Text>
          <Text fontSize="sm" color="gray.700">
            Totalt lånebelopp: {formatCurrency(totalLoanAmountSeK)}
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
                value={rateShiftPercentPoints}
                onChange={(value) => setRateShiftPercentPoints(value)}
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
                value={rateShiftPercentPoints}
                onChange={(valueString) => {
                  const nextValue = Number(valueString)
                  if (Number.isFinite(nextValue)) {
                    setRateShiftPercentPoints(clampShift(nextValue))
                  }
                }}
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
                {sortedPortions.map((portion, index) => (
                  <Th key={portion.id} isNumeric>
                    <Text>{formatPortionHeader(index)}</Text>
                    <Text fontWeight="normal">({formatTerm(portion.termYears)})</Text>
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
                {sortedPortions.map((portion) => (
                  <Td key={`base-${portion.id}`} isNumeric>{portion.interestRate.toFixed(2)}%</Td>
                ))}
                <Td isNumeric fontWeight="bold">{formatCurrency(baseMonthlyInterest)}</Td>
                <Td isNumeric fontWeight="bold">{formatCurrency(baseMonthlyTotal)}</Td>
                <Td isNumeric>0 SEK</Td>
              </Tr>
              <Tr>
                <Td>Justerat ({deltaLabel})</Td>
                {sortedPortions.map((portion) => {
                  const adjustedRate = Math.max(0, portion.interestRate + rateShiftPercentPoints)
                  return (
                    <Td key={`adjusted-${portion.id}`} isNumeric>{adjustedRate.toFixed(2)}%</Td>
                  )
                })}
                <Td isNumeric>{formatCurrency(adjustedMonthlyInterest)}</Td>
                <Td isNumeric>{formatCurrency(adjustedMonthlyTotal)}</Td>
                <Td
                  isNumeric
                  color={
                    adjustedMonthlyTotal > baseMonthlyTotal
                      ? 'orange.600'
                      : adjustedMonthlyTotal < baseMonthlyTotal
                        ? 'green.600'
                        : 'gray.600'
                  }
                >
                  {formatCurrency(adjustedMonthlyTotal - baseMonthlyTotal)}
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
                  <Th isNumeric>{selectedPreset.label} ({rateTypeLabel})</Th>
                  <Th isNumeric>Bank justerad</Th>
                  <Th isNumeric>Din ränta</Th>
                  <Th isNumeric>Din justerad</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sortedPortions.map((portion) => {
                  const baseBankRate = bankRatesByTerm[portion.termYears]
                  const adjustedBankRate =
                    baseBankRate !== undefined
                      ? Math.max(0, baseBankRate + rateShiftPercentPoints)
                      : null
                  const adjustedUserRate = Math.max(0, portion.interestRate + rateShiftPercentPoints)

                  return (
                    <Tr key={portion.id}>
                      <Td>{formatTerm(portion.termYears)}</Td>
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
          <Text>Aktiv förändring: {deltaLabel}</Text>
          <Text>Amortering i simulering: {formatCurrency(monthlyAmortizationSeK)}/mån</Text>
        </HStack>
      </VStack>
    </Box>
  )
}
