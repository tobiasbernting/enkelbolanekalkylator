import type { LoanPortion } from './calculations'
import { isMortgageFormComplete } from './mortgageFormCompletion'

function parseRequiredNumber(value: string | null): number | null {
  if (value === null || value.trim().length === 0) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseLoanPortions(value: string | null): LoanPortion[] {
  if (value === null || value.trim().length === 0) {
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
        bankId: typeof item.bankId === 'string' ? item.bankId : '',
        amountSeK: Number.isFinite(Number(item.amountSeK)) ? Number(item.amountSeK) : Number.NaN,
        termYears: Number.isFinite(Number(item.termYears)) ? Number(item.termYears) : Number.NaN,
        interestRate: Number.isFinite(Number(item.interestRate)) ? Number(item.interestRate) : Number.NaN,
      }))
      .filter(
        (item) =>
          Number.isFinite(item.amountSeK) &&
          item.amountSeK > 0 &&
          Number.isFinite(item.termYears) &&
          item.termYears > 0 &&
          Number.isFinite(item.interestRate) &&
          item.interestRate >= 0
      )
  } catch {
    return []
  }
}

export function isValidResultQuery(search: string): boolean {
  const searchString = search.startsWith('?') ? search.slice(1) : search
  if (searchString.length === 0) {
    return false
  }

  const params = new URLSearchParams(searchString)
  const housePrice = parseRequiredNumber(params.get('housePrice'))
  const downPayment = parseRequiredNumber(params.get('downPayment'))
  const monthlyIncome = parseRequiredNumber(params.get('monthlyIncome'))

  if (housePrice === null || downPayment === null || monthlyIncome === null) {
    return false
  }

  return isMortgageFormComplete({
    housePrice,
    downPayment,
    monthlyIncome,
    loanPortions: parseLoanPortions(params.get('loanPortions')),
  })
}
