import { useCallback, useEffect } from 'react'

interface UseAutoAmortizationParams {
  monthlyAmortization: number
  isMonthlyAmortizationUserSet: boolean
  requiredMonthlyAmortization: number
  setMonthlyAmortization: (value: number) => void
  setIsMonthlyAmortizationUserSet: (value: boolean) => void
}

interface UseAutoAmortizationResult {
  isMonthlyAmortizationAuto: boolean
  setAmortizationMode: (isAuto: boolean) => void
  setManualMonthlyAmortization: (value: number) => void
}

export function useAutoAmortization({
  monthlyAmortization,
  isMonthlyAmortizationUserSet,
  requiredMonthlyAmortization,
  setMonthlyAmortization,
  setIsMonthlyAmortizationUserSet,
}: UseAutoAmortizationParams): UseAutoAmortizationResult {
  const setAmortizationMode = useCallback(
    (isAuto: boolean) => {
      if (isAuto) {
        setIsMonthlyAmortizationUserSet(false)
        setMonthlyAmortization(Math.max(0, Math.round(requiredMonthlyAmortization)))
        return
      }

      setIsMonthlyAmortizationUserSet(true)
    },
    [requiredMonthlyAmortization, setIsMonthlyAmortizationUserSet, setMonthlyAmortization]
  )

  const setManualMonthlyAmortization = useCallback(
    (value: number) => {
      setIsMonthlyAmortizationUserSet(true)
      setMonthlyAmortization(value)
    },
    [setIsMonthlyAmortizationUserSet, setMonthlyAmortization]
  )

  useEffect(() => {
    if (isMonthlyAmortizationUserSet) {
      return
    }

    const autoCalculatedAmortization = Math.max(0, Math.round(requiredMonthlyAmortization))

    if (Math.abs(monthlyAmortization - autoCalculatedAmortization) > 0.5) {
      setMonthlyAmortization(autoCalculatedAmortization)
    }
  }, [
    isMonthlyAmortizationUserSet,
    monthlyAmortization,
    requiredMonthlyAmortization,
    setMonthlyAmortization,
  ])

  return {
    isMonthlyAmortizationAuto: !isMonthlyAmortizationUserSet,
    setAmortizationMode,
    setManualMonthlyAmortization,
  }
}
