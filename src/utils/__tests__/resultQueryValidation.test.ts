import { describe, expect, it } from 'vitest'
import { isValidResultQuery } from '../resultQueryValidation'

describe('isValidResultQuery', () => {
  it('returns true for complete and valid query params', () => {
    const query = new URLSearchParams({
      housePrice: '3000000',
      downPayment: '500000',
      monthlyIncome: '50000',
      loanPortions: JSON.stringify([
        {
          id: 'portion-1',
          bankId: 'sbab',
          amountSeK: 2500000,
          termYears: 3,
          interestRate: 3.2,
        },
      ]),
    }).toString()

    expect(isValidResultQuery(`?${query}`)).toBe(true)
  })

  it('returns false when required params are missing', () => {
    const query = new URLSearchParams({
      housePrice: '3000000',
      downPayment: '500000',
    }).toString()

    expect(isValidResultQuery(`?${query}`)).toBe(false)
  })

  it('returns false when values violate form completion rules', () => {
    const query = new URLSearchParams({
      housePrice: '3000000',
      downPayment: '3000000',
      monthlyIncome: '50000',
      loanPortions: JSON.stringify([
        {
          id: 'portion-1',
          bankId: 'sbab',
          amountSeK: 2500000,
          termYears: 3,
          interestRate: 3.2,
        },
      ]),
    }).toString()

    expect(isValidResultQuery(`?${query}`)).toBe(false)
  })

  it('returns false when loan portions are missing or invalid', () => {
    const missingPortions = new URLSearchParams({
      housePrice: '3000000',
      downPayment: '500000',
      monthlyIncome: '50000',
    }).toString()

    const invalidPortion = new URLSearchParams({
      housePrice: '3000000',
      downPayment: '500000',
      monthlyIncome: '50000',
      loanPortions: JSON.stringify([
        {
          id: 'portion-1',
          bankId: 'sbab',
          amountSeK: 0,
          termYears: 3,
          interestRate: 3.2,
        },
      ]),
    }).toString()

    expect(isValidResultQuery(`?${missingPortions}`)).toBe(false)
    expect(isValidResultQuery(`?${invalidPortion}`)).toBe(false)
  })
})
