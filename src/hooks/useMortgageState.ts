import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BankRateType } from '../data/bankRates'
import type { LoanPortion } from '../utils/calculations'

export type DownPaymentMode = 'amount' | 'percentage'

export interface MortgageState {
  housePrice: number
  downPayment: number
  monthlyIncome: number
  monthlyAmortization: number
  monthlyOperatingCost: number
  isMonthlyAmortizationUserSet: boolean
  loanTerm: number
  selectedBank: string
  selectedRateType: BankRateType
  downPaymentMode: DownPaymentMode
  loanPortions: LoanPortion[]
}

export interface MortgageStateActions {
  setHousePrice: (value: number) => void
  setDownPayment: (value: number) => void
  setMonthlyIncome: (value: number) => void
  setMonthlyAmortization: (value: number) => void
  setMonthlyOperatingCost: (value: number) => void
  setIsMonthlyAmortizationUserSet: (value: boolean) => void
  setLoanTerm: (value: number) => void
  setSelectedBank: (value: string) => void
  setSelectedRateType: (value: BankRateType) => void
  setDownPaymentMode: (value: DownPaymentMode) => void
  setLoanPortions: (value: LoanPortion[]) => void
  reset: () => void
}

const DEFAULT_HOUSE_PRICE = 2000000
const DEFAULT_DOWN_PAYMENT = 400000
const DEFAULT_MONTHLY_INCOME = 0
const DEFAULT_MONTHLY_AMORTIZATION = 0
const DEFAULT_MONTHLY_OPERATING_COST = 0
const DEFAULT_LOAN_TERM = 20
const DEFAULT_BANK_ID = 'sbab'
const DEFAULT_RATE_TYPE: BankRateType = 'average'

function parseNumberParam(value: string | null, fallback: number): number {
  if (!value) {
    return fallback
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseDownPaymentModeParam(value: string | null): DownPaymentMode {
  return value === 'percentage' ? 'percentage' : 'amount'
}

function parseRateTypeParam(value: string | null): BankRateType {
  return value === 'list' ? 'list' : 'average'
}

function parseAmortizationModeParam(
  mode: string | null,
  monthlyAmortization: number
): boolean {
  if (mode === 'manual') {
    return true
  }

  if (mode === 'auto') {
    return false
  }

  // Backward compatibility for old URLs without mode.
  return monthlyAmortization > 0
}

function parseLoanPortionsParam(value: string | null, fallbackBankId: string): LoanPortion[] {
  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((item, index) => ({
        id: typeof item.id === 'string' && item.id.length > 0 ? item.id : `portion-${index}`,
        bankId: typeof item.bankId === 'string' && item.bankId.length > 0 ? item.bankId : fallbackBankId,
        amountSeK: Number.isFinite(Number(item.amountSeK)) ? Number(item.amountSeK) : 0,
        termYears: Number.isFinite(Number(item.termYears)) ? Number(item.termYears) : 1,
        interestRate: Number.isFinite(Number(item.interestRate)) ? Number(item.interestRate) : 0,
      }))
      .filter((item) => item.amountSeK >= 0 && item.termYears > 0 && item.interestRate >= 0)
  } catch {
    return []
  }
}

function getInitialStateFromQuery(): MortgageState {
  const params = new URLSearchParams(window.location.search)
  const monthlyIncomeFromQuery = parseNumberParam(params.get('monthlyIncome'), DEFAULT_MONTHLY_INCOME)
  const annualIncomeFromLegacyQuery = parseNumberParam(params.get('annualIncome'), 0)
  const selectedBank = params.get('bankId') || DEFAULT_BANK_ID
  const monthlyAmortization = parseNumberParam(
    params.get('monthlyAmortization'),
    DEFAULT_MONTHLY_AMORTIZATION
  )
  const monthlyOperatingCost = parseNumberParam(
    params.get('monthlyOperatingCost'),
    DEFAULT_MONTHLY_OPERATING_COST
  )

  return {
    housePrice: parseNumberParam(params.get('housePrice'), DEFAULT_HOUSE_PRICE),
    downPayment: parseNumberParam(params.get('downPayment'), DEFAULT_DOWN_PAYMENT),
    monthlyIncome: monthlyIncomeFromQuery > 0 ? monthlyIncomeFromQuery : annualIncomeFromLegacyQuery / 12,
    monthlyAmortization,
    monthlyOperatingCost,
    isMonthlyAmortizationUserSet: parseAmortizationModeParam(
      params.get('amortizationMode'),
      monthlyAmortization
    ),
    loanTerm: parseNumberParam(params.get('loanTerm'), DEFAULT_LOAN_TERM),
    selectedBank,
    selectedRateType: parseRateTypeParam(params.get('rateType')),
    downPaymentMode: parseDownPaymentModeParam(params.get('downPaymentMode')),
    loanPortions: parseLoanPortionsParam(params.get('loanPortions'), selectedBank),
  }
}

export function useMortgageState(): { state: MortgageState; actions: MortgageStateActions } {
  const initialState = useMemo(() => getInitialStateFromQuery(), [])

  const [housePrice, setHousePrice] = useState(initialState.housePrice)
  const [downPayment, setDownPayment] = useState(initialState.downPayment)
  const [monthlyIncome, setMonthlyIncome] = useState(initialState.monthlyIncome)
  const [monthlyAmortization, setMonthlyAmortization] = useState(initialState.monthlyAmortization)
  const [monthlyOperatingCost, setMonthlyOperatingCost] = useState(initialState.monthlyOperatingCost)
  const [isMonthlyAmortizationUserSet, setIsMonthlyAmortizationUserSet] = useState(
    initialState.isMonthlyAmortizationUserSet
  )
  const [loanTerm, setLoanTerm] = useState(initialState.loanTerm)
  const [selectedBank, setSelectedBank] = useState(initialState.selectedBank)
  const [selectedRateType, setSelectedRateType] = useState<BankRateType>(initialState.selectedRateType)
  const [downPaymentMode, setDownPaymentMode] = useState<DownPaymentMode>(initialState.downPaymentMode)
  const [loanPortions, setLoanPortions] = useState<LoanPortion[]>(initialState.loanPortions)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    params.set('housePrice', String(housePrice))
    params.set('downPayment', String(downPayment))
    params.set('monthlyIncome', String(monthlyIncome))
    params.set('monthlyAmortization', String(monthlyAmortization))
    params.set('monthlyOperatingCost', String(monthlyOperatingCost))
    params.set('amortizationMode', isMonthlyAmortizationUserSet ? 'manual' : 'auto')
    params.delete('annualIncome')
    params.set('loanTerm', String(loanTerm))
    params.set('bankId', selectedBank)
    params.set('rateType', selectedRateType)
    params.set('downPaymentMode', downPaymentMode)

    if (loanPortions.length > 0) {
      params.set('loanPortions', JSON.stringify(loanPortions))
    } else {
      params.delete('loanPortions')
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }, [
    housePrice,
    downPayment,
    monthlyIncome,
    monthlyAmortization,
    monthlyOperatingCost,
    isMonthlyAmortizationUserSet,
    loanTerm,
    selectedBank,
    selectedRateType,
    downPaymentMode,
    loanPortions,
  ])

  const reset = useCallback(() => {
    setHousePrice(DEFAULT_HOUSE_PRICE)
    setDownPayment(DEFAULT_DOWN_PAYMENT)
    setMonthlyIncome(DEFAULT_MONTHLY_INCOME)
    setMonthlyAmortization(DEFAULT_MONTHLY_AMORTIZATION)
    setMonthlyOperatingCost(DEFAULT_MONTHLY_OPERATING_COST)
    setIsMonthlyAmortizationUserSet(false)
    setLoanTerm(DEFAULT_LOAN_TERM)
    setSelectedBank(DEFAULT_BANK_ID)
    setSelectedRateType(DEFAULT_RATE_TYPE)
    setDownPaymentMode('amount')
    setLoanPortions([])
  }, [])

  return {
    state: {
      housePrice,
      downPayment,
      monthlyIncome,
      monthlyAmortization,
      monthlyOperatingCost,
      isMonthlyAmortizationUserSet,
      loanTerm,
      selectedBank,
      selectedRateType,
      downPaymentMode,
      loanPortions,
    },
    actions: {
      setHousePrice,
      setDownPayment,
      setMonthlyIncome,
      setMonthlyAmortization,
      setMonthlyOperatingCost,
      setIsMonthlyAmortizationUserSet,
      setLoanTerm,
      setSelectedBank,
      setSelectedRateType,
      setDownPaymentMode,
      setLoanPortions,
      reset,
    },
  }
}
