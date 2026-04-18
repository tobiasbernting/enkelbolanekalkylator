import {
  Box,
  Grid,
  GridItem,
  HStack,
  Text,
  Tooltip,
  VStack,
  Heading,
  Divider,
} from '@chakra-ui/react'
import { formatCurrency } from '../utils/calculations'
import { PortionDetail } from '../utils/calculations'
import { useSummaryCardView } from '../hooks/useSummaryCardView'

interface SummaryCardProps {
  monthlyPayment: number
  interestMonthlyPayment: number
  effectiveInterestMonthlyPayment: number
  effectiveMonthlyPayment: number
  nominalRatePercent: number
  effectiveRatePercent: number
  effectiveYearlyCost: number
  monthlyOperatingCost: number
  requiredMonthlyAmortization: number
  requiredAmortizationRate: number
  amortizationExplanation?: string
  loanAmount: number
  downPaymentSeK: number
  totalInterest: number
  totalCost: number
  loanTerm: number
  amountToFinanceSeK?: number
  portionDetails?: PortionDetail[]
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
  interestMonthlyPayment,
  effectiveInterestMonthlyPayment,
  effectiveMonthlyPayment,
  nominalRatePercent,
  effectiveRatePercent,
  effectiveYearlyCost,
  monthlyOperatingCost,
  requiredMonthlyAmortization,
  requiredAmortizationRate,
  amortizationExplanation,
  loanAmount,
  downPaymentSeK,
  totalInterest,
  totalCost,
  loanTerm,
  amountToFinanceSeK,
  portionDetails,
}: SummaryCardProps) {
  const viewModel = useSummaryCardView({ portionDetails })
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
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} columnGap={8} rowGap={6}>
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
            <StatItem
              label={'Räntekostnad'}
              value={formatCurrency(totalInterest)}
              labelMaxWidth="18ch"
            />
          </GridItem>
          <GridItem>
            <StatItem label="Totalt kostnad" value={formatCurrency(totalCost)} />
          </GridItem>
          <GridItem>
            <StatItem label="Nominell ränta" value={`${nominalRatePercent.toFixed(2)}%`} />
          </GridItem>
          <GridItem>
            <StatItem
              label="Effektiv ränta"
              value={`${effectiveRatePercent.toFixed(2)}% (${formatCurrency(effectiveMonthlyPayment)}/mån)`}
            />
          </GridItem>
          <GridItem>
            <StatItem label="Ränta/mån" value={formatCurrency(interestMonthlyPayment)} />
          </GridItem>
          <GridItem>
            <StatItem label="Effektiv räntekostnad/mån" value={formatCurrency(effectiveInterestMonthlyPayment)} />
          </GridItem>
          <GridItem>
            <StatItem label="Amortering/mån" value={formatCurrency(requiredMonthlyAmortization)} />
          </GridItem>
          <GridItem>
            <StatItem label="Driftskostnad/mån" value={formatCurrency(monthlyOperatingCost)} />
          </GridItem>
          <GridItem>
            <StatItem label="Effektiv kostnad/mån" value={formatCurrency(effectiveMonthlyPayment)} />
          </GridItem>
          <GridItem>
            <StatItem label="Effektiv kostnad/år" value={formatCurrency(effectiveYearlyCost)} />
          </GridItem>
          <GridItem>
            <StatItem label="Handpenning" value={formatCurrency(downPaymentSeK)} />
          </GridItem>
          <GridItem>
            <VStack align="start" spacing={1}>
              <HStack spacing={2} align="center">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Amorteringskrav
                </Text>
                {amortizationExplanation && (
                  <Tooltip
                    hasArrow
                    placement="top-start"
                    openDelay={100}
                    label={
                      <Text fontSize="xs" lineHeight="short" maxW="36ch">
                        {amortizationExplanation}
                      </Text>
                    }
                  >
                    <Box
                      as="span"
                      display="inline-flex"
                      alignItems="center"
                      justifyContent="center"
                      w="18px"
                      h="18px"
                      borderRadius="full"
                      bg="gray.200"
                      color="gray.700"
                      fontSize="xs"
                      fontWeight="bold"
                      cursor="help"
                      userSelect="none"
                    >
                      i
                    </Box>
                  </Tooltip>
                )}
              </HStack>
              <Text fontSize="lg" fontWeight="semibold" color="black">
                {(requiredAmortizationRate * 100).toFixed(1)}% per år
              </Text>
            </VStack>
          </GridItem>
        </Grid>

        {/* Divider */}
        <Divider />

        {/* Summary Info */}
        <Box fontSize="sm" color="gray.600" bg="gray.50" p={3} borderRadius="md">
          <Text>
            Du bestämmer att låna{' '}
            <Text as="strong">{formatCurrency(loanAmount)}</Text> för att köpa
            ditt hus. {viewModel.hasMultiplePortions ? 'Med olika räntor och lånetider för varje portion' : `Med en lånetid på ${loanTerm} år`} kommer du att
            betala <Text as="strong">{formatCurrency(monthlyPayment)}</Text> i
            månaden inklusive amortering och driftskostnad. Effektiv månadsutgift (inkl avgiftspåslag i effektiv ränta) visas som{' '}
            <Text as="strong">{formatCurrency(effectiveMonthlyPayment)}</Text>. Det totala beloppet du betalar kommer att bli{' '}
            <Text as="strong">{formatCurrency(totalCost)}</Text>, varav{' '}
            <Text as="strong">{formatCurrency(totalInterest)}</Text> är ränta.
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}
