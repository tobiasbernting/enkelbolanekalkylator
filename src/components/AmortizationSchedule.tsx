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
import { AmortizationRow, formatCurrency } from '../utils/calculations'

interface AmortizationScheduleProps {
  schedule: AmortizationRow[]
  title?: string
}

export function AmortizationSchedule({
  schedule,
  title = 'Amorteringsplan',
}: AmortizationScheduleProps) {
  const bgHover = useColorModeValue('gray.50', 'gray.700')
  
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
        <Box overflowX="auto">
          <Table size="sm" variant="striped" colorScheme="gray">
            <Thead bg="blue.50">
              <Tr>
                <Th textAlign="center">År</Th>
                <Th isNumeric>Betalning/År</Th>
                <Th isNumeric>Amortering</Th>
                <Th isNumeric>Ränta</Th>
                <Th isNumeric>Återstående</Th>
              </Tr>
            </Thead>
            <Tbody>
              {schedule.map((row, index) => (
                <Tr key={index} _hover={{ bg: bgHover }}>
                  <Td textAlign="center" fontWeight="medium">
                    {row.period}
                  </Td>
                  <Td isNumeric>{formatCurrency(row.annualPaymentSeK)}</Td>
                  <Td isNumeric>
                    <Text color="green.600" fontWeight="medium">
                      {formatCurrency(row.annualPrincipalSeK)}
                    </Text>
                  </Td>
                  <Td isNumeric>
                    <Text color="orange.600" fontWeight="medium">
                      {formatCurrency(row.annualInterestSeK)}
                    </Text>
                  </Td>
                  <Td isNumeric fontWeight="medium">
                    {formatCurrency(row.remainingBalanceSeK)}
                  </Td>
                </Tr>
              ))}
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
            <Text as="strong">Orange kolumn:</Text> Ränta (kostnaden för lånet)
          </Text>
          <Text mt={2}>
            I början betalar du mest ränta, men i slutet betalar du mest
            amortering. Detta är normalt för ett amorterande lån.
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}
