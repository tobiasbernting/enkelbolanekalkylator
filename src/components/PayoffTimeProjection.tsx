import {
  Box,
  Heading,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react'
import { formatCurrency } from '../utils/calculations'

interface PayoffTimeProjectionProps {
  totalLoanAmount: number
  currentMonthlyPayment: number
  requiredMonthlyAmortization: number
}

interface ProjectionRow {
  label: string
  months: number
}

const PROJECTION_ROWS: ProjectionRow[] = [
  { label: '3 månader', months: 3 },
  { label: '1 år', months: 12 },
  { label: '3 år', months: 36 },
]

export function PayoffTimeProjection({
  totalLoanAmount,
  currentMonthlyPayment,
  requiredMonthlyAmortization,
}: PayoffTimeProjectionProps) {
  if (totalLoanAmount <= 0) {
    return null
  }

  const monthsToDebtFree =
    requiredMonthlyAmortization > 0
      ? Math.ceil(totalLoanAmount / requiredMonthlyAmortization)
      : Infinity

  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
      <VStack spacing={4} align="stretch">
        <Heading as="h2" size="lg">
          Skuldutveckling
        </Heading>

        <Text fontSize="sm" color="gray.600">
          Med nuvarande upplägg och amorteringskrav minskar skulden med
          {' '}
          {formatCurrency(requiredMonthlyAmortization)} per månad.
          {' '}Här kan du senare även inkludera hushållsutgifter för total boendekostnad.
        </Text>

        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Period</Th>
                <Th isNumeric>Betalat under perioden</Th>
                <Th isNumeric>Kvarvarande skuld</Th>
                <Th>Tid tills skuldfri</Th>
              </Tr>
            </Thead>
            <Tbody>
              {PROJECTION_ROWS.map((row) => (
                <Tr key={row.label}>
                  <Td>{row.label}</Td>
                  <Td isNumeric>{formatCurrency(currentMonthlyPayment * row.months)}</Td>
                  <Td isNumeric>{formatCurrency(Math.max(0, totalLoanAmount - requiredMonthlyAmortization * row.months))}</Td>
                  <Td>
                    {monthsToDebtFree === Infinity ? (
                      <Text color="orange.600" fontWeight="semibold">
                        Betalas inte av med samma upplägg
                      </Text>
                    ) : (
                      <Text color="green.600" fontWeight="semibold">
                        Ca {monthsToDebtFree} månader ({(monthsToDebtFree / 12).toFixed(1)} år)
                      </Text>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  )
}
