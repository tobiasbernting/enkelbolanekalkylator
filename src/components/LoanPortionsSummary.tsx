import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Heading,
  VStack,
} from '@chakra-ui/react';
import { PortionDetail } from '../utils/calculations';
import { formatCurrency } from '../utils/calculations';

interface LoanPortionsSummaryProps {
  portionDetails: PortionDetail[];
  totalMonthlyPayment: number;
  requiredMonthlyAmortization?: number;
}

export function LoanPortionsSummary({ portionDetails, totalMonthlyPayment, requiredMonthlyAmortization = 0 }: LoanPortionsSummaryProps) {
  if (portionDetails.length === 0) {
    return null;
  }

  const totalAmount = portionDetails.reduce((sum, p) => sum + p.amountSeK, 0);
  const totalInterest = portionDetails.reduce((sum, p) => sum + p.totalInterestSeK, 0);

  return (
    <Box p={{ base: 4, md: 6 }} borderWidth={1} borderRadius="lg" bg="white">
      <VStack spacing={4} align="stretch">
        <Heading size={{ base: 'sm', md: 'md' }}>Låneportionsdetaljer</Heading>

        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Löptid</Th>
                <Th isNumeric>Belopp</Th>
                <Th isNumeric>Ränta</Th>
                <Th isNumeric>Ränta/mån</Th>
                <Th isNumeric>Ränta under perioden</Th>
              </Tr>
            </Thead>
            <Tbody>
              {portionDetails.map((detail) => (
                <Tr key={detail.id}>
                  <Td>
                    {detail.termYears === 0.25 ? '3 månader' :
                     detail.termYears === 1 ? '1 år' :
                     `${detail.termYears} år`}
                  </Td>
                  <Td isNumeric>{formatCurrency(detail.amountSeK)}</Td>
                  <Td isNumeric>{detail.interestRate.toFixed(1)}%</Td>
                  <Td isNumeric>{formatCurrency(detail.monthlyPaymentSeK)}</Td>
                  <Td isNumeric>{formatCurrency(detail.totalInterestSeK)}</Td>
                </Tr>
              ))}
              <Tr fontWeight="bold">
                <Td>Totalt</Td>
                <Td isNumeric>{formatCurrency(totalAmount)}</Td>
                <Td isNumeric>-</Td>
                <Td isNumeric>{formatCurrency(totalMonthlyPayment)}</Td>
                <Td isNumeric>{formatCurrency(totalInterest)}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        <Box bg="gray.50" p={3} borderRadius="md">
          <VStack spacing={1} align="stretch">
            <Text>Räntedel/mån: {formatCurrency(Math.max(0, totalMonthlyPayment - requiredMonthlyAmortization))}</Text>
            <Text>Amortering/mån: {formatCurrency(requiredMonthlyAmortization)}</Text>
            <Text fontWeight="bold">Total månadsutgift: {formatCurrency(totalMonthlyPayment)}</Text>
            <Text fontSize="xs" color="gray.600">
              Tips: Detta är den viktigaste jämförelsen mellan banker för en förstagångsköpare innan hushållsutgifter läggs till.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}