import {
  Badge,
  Box,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { formatCurrency } from '../utils/calculations'
import { useBankComparisonView } from '../hooks/useBankComparisonView'
import type { BankComparisonRow } from '../types/bankComparison'

interface BankComparisonSectionProps {
  rows: BankComparisonRow[]
  selectedBankId: string
}

export function BankComparisonSection({
  rows,
  selectedBankId,
}: BankComparisonSectionProps) {
  const viewModel = useBankComparisonView({ rows })

  if (!viewModel.hasRows) {
    return null
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
      <Text fontSize="lg" fontWeight="bold" mb={3}>
        Bankjämförelse (samma låneportioner)
      </Text>
      <Box overflowX="auto">
        <Table size="sm" variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Bank</Th>
              <Th isNumeric>Lånebelopp</Th>
              {viewModel.portionHeaders.map((portion, index) => (
                <Th key={`header-${portion.id}`} isNumeric>
                  Lån {index + 1} ({viewModel.formatTerm(portion.termYears)})
                </Th>
              ))}
              <Th isNumeric>Viktad ränta (%)</Th>
              <Th isNumeric>Ränta/mån</Th>
              <Th isNumeric>Amortering/mån</Th>
              <Th isNumeric>Månadskostnad</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => {
              const isSelected = row.bankId === selectedBankId

              return (
                <Tr key={row.bankId} bg={isSelected ? 'orange.50' : undefined}>
                  <Td>
                    {row.bankLabel}{' '}
                    {isSelected && <Badge colorScheme="orange">Vald</Badge>}
                  </Td>
                  <Td isNumeric>{formatCurrency(row.loanAmountSeK)}</Td>
                  {row.portionRates.map((rate) => (
                    <Td key={`${row.bankId}-${rate.id}`} isNumeric>
                      {rate.ratePercent.toFixed(2)}%
                    </Td>
                  ))}
                  <Td isNumeric>{row.effectiveRatePercent.toFixed(2)}%</Td>
                  <Td isNumeric>{formatCurrency(row.monthlyInterestSeK)}</Td>
                  <Td isNumeric>{formatCurrency(row.monthlyAmortizationSeK)}</Td>
                  <Td isNumeric fontWeight="semibold">{formatCurrency(row.monthlyPaymentSeK)}</Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}
