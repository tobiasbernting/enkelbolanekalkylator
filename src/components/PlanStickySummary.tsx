import { Box, HStack, Text } from '@chakra-ui/react'
import { formatCurrency, type MortgageProjection } from '../utils/calculations'
import { usePlanOverviewView } from '../hooks/usePlanOverviewView'

interface PlanStickySummaryProps {
  projection: MortgageProjection
  baselineProjection: MortgageProjection
  startDate: Date
  monthlyInterestDeductionSeK: number
  monthlyOperatingCostSeK: number
  monthlyBudgetCostSeK: number
}

/**
 * On small screens the controls and the results can't be seen together, so this bar
 * keeps the two numbers that change most visible while the user drags a slider.
 */
export function PlanStickySummary(props: PlanStickySummaryProps) {
  const viewModel = usePlanOverviewView(props)
  const below70 = viewModel.milestones.find((milestone) => milestone.key === 'below70')

  if (!viewModel.hasPlan) {
    return null
  }

  return (
    <Box
      display={{ base: 'block', lg: 'none' }}
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={20}
      bg="white"
      borderTopWidth={1}
      borderColor="gray.200"
      boxShadow="0 -4px 12px rgba(0, 0, 0, 0.08)"
      px={4}
      py={2}
      aria-live="polite"
    >
      <HStack justify="space-between" spacing={4}>
        <Box>
          <Text fontSize="xs" color="gray.600">
            Per månad
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="blue.700" lineHeight="short">
            {formatCurrency(viewModel.monthlyPaymentSeK)}
          </Text>
        </Box>
        {below70 && (
          <Box textAlign="right">
            <Text fontSize="xs" color="gray.600">
              Under 70 %
            </Text>
            <Text fontSize="sm" fontWeight="semibold" color="gray.900" lineHeight="short">
              {below70.value}
            </Text>
          </Box>
        )}
      </HStack>
    </Box>
  )
}
