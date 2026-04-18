import {
  Box,
  Grid,
  GridItem,
  Text,
  VStack,
  Heading,
  Divider,
} from '@chakra-ui/react'
import { formatCurrency } from '../utils/calculations'
import { PortionDetail } from '../utils/calculations'

interface SummaryCardProps {
  monthlyPayment: number
  interestMonthlyPayment: number
  requiredMonthlyAmortization: number
  requiredAmortizationRate: number
  loanAmount: number
  totalInterest: number
  totalCost: number
  loanTerm: number
  amountToFinanceSeK?: number
  portionDetails?: PortionDetail[]
}

function StatItem({ label, value, highlight = false }: any) {
  return (
    <VStack align="start" spacing={1}>
      <Text fontSize="sm" color="gray.600" fontWeight="medium">
        {label}
      </Text>
      <Text
        fontSize={highlight ? '2xl' : 'lg'}
        fontWeight={highlight ? 'bold' : 'semibold'}
        color={highlight ? 'blue.600' : 'black'}
      >
        {value}
      </Text>
    </VStack>
  )
}

export function SummaryCard({
  monthlyPayment,
  interestMonthlyPayment,
  requiredMonthlyAmortization,
  requiredAmortizationRate,
  loanAmount,
  totalInterest,
  totalCost,
  loanTerm,
  amountToFinanceSeK,
  portionDetails,
}: SummaryCardProps) {
  const hasMultiplePortions = !!portionDetails && portionDetails.length > 1
  return (
    <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
      <VStack spacing={6} align="stretch">
        {/* Highlighted Monthly Payment */}
        <Box bg="blue.50" p={4} borderRadius="md" borderLeft="4px" borderLeftColor="blue.500">
          <VStack align="start" spacing={2}>
            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              Månatlig betalning
            </Text>
            <Heading as="h1" size="2xl" color="blue.600">
              {formatCurrency(monthlyPayment)}
            </Heading>
          </VStack>
        </Box>

        {/* Grid of Stats */}
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem>
            <StatItem 
              label={amountToFinanceSeK !== undefined ? "Belopp att finansiera" : "Lånebelopp"} 
              value={formatCurrency(amountToFinanceSeK ?? loanAmount)} 
            />
          </GridItem>
          <GridItem>
            <StatItem label="Totalt lånebelopp" value={formatCurrency(loanAmount)} />
          </GridItem>
          <GridItem>
            <StatItem label="Skuldränta" value={formatCurrency(totalInterest)} />
          </GridItem>
          <GridItem>
            <StatItem label="Totalt kostnad" value={formatCurrency(totalCost)} />
          </GridItem>
          <GridItem>
            <StatItem label="Ränta/mån" value={formatCurrency(interestMonthlyPayment)} />
          </GridItem>
          <GridItem>
            <StatItem label="Amortering/mån" value={formatCurrency(requiredMonthlyAmortization)} />
          </GridItem>
          <GridItem colSpan={2}>
            <StatItem label="Amorteringskrav" value={`${(requiredAmortizationRate * 100).toFixed(1)}% per år`} />
          </GridItem>
        </Grid>

        {/* Divider */}
        <Divider />

        {/* Summary Info */}
        <Box fontSize="sm" color="gray.600" bg="gray.50" p={3} borderRadius="md">
          <Text>
            Du bestämmer att låna{' '}
            <Text as="strong">{formatCurrency(loanAmount)}</Text> för att köpa
            ditt hus. {hasMultiplePortions ? 'Med olika räntor och lånetider för varje portion' : `Med en lånetid på ${loanTerm} år`} kommer du att
            betala <Text as="strong">{formatCurrency(monthlyPayment)}</Text> i
            månaden inklusive amortering. Det totala beloppet du betalar kommer att bli{' '}
            <Text as="strong">{formatCurrency(totalCost)}</Text>, varav{' '}
            <Text as="strong">{formatCurrency(totalInterest)}</Text> är ränta.
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}
