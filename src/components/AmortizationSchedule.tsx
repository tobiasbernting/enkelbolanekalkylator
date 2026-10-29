import {
  Badge,
  Box,
  HStack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { formatCurrency, type MortgageProjection } from '../utils/calculations'
import { useAmortizationScheduleView } from '../hooks/useAmortizationScheduleView'

interface AmortizationScheduleProps {
  projection: MortgageProjection
  startDate: Date
}

export function AmortizationSchedule({ projection, startDate }: AmortizationScheduleProps) {
  const viewModel = useAmortizationScheduleView({ projection, startDate })
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false

  if (!viewModel.hasRows) {
    return <Text color="gray.500">Ingen amorteringsplan att visa.</Text>
  }

  return (
    <VStack spacing={3} align="stretch">
      <Text fontSize="sm" color="gray.600">
        År för år med din plan. Belåningsgrad och skuld gäller vid årets slut, "Per månad" är vad du betalar i
        början av året.
      </Text>

      <Box maxH="480px" overflow="auto" borderWidth={1} borderColor="gray.200" borderRadius="md">
        <Table size="sm" variant="simple" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          <Thead bg="gray.50" position="sticky" top={0} zIndex={1}>
            <Tr>
              <Th>År</Th>
              <Th isNumeric>Belåningsgrad</Th>
              <Th isNumeric>Per månad</Th>
              {!isMobile && (
                <>
                  <Th isNumeric>Ränta/år</Th>
                  <Th isNumeric>Amortering/år</Th>
                  <Th isNumeric>Krav</Th>
                  <Th isNumeric>Kvar att betala</Th>
                </>
              )}
            </Tr>
          </Thead>
          <Tbody>
            {viewModel.rows.map((row) => {
              const hasMilestone = row.milestones.length > 0
              return (
                <Tr key={row.year} bg={hasMilestone ? 'blue.50' : undefined}>
                  <Td>
                    <HStack spacing={2} flexWrap="wrap">
                      <Text fontWeight="medium">{row.calendarYearLabel}</Text>
                      {row.milestones.map((milestone) => (
                        <Badge key={milestone} colorScheme="blue" variant="subtle">
                          {milestone}
                        </Badge>
                      ))}
                    </HStack>
                  </Td>
                  <Td isNumeric fontWeight="medium">
                    {row.loanToValueLabel}
                  </Td>
                  <Td isNumeric>{formatCurrency(row.monthlyPaymentSeK)}</Td>
                  {!isMobile && (
                    <>
                      <Td isNumeric>{formatCurrency(row.interestSeK)}</Td>
                      <Td isNumeric>{formatCurrency(row.amortizationSeK)}</Td>
                      <Td isNumeric>{row.requirementLabel}</Td>
                      <Td isNumeric>{formatCurrency(row.closingBalanceSeK)}</Td>
                    </>
                  )}
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Box>

      <Text fontSize="xs" color="gray.500">
        Total ränta under perioden: {formatCurrency(viewModel.totalInterestSeK)} (före ränteavdrag, med oförändrad
        ränta).
        {viewModel.isTruncated && ' Skulden är inte helt avbetald i slutet av planen.'}
      </Text>
    </VStack>
  )
}
