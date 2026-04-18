import { useMemo } from 'react'
import type { PortionDetail } from '../utils/calculations'

interface UseSummaryCardViewParams {
  portionDetails?: PortionDetail[]
}

export interface SummaryCardViewModel {
  hasMultiplePortions: boolean
}

export function useSummaryCardView({ portionDetails }: UseSummaryCardViewParams): SummaryCardViewModel {
  const hasMultiplePortions = useMemo(
    () => !!portionDetails && portionDetails.length > 1,
    [portionDetails]
  )

  return { hasMultiplePortions }
}
