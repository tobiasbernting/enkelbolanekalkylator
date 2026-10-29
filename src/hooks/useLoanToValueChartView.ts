import { useMemo, useState } from 'react'
import type { MortgageProjection } from '../utils/calculations'
import {
  formatLoanToValue,
  formatMonthYear,
  formatShortMonthYear,
  getDateForPaymentMonth,
} from '../utils/planFormatting'

interface UseLoanToValueChartViewParams {
  projection: MortgageProjection
  startDate: Date
  width: number
}

export const CHART_HEIGHT = 280
export const CHART_MARGIN = { top: 20, right: 16, bottom: 32, left: 48 }
const LABEL_GAP = 8

/** Rough width of a 12px label, enough to keep labels from overlapping. */
function estimateLabelWidth(text: string): number {
  return text.length * 7
}

interface ChartPoint {
  /** 0 = today (before the first payment). */
  month: number
  loanToValue: number
  balanceSeK: number
  paymentSeK: number
  x: number
  y: number
}

export interface ChartThreshold {
  value: number
  y: number
  label: string
}

export interface ChartMilestone {
  key: string
  x: number
  y: number
  label: string
  /**
   * The line falls to the right, so above-right of the dot is clear unless the threshold
   * label is there; then below-left (under the line, which is higher to the left).
   */
  anchor: 'start' | 'end'
  labelY: number
  /** False when there is no free space; the date is still in the milestone cards and tooltip. */
  showLabel: boolean
}

export interface LoanToValueChartViewModel {
  hasData: boolean
  plotLeft: number
  plotRight: number
  plotTop: number
  plotBottom: number
  linePath: string
  areaPath: string
  yTicks: { y: number; label: string }[]
  xTicks: { x: number; label: string }[]
  thresholds: ChartThreshold[]
  milestones: ChartMilestone[]
  active: (ChartPoint & { dateLabel: string; loanToValueLabel: string }) | null
  summary: string
  setActiveFromX: (x: number) => void
  clearActive: () => void
  onKeyDown: (key: string) => boolean
}

export function useLoanToValueChartView({
  projection,
  startDate,
  width,
}: UseLoanToValueChartViewParams): LoanToValueChartViewModel {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const plotLeft = CHART_MARGIN.left
  const plotRight = Math.max(plotLeft + 50, width - CHART_MARGIN.right)
  const plotTop = CHART_MARGIN.top
  const plotBottom = CHART_HEIGHT - CHART_MARGIN.bottom

  const geometry = useMemo(() => {
    const totalMonths = projection.months.length
    const yMax = Math.max(0.8, Math.ceil((projection.initialLoanToValue + 0.05) * 10) / 10)
    const xScale = (month: number) =>
      plotLeft + (totalMonths > 0 ? (month / totalMonths) * (plotRight - plotLeft) : 0)
    const yScale = (loanToValue: number) => plotBottom - (loanToValue / yMax) * (plotBottom - plotTop)

    const points: ChartPoint[] = [
      {
        month: 0,
        loanToValue: projection.initialLoanToValue,
        balanceSeK: projection.initialBalanceSeK,
        paymentSeK: projection.months[0]?.paymentSeK ?? 0,
        x: xScale(0),
        y: yScale(projection.initialLoanToValue),
      },
      ...projection.months.map((month, index) => ({
        month: month.month,
        loanToValue: month.closingLoanToValue,
        balanceSeK: month.closingBalanceSeK,
        // What you pay in the month after this point.
        paymentSeK: projection.months[index + 1]?.paymentSeK ?? 0,
        x: xScale(month.month),
        y: yScale(month.closingLoanToValue),
      })),
    ]

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('')
    const areaPath =
      points.length > 1
        ? `${linePath}L${points[points.length - 1].x.toFixed(1)},${plotBottom}L${points[0].x.toFixed(1)},${plotBottom}Z`
        : ''

    const yTickValues = [0, 0.25, 0.5, 0.75, 1].filter((value) => value <= yMax + 1e-9)
    const yTicks = yTickValues.map((value) => ({ y: yScale(value), label: `${Math.round(value * 100)} %` }))

    const totalYears = Math.ceil(totalMonths / 12)
    const plotWidth = plotRight - plotLeft
    const maxLabels = Math.max(2, Math.floor(plotWidth / 56))
    const yearStep = [1, 2, 5, 10, 20, 25, 50].find((step) => totalYears / step <= maxLabels) ?? 50
    const xTicks: { x: number; label: string }[] = []
    for (let year = 0; year * 12 <= totalMonths; year += yearStep) {
      xTicks.push({
        x: xScale(year * 12),
        label: String(getDateForPaymentMonth(startDate, year * 12 + 1).getFullYear()),
      })
    }

    const thresholds: ChartThreshold[] = [
      { value: 0.7, y: yScale(0.7), label: '70 % · kravet sjunker till 1 %' },
      { value: 0.5, y: yScale(0.5), label: '50 % · inget krav' },
    ]
    const thresholdLabelLeft = (value: number) =>
      plotRight - estimateLabelWidth(thresholds.find((t) => t.value === value)?.label ?? '')

    const milestones = (['below70', 'below50'] as const)
      .map((key): ChartMilestone | null => {
        const month = projection.milestoneMonths[key]
        if (month === null || month === 0) {
          return null
        }
        const point = points[month]
        const x = point.x
        const label = formatShortMonthYear(getDateForPaymentMonth(startDate, month))
        const labelWidth = estimateLabelWidth(label)
        const fitsAboveRight =
          x + LABEL_GAP + labelWidth < thresholdLabelLeft(key === 'below70' ? 0.7 : 0.5) - LABEL_GAP
        const fitsBelowLeft = x - LABEL_GAP - labelWidth > plotLeft
        return {
          key,
          x,
          y: point.y,
          label,
          anchor: fitsAboveRight ? 'start' : 'end',
          labelY: fitsAboveRight ? point.y - 10 : point.y + 18,
          showLabel: fitsAboveRight || fitsBelowLeft,
        }
      })
      .filter((milestone): milestone is ChartMilestone => milestone !== null)

    return { points, linePath, areaPath, yTicks, xTicks, thresholds, milestones, totalMonths }
  }, [projection, startDate, plotLeft, plotRight, plotTop, plotBottom])

  const activePoint = activeIndex !== null ? geometry.points[Math.min(activeIndex, geometry.points.length - 1)] : null

  const below70 = projection.milestoneMonths.below70
  const below50 = projection.milestoneMonths.below50
  const describeMilestone = (month: number | null, label: string) =>
    month === null
      ? `${label} nås inte`
      : month === 0
        ? `${label} redan nådd`
        : `${label} i ${formatMonthYear(getDateForPaymentMonth(startDate, month))}`

  return {
    hasData: geometry.totalMonths > 0,
    plotLeft,
    plotRight,
    plotTop,
    plotBottom,
    linePath: geometry.linePath,
    areaPath: geometry.areaPath,
    yTicks: geometry.yTicks,
    xTicks: geometry.xTicks,
    thresholds: geometry.thresholds,
    milestones: geometry.milestones,
    active: activePoint
      ? {
          ...activePoint,
          dateLabel:
            activePoint.month === 0
              ? 'Idag'
              : `Efter ${formatMonthYear(getDateForPaymentMonth(startDate, activePoint.month))}`,
          loanToValueLabel: formatLoanToValue(activePoint.loanToValue),
        }
      : null,
    summary: `Belåningsgrad över tid, från ${formatLoanToValue(projection.initialLoanToValue)} idag. ${describeMilestone(
      below70,
      'Under 70 %'
    )}. ${describeMilestone(below50, 'Under 50 %')}.`,
    setActiveFromX: (x) => {
      if (geometry.totalMonths === 0) {
        return
      }
      const ratio = (x - plotLeft) / (plotRight - plotLeft)
      setActiveIndex(Math.min(geometry.totalMonths, Math.max(0, Math.round(ratio * geometry.totalMonths))))
    },
    clearActive: () => setActiveIndex(null),
    onKeyDown: (key) => {
      const last = geometry.totalMonths
      const current = activeIndex ?? 0
      const next =
        key === 'ArrowRight'
          ? Math.min(last, current + 12)
          : key === 'ArrowLeft'
            ? Math.max(0, current - 12)
            : key === 'Home'
              ? 0
              : key === 'End'
                ? last
                : null
      if (next === null) {
        return false
      }
      setActiveIndex(next)
      return true
    },
  }
}
