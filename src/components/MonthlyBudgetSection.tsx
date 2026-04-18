import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  HStack,
  Input,
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
import { useMonthlyBudgetState } from '../hooks/useMonthlyBudgetState'
import type { MonthlyBudgetItem } from '../types/monthlyBudget'

interface MonthlyBudgetSectionProps {
  items: MonthlyBudgetItem[]
  onItemsChange: (items: MonthlyBudgetItem[]) => void
}

function parseFormattedNumber(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatIntegerWithSpaces(value: number): string {
  if (!Number.isFinite(value)) {
    return ''
  }

  return new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)))
}

export function MonthlyBudgetSection({
  items,
  onItemsChange,
}: MonthlyBudgetSectionProps) {
  const viewModel = useMonthlyBudgetState({ items, onItemsChange })

  return (
    <Accordion allowToggle>
      <AccordionItem borderWidth={1} borderRadius="md" overflow="hidden">
        <h2>
          <AccordionButton py={3} px={4}>
            <Box as="span" flex="1" textAlign="left">
              <Text fontSize="md" fontWeight="bold">
                Månadsbudget
              </Text>
              <Text fontSize="sm" color="gray.600">
                Summa: {formatCurrency(viewModel.totalMonthlyBudgetSeK)}/mån
              </Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel p={4}>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <Text fontSize="sm" color="gray.600">
                Lägg till och justera dina månatliga utgifter.
              </Text>
              <Button size="sm" colorScheme="blue" variant="outline" onClick={viewModel.addItem}>
                Lägg till utgift
              </Button>
            </HStack>

            {viewModel.items.length === 0 ? (
              <Text fontSize="sm" color="gray.500">
                Inga utgifter tillagda ännu.
              </Text>
            ) : (
              <Box overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Namn</Th>
                      <Th isNumeric>Belopp/mån (SEK)</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {viewModel.items.map((item) => (
                      <Tr key={item.id}>
                        <Td>
                          <Input
                            value={item.name}
                            onChange={(e) => viewModel.updateItemName(item.id, e.target.value)}
                            placeholder="t.ex. El"
                          />
                        </Td>
                        <Td isNumeric>
                          <Input
                            value={formatIntegerWithSpaces(item.amountSeK)}
                            onChange={(e) =>
                              viewModel.updateItemAmount(item.id, parseFormattedNumber(e.target.value))
                            }
                            inputMode="numeric"
                            textAlign="right"
                          />
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => viewModel.removeItem(item.id)}
                          >
                            Ta bort
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}

            <HStack justify="space-between" bg="gray.50" p={2.5} borderRadius="md">
              <Text fontSize="sm" color="gray.600">
                Summa budget/mån
              </Text>
              <Text fontSize="sm" fontWeight="semibold">
                {formatCurrency(viewModel.totalMonthlyBudgetSeK)}
              </Text>
            </HStack>
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
