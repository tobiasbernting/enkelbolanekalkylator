/**
 * Formatting helpers for the mortgage plan: payment month N is shown as a calendar
 * month, with the first payment in the month after `startDate`.
 */

export function getPlanStartDate(today: Date = new Date()): Date {
  return new Date(today.getFullYear(), today.getMonth() + 1, 1)
}

export function getDateForPaymentMonth(startDate: Date, paymentMonth: number): Date {
  return new Date(startDate.getFullYear(), startDate.getMonth() + Math.max(0, paymentMonth - 1), 1)
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { month: 'long', year: 'numeric' }).format(date)
}

export function formatShortMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { month: 'short', year: 'numeric' }).format(date)
}

/** "4 år 5 mån", "8 mån", "3 år". */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) {
    return `${remainingMonths} mån`
  }

  return remainingMonths === 0 ? `${years} år` : `${years} år ${remainingMonths} mån`
}

/** "80,0 %" */
export function formatLoanToValue(loanToValue: number, fractionDigits = 1): string {
  return `${(loanToValue * 100).toLocaleString('sv-SE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })} %`
}

/** "+1,00 %-enheter" with a real minus sign. */
export function formatPercentagePointChange(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '±'
  return `${sign}${Math.abs(value).toLocaleString('sv-SE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} %-enheter`
}
