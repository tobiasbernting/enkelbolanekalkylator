import { describe, expect, it } from 'vitest'
import { isMortgageFormComplete } from '../mortgageFormCompletion'

const portion = { id: 'p1', bankId: '', amountSeK: 2000000, termYears: 1, interestRate: 3 }

describe('isMortgageFormComplete', () => {
  it('treats income as optional', () => {
    expect(
      isMortgageFormComplete({ housePrice: 3000000, downPayment: 1000000, monthlyIncome: 0, loanPortions: [portion] })
    ).toBe(true)
  })

  it('rejects negative income', () => {
    expect(
      isMortgageFormComplete({ housePrice: 3000000, downPayment: 1000000, monthlyIncome: -1, loanPortions: [portion] })
    ).toBe(false)
  })

  it('rejects a remaining loan larger than the property value', () => {
    expect(
      isMortgageFormComplete({
        housePrice: 3000000,
        downPayment: -500000,
        monthlyIncome: 0,
        loanPortions: [portion],
      })
    ).toBe(false)
  })
})
