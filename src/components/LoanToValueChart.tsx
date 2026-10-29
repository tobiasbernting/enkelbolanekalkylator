import { Box, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { formatCurrency, type MortgageProjection } from '../utils/calculations'
import { CHART_HEIGHT, useLoanToValueChartView } from '../hooks/useLoanToValueChartView'

interface LoanToValueChartProps {
  projection: MortgageProjection
  startDate: Date
}

// Chakra theme values, inlined because SVG attributes don't resolve theme tokens.
const COLORS = {
  line: '#3182CE', // blue.500
  grid: '#EDF2F7', // gray.100
  axisText: '#718096', // gray.500
  threshold: '#A0AEC0', // gray.400
  thresholdText: '#4A5568', // gray.600
  crosshair: '#A0AEC0',
  surface: '#FFFFFF',
}

const DEFAULT_WIDTH = 640

function useElementWidth<T extends HTMLElement>(isMounted: boolean) {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(DEFAULT_WIDTH)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const nextWidth = Math.round(entries[0]?.contentRect.width ?? 0)
      if (nextWidth > 0) {
        setWidth(nextWidth)
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [isMounted])

  return { ref, width }
}

export function LoanToValueChart({ projection, startDate }: LoanToValueChartProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>(projection.months.length > 0)
  const viewModel = useLoanToValueChartView({ projection, startDate, width })

  if (!viewModel.hasData) {
    return null
  }

  const tooltipLeft = viewModel.active
    ? Math.min(Math.max(viewModel.active.x - 90, 0), Math.max(0, width - 180))
    : 0

  return (
    <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="md">
      <Text fontSize="lg" fontWeight="bold">
        Belåningsgrad över tid
      </Text>
      <Text fontSize="sm" color="gray.600" mb={3}>
        Hovra eller använd piltangenterna för att se läget ett visst år. Bostadens värde antas vara oförändrat.
      </Text>

      <Box ref={ref} position="relative" w="100%" overflow="hidden">
        <svg
          width={width}
          height={CHART_HEIGHT}
          role="img"
          aria-label={viewModel.summary}
          tabIndex={0}
          style={{ display: 'block', touchAction: 'pan-y', outline: 'none' }}
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect()
            viewModel.setActiveFromX(event.clientX - rect.left)
          }}
          onPointerLeave={viewModel.clearActive}
          onBlur={viewModel.clearActive}
          onKeyDown={(event) => {
            if (viewModel.onKeyDown(event.key)) {
              event.preventDefault()
            }
          }}
        >
          {viewModel.yTicks.map((tick) => (
            <g key={tick.label}>
              <line
                x1={viewModel.plotLeft}
                x2={viewModel.plotRight}
                y1={tick.y}
                y2={tick.y}
                stroke={COLORS.grid}
                strokeWidth={1}
              />
              <text
                x={viewModel.plotLeft - 8}
                y={tick.y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={12}
                fill={COLORS.axisText}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {tick.label}
              </text>
            </g>
          ))}

          {viewModel.xTicks.map((tick) => (
            <text
              key={tick.label}
              x={tick.x}
              y={viewModel.plotBottom + 20}
              textAnchor="middle"
              fontSize={12}
              fill={COLORS.axisText}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {tick.label}
            </text>
          ))}

          {/* Dashed lines mark the amortization thresholds, not a grid. */}
          {viewModel.thresholds.map((threshold) => (
            <g key={threshold.value}>
              <line
                x1={viewModel.plotLeft}
                x2={viewModel.plotRight}
                y1={threshold.y}
                y2={threshold.y}
                stroke={COLORS.threshold}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={viewModel.plotRight}
                y={threshold.y - 6}
                textAnchor="end"
                fontSize={12}
                fill={COLORS.thresholdText}
              >
                {threshold.label}
              </text>
            </g>
          ))}

          <path d={viewModel.areaPath} fill={COLORS.line} fillOpacity={0.1} />
          <path
            d={viewModel.linePath}
            fill="none"
            stroke={COLORS.line}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {viewModel.milestones.map((milestone) => (
            <g key={milestone.key}>
              <circle cx={milestone.x} cy={milestone.y} r={5} fill={COLORS.line} stroke={COLORS.surface} strokeWidth={2} />
              {milestone.showLabel && (
                <text
                  x={milestone.x + (milestone.anchor === 'start' ? 8 : -8)}
                  y={milestone.labelY}
                  textAnchor={milestone.anchor}
                  fontSize={12}
                  fontWeight={600}
                  fill={COLORS.thresholdText}
                >
                  {milestone.label}
                </text>
              )}
            </g>
          ))}

          {viewModel.active && (
            <g pointerEvents="none">
              <line
                x1={viewModel.active.x}
                x2={viewModel.active.x}
                y1={viewModel.plotTop}
                y2={viewModel.plotBottom}
                stroke={COLORS.crosshair}
                strokeWidth={1}
              />
              <circle
                cx={viewModel.active.x}
                cy={viewModel.active.y}
                r={5}
                fill={COLORS.line}
                stroke={COLORS.surface}
                strokeWidth={2}
              />
            </g>
          )}
        </svg>

        {viewModel.active && (
          <Box
            position="absolute"
            top={0}
            left={`${tooltipLeft}px`}
            w="180px"
            bg="white"
            borderWidth={1}
            borderColor="gray.200"
            borderRadius="md"
            boxShadow="md"
            px={3}
            py={2}
            pointerEvents="none"
            fontSize="sm"
            role="status"
          >
            <Text fontWeight="semibold" color="gray.800">
              {viewModel.active.dateLabel}
            </Text>
            <Text color="gray.700">Belåningsgrad: {viewModel.active.loanToValueLabel}</Text>
            <Text color="gray.700">Skuld: {formatCurrency(viewModel.active.balanceSeK)}</Text>
            {viewModel.active.paymentSeK > 0 && (
              <Text color="gray.700">Betalning: {formatCurrency(viewModel.active.paymentSeK)}/mån</Text>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
