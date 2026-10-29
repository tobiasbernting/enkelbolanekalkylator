import { Box, Grid, GridItem, HStack, Text, VStack } from '@chakra-ui/react'
import { formatCurrency, type MortgageProjection } from '../utils/calculations'
import { usePlanOverviewView, type MilestoneTile } from '../hooks/usePlanOverviewView'

interface PlanOverviewProps {
  projection: MortgageProjection
  baselineProjection: MortgageProjection
  startDate: Date
  monthlyInterestDeductionSeK: number
  monthlyOperatingCostSeK: number
  monthlyBudgetCostSeK: number
}

function MilestoneCard({ tile }: { tile: MilestoneTile }) {
  return (
    <Box
      p={4}
      borderRadius="md"
      borderWidth={1}
      borderColor={tile.isReached ? 'green.200' : 'gray.200'}
      bg={tile.isReached ? 'green.50' : 'white'}
      h="100%"
    >
      <Text fontSize="sm" color="gray.600">
        {tile.label}
      </Text>
      <Text fontSize="xl" fontWeight="semibold" color="gray.900" mt={1}>
        {tile.value}
      </Text>
      <Text fontSize="sm" color="gray.600">
        {tile.detail}
      </Text>
      {tile.comparison && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          {tile.comparison}
        </Text>
      )}
    </Box>
  )
}

export function PlanOverview(props: PlanOverviewProps) {
  const viewModel = usePlanOverviewView(props)

  if (!viewModel.hasPlan) {
    return null
  }

  return (
    <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="md">
      <VStack spacing={5} align="stretch">
        <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={5} alignItems="start">
          <GridItem>
            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              Att betala för bolånet per månad
            </Text>
            <Text as="p" fontSize={{ base: '4xl', md: '5xl' }} fontWeight="bold" color="blue.700" lineHeight="1.1">
              {formatCurrency(viewModel.monthlyPaymentSeK)}
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              {formatCurrency(viewModel.monthlyInterestSeK)} ränta + {formatCurrency(viewModel.monthlyAmortizationSeK)}{' '}
              amortering · ca {formatCurrency(viewModel.monthlyNetPaymentSeK)} efter ränteavdrag
            </Text>
            {viewModel.hasHousingExtras && (
              <Text fontSize="sm" color="gray.600">
                Total boendekostnad med drift och budget: {formatCurrency(viewModel.totalHousingCostSeK)}/mån
              </Text>
            )}
          </GridItem>
          <GridItem>
            <Box p={4} borderRadius="md" bg="gray.50">
              <Text fontSize="sm" color="gray.600">
                Belåningsgrad idag
              </Text>
              <Text fontSize="2xl" fontWeight="semibold" color="gray.900">
                {viewModel.currentLoanToValueLabel}
              </Text>
            </Box>
          </GridItem>
        </Grid>

        <Grid templateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }} gap={3}>
          {viewModel.milestones.map((tile) => (
            <GridItem key={tile.key}>
              <MilestoneCard tile={tile} />
            </GridItem>
          ))}
        </Grid>

        {viewModel.nextChange && (
          <HStack
            spacing={3}
            p={3}
            borderRadius="md"
            bg="blue.50"
            borderLeftWidth="4px"
            borderLeftColor="blue.400"
            align="start"
          >
            <Text fontSize="sm" color="gray.800">
              Från <Text as="strong">{viewModel.nextChange.dateLabel}</Text>{' '}
              {viewModel.nextChange.isLower ? 'sänks' : 'höjs'} amorteringskravet: du amorterar{' '}
              <Text as="strong">{formatCurrency(viewModel.nextChange.amortizationSeK)}/mån</Text> och betalar då
              ca {formatCurrency(viewModel.nextChange.paymentSeK)}/mån.
            </Text>
          </HStack>
        )}
      </VStack>
    </Box>
  )
}
