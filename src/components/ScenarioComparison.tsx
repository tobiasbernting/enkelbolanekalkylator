import {
  Box,
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
import { ScenarioResult, formatCurrency } from '../utils/calculations'

interface ScenarioComparisonProps {
  scenarios: ScenarioResult[]
  currentDownPaymentPercent: number
  currentInterestRate: number
}

export function ScenarioComparison({
  scenarios,
  currentDownPaymentPercent,
  currentInterestRate,
}: ScenarioComparisonProps) {
  const bgHover = useColorModeValue('gray.50', 'gray.700')
  const bgCurrent = useColorModeValue('blue.100', 'blue.900')

  if (scenarios.length === 0) {
    return (
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
        <Text color="gray.500">Ingen scenarier att visa</Text>
      </Box>
    )
  }

  // Group scenarios by down payment and interest rate
  const defaultDownPayments = [10, 15, 20, 25, 30]
  const downPaymentGroup = scenarios.reduce(
    (acc, scenario) => {
      if (!acc[scenario.downPaymentPercent]) {
        acc[scenario.downPaymentPercent] = {}
      }
      acc[scenario.downPaymentPercent][scenario.interestRate] = scenario
      return acc
    },
    {} as Record<number, Record<number, ScenarioResult>>
  )

  // Get unique interest rates sorted
  const interestRates = Array.from(
    new Set(scenarios.map((s) => s.interestRate))
  ).sort((a, b) => a - b)

  const downPayments = defaultDownPayments.filter(
    (dp) => downPaymentGroup[dp]
  )

  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
      <VStack spacing={4} align="stretch">
        <Heading as="h2" size="lg">
          Scenarioanalys
        </Heading>

        <Text fontSize="sm" color="gray.600">
          Jämför månatliga betalningar för olika räntesatser och handpenningsbelopp.
          Din nuvarande scen är markerad i blått.
        </Text>

        {/* Monthly Payment Matrix */}
        <Box>
          <Text fontSize="md" fontWeight="bold" mb={3}>
            Månatlig betalning (SEK)
          </Text>
          <Box overflowX="auto">
            <Table size="sm" variant="striped" colorScheme="gray">
              <Thead bg="blue.50">
                <Tr>
                  <Th>Handpenning</Th>
                  {interestRates.map((rate) => (
                    <Th key={rate} isNumeric>
                      {rate.toFixed(2)}% ränta
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {downPayments.map((dp) => (
                  <Tr key={dp}>
                    <Td fontWeight="medium">{dp}%</Td>
                    {interestRates.map((rate) => {
                      const scenario = downPaymentGroup[dp][rate]
                      const isCurrent =
                        dp === currentDownPaymentPercent &&
                        Math.abs(rate - currentInterestRate) < 0.01
                      return (
                        <Td
                          key={`${dp}-${rate}`}
                          isNumeric
                          bg={isCurrent ? bgCurrent : undefined}
                          fontWeight={isCurrent ? 'bold' : undefined}
                          _hover={{ bg: bgHover }}
                        >
                          {formatCurrency(scenario.monthlyPaymentSeK)}
                        </Td>
                      )
                    })}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Total Cost Matrix */}
        <Box>
          <Text fontSize="md" fontWeight="bold" mb={3}>
            Totalt kostnad inklusive ränta (SEK)
          </Text>
          <Box overflowX="auto">
            <Table size="sm" variant="striped" colorScheme="gray">
              <Thead bg="blue.50">
                <Tr>
                  <Th>Handpenning</Th>
                  {interestRates.map((rate) => (
                    <Th key={rate} isNumeric>
                      {rate.toFixed(2)}% ränta
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {downPayments.map((dp) => (
                  <Tr key={dp}>
                    <Td fontWeight="medium">{dp}%</Td>
                    {interestRates.map((rate) => {
                      const scenario = downPaymentGroup[dp][rate]
                      const isCurrent =
                        dp === currentDownPaymentPercent &&
                        Math.abs(rate - currentInterestRate) < 0.01
                      return (
                        <Td
                          key={`${dp}-${rate}`}
                          isNumeric
                          bg={isCurrent ? bgCurrent : undefined}
                          fontWeight={isCurrent ? 'bold' : undefined}
                          _hover={{ bg: bgHover }}
                        >
                          {formatCurrency(scenario.totalCostSeK)}
                        </Td>
                      )
                    })}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Legend */}
        <Box bg="blue.50" p={3} borderRadius="md" fontSize="sm" color="gray.700">
          <Text>
            💡 Det blå fältet visar ditt nuvarande scenario. Genom att jämföra
            olika räntor och handpenningsbelopp kan du se hur dessa påverkar din
            totala kostnad.
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}
