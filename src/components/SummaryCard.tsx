import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import { formatCurrency } from '../utils/calculations'

interface SummaryCardProps {
  monthlyPayment: number
  budgetMonthlyCost: number
  interestMonthlyPayment: number
  effectiveInterestMonthlyPayment: number
  monthlyInterestDeduction: number
  yearlyInterestDeduction: number
  yearlyInterestDeductionPerBorrower: number
  numberOfBorrowers: 1 | 2
  monthlyInterestDeductionRatePercent: number
  effectiveMonthlyPayment: number
  nominalRatePercent: number
  effectiveRatePercent: number
  monthlyOperatingCost: number
  requiredMonthlyAmortization: number
  loanAmount: number
  amountToFinanceSeK?: number
}

interface StatItemProps {
  label: string
  value: string
  highlight?: boolean
  labelMaxWidth?: string
}

function StatItem({ label, value, highlight = false, labelMaxWidth }: StatItemProps) {
  return (
    <VStack align="start" spacing={1}>
      <Text
        fontSize="sm"
        color="gray.600"
        fontWeight="medium"
        lineHeight="short"
        textAlign="left"
        whiteSpace="pre-line"
        maxW={labelMaxWidth}
      >
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
  budgetMonthlyCost,
  interestMonthlyPayment,
  effectiveInterestMonthlyPayment,
  monthlyInterestDeduction,
  yearlyInterestDeduction,
  yearlyInterestDeductionPerBorrower,
  numberOfBorrowers,
  monthlyInterestDeductionRatePercent,
  effectiveMonthlyPayment,
  nominalRatePercent,
  effectiveRatePercent,
  monthlyOperatingCost,
  requiredMonthlyAmortization,
  loanAmount,
  amountToFinanceSeK,
}: SummaryCardProps) {
  const displayedLoanAmount = amountToFinanceSeK ?? loanAmount

  return (
    <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
      <VStack spacing={6} align="stretch">
        {/* Highlighted Monthly Payment */}
        <Box bg="blue.50" p={4} borderRadius="md" borderLeft="4px" borderLeftColor="blue.500">
          <VStack align="start" spacing={2}>
            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              Total månadskostnad
            </Text>
            <Heading as="h1" size="2xl" color="blue.600">
              {formatCurrency(monthlyPayment)}
            </Heading>
            <Text fontSize="sm" color="gray.600">
              (med ränteavdrag: {formatCurrency(Math.max(0, monthlyPayment - monthlyInterestDeduction))}, effektiv månadskostnad: {formatCurrency(effectiveMonthlyPayment)})
            </Text>
          </VStack>
        </Box>

        {/* Grid of Stats */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} columnGap={8} rowGap={6}>
          <GridItem>
            <StatItem 
              label={amountToFinanceSeK !== undefined ? "Belopp att finansiera" : "Lånebelopp"} 
              value={formatCurrency(amountToFinanceSeK ?? loanAmount)} 
            />
          </GridItem>
          <GridItem>
            <StatItem
              label="Nominell ränta (effektiv ränta)"
              value={`${nominalRatePercent.toFixed(2)}% (${effectiveRatePercent.toFixed(2)}%)`}
            />
          </GridItem>
          <GridItem>
            <StatItem
              label="Räntekostnad/mån (effektiv räntekostnad)"
              value={`${formatCurrency(interestMonthlyPayment)} (${formatCurrency(effectiveInterestMonthlyPayment)})`}
            />
          </GridItem>
          <GridItem>
            <StatItem
              label="Räntekostnad/mån (med ränteavdrag)"
              value={formatCurrency(Math.max(0, interestMonthlyPayment - monthlyInterestDeduction))}
            />
          </GridItem>
          <GridItem>
            <StatItem
              label="Ränteavdrag/mån (hushåll)"
              value={`${monthlyInterestDeductionRatePercent.toFixed(1)}%, ${formatCurrency(monthlyInterestDeduction)}`}
            />
          </GridItem>
          <GridItem>
            <StatItem
              label={`Ränteavdrag/år (${numberOfBorrowers} låntagare, per person)`}
              value={`${formatCurrency(yearlyInterestDeduction)} (${formatCurrency(yearlyInterestDeductionPerBorrower)})`}
            />
          </GridItem>
          <GridItem>
            <StatItem label="Budgetkostnad/mån" value={formatCurrency(budgetMonthlyCost)} />
          </GridItem>
          <GridItem>
            <StatItem label="Amortering/mån" value={formatCurrency(requiredMonthlyAmortization)} />
          </GridItem>
          <GridItem>
            <StatItem label="Driftskostnad/mån" value={formatCurrency(monthlyOperatingCost)} />
          </GridItem>
        </Grid>

        <Box fontSize="sm" color="gray.600" bg="gray.50" p={3} borderRadius="md">
          <Text>
            Fokus ligger på din månadskostnad här och nu. Med ett lån på{' '}
            <Text as="strong">{formatCurrency(displayedLoanAmount)}</Text> är din
            uppskattade månadskostnad{' '}
            <Text as="strong">{formatCurrency(monthlyPayment)}</Text>{' '}
            inklusive amortering och driftskostnad. Den effektiva
            månadskostnaden är{' '}
            <Text as="strong">{formatCurrency(effectiveMonthlyPayment)}</Text>.{' '}
            Jämför olika räntenivåer nedan för att se hur svängningar i
            ränteläget påverkar din månadsbudget.
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}
