import {
  Box,
  Badge,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  AmortizationRow,
  calculateRequiredAmortizationRate,
  formatCurrency,
} from '../utils/calculations'

interface AmortizationScheduleProps {
  schedule: AmortizationRow[]
  initialLoanAmount: number
  housePrice: number
  annualIncome: number
  title?: string
}

export function AmortizationSchedule({
  schedule,
  initialLoanAmount,
  housePrice,
  annualIncome,
  title = 'Amorteringsplan',
}: AmortizationScheduleProps) {
  const bgHover = useColorModeValue('gray.50', 'gray.700')
  const hasPrincipalReduction = schedule.some((row) => row.annualPrincipalSeK > 0)

  const findYearForBalance = (thresholdBalance: number): number | null => {
    const hit = schedule.find((row) => row.remainingBalanceSeK <= thresholdBalance)
    return hit ? hit.period : null
  }

  const yearAt70 = findYearForBalance(housePrice * 0.7)
  const yearAt50 = findYearForBalance(housePrice * 0.5)
  const debtRatioThresholdBalance = annualIncome > 0 ? annualIncome * 4.5 : null
  const yearAtDebtRatio =
    debtRatioThresholdBalance !== null
      ? findYearForBalance(debtRatioThresholdBalance)
      : null

  const currentRate = calculateRequiredAmortizationRate(
    initialLoanAmount,
    housePrice,
    annualIncome
  )

  const getMilestonesForYear = (year: number): string[] => {
    const milestones: string[] = []
    if (yearAt70 === year) milestones.push('70% nådd')
    if (yearAt50 === year) milestones.push('50% nådd')
    if (yearAtDebtRatio === year) milestones.push('Skuldkvot 4,5x nådd')
    return milestones
  }
  
  if (schedule.length === 0) {
    return (
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
        <Text color="gray.500">Ingen amorteringsplan att visa</Text>
      </Box>
    )
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
      <VStack spacing={4} align="stretch">
        <Heading as="h2" size="lg">
          {title}
        </Heading>

        {/* Table */}
        <Box maxH="420px" overflow="auto" borderWidth={1} borderColor="gray.200" borderRadius="md">
          <Table size="sm" variant="striped" colorScheme="gray">
            <Thead bg="blue.50" position="sticky" top={0} zIndex={1}>
              <Tr>
                <Th textAlign="center">År</Th>
                <Th>Milstolpe</Th>
                <Th isNumeric>Betalning/År</Th>
                <Th isNumeric>Amortering</Th>
                <Th isNumeric>Belåningsgrad</Th>
                <Th isNumeric>Återstående</Th>
              </Tr>
            </Thead>
            <Tbody>
              {schedule.map((row, index) => {
                const milestones = getMilestonesForYear(row.period)
                return (
                <Tr
                  key={index}
                  bg={milestones.length > 0 ? 'yellow.50' : undefined}
                  _hover={{ bg: milestones.length > 0 ? 'yellow.100' : bgHover }}
                >
                  <Td textAlign="center" fontWeight="medium">
                    {row.period}
                  </Td>
                  <Td>
                    {milestones.length > 0 ? (
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {milestones.map((milestone) => (
                          <Badge key={milestone} colorScheme="orange" variant="subtle">
                            {milestone}
                          </Badge>
                        ))}
                      </Box>
                    ) : (
                      <Text fontSize="xs" color="gray.500">-</Text>
                    )}
                  </Td>
                  <Td isNumeric>{formatCurrency(row.annualPaymentSeK)}</Td>
                  <Td isNumeric>
                    <Text color="green.600" fontWeight="medium">
                      {formatCurrency(row.annualPrincipalSeK)}
                    </Text>
                  </Td>
                  <Td isNumeric fontWeight="medium">
                    {housePrice > 0
                      ? `${((row.remainingBalanceSeK / housePrice) * 100).toFixed(1)}%`
                      : '-'}
                  </Td>
                  <Td isNumeric fontWeight="medium">
                    {formatCurrency(row.remainingBalanceSeK)}
                  </Td>
                </Tr>
              )})}
            </Tbody>
          </Table>
        </Box>

        {/* Summary */}
        <Box bg="blue.50" p={4} borderRadius="md" fontSize="sm" color="gray.700">
          <Text>
            <Text as="strong">Grön kolumn:</Text> Amortering (belopp som minskar
            skulden)
          </Text>
          <Text>
            Tabellen visar skuldutveckling år för år så att du tydligt ser när du når amorteringströsklar.
          </Text>
          <Text>
            Markerade rader visar år då en ny amorteringsmilstolpe passeras.
          </Text>
          {hasPrincipalReduction ? (
            <Text mt={2}>
              Med detta upplägg minskar skulden successivt genom amortering.
            </Text>
          ) : (
            <Text mt={2}>
              Med nuvarande upplägg visas ingen amortering i denna plan, vilket betyder att skulden inte minskar under bindningstiden.
            </Text>
          )}

          <Box mt={3}>
            <Text fontWeight="bold">När börjar du betala mindre amortering?</Text>
            <Text>
              Nuvarande amorteringskrav: {(currentRate * 100).toFixed(1)}% per år.
            </Text>
            <Text>
              70%-nivå ({formatCurrency(housePrice * 0.7)}): {yearAt70 ? `uppnås runt år ${yearAt70}` : 'inte uppnådd i planen'}.
            </Text>
            <Text>
              50%-nivå ({formatCurrency(housePrice * 0.5)}): {yearAt50 ? `uppnås runt år ${yearAt50}` : 'inte uppnådd i planen'}.
            </Text>
            {annualIncome > 0 ? (
              <Text>
                Skuldkvot 4,5x ({formatCurrency(annualIncome * 4.5)}): {yearAtDebtRatio ? `uppnås runt år ${yearAtDebtRatio}` : 'inte uppnådd i planen'}.
              </Text>
            ) : (
              <Text>
                Lägg till inkomst för att se när skuldkvotstillägget (+1%) försvinner.
              </Text>
            )}
          </Box>
        </Box>
      </VStack>
    </Box>
  )
}
