export const SAVED_CALCULATIONS_STORAGE_KEY = 'savedMortgageCalculations'
const SAVED_CALCULATION_VERSION = 1 as const

export interface SavedCalculation {
  id: string
  version: 1
  name: string
  createdAt: string
  calculationUrl: string
}

interface SaveCurrentCalculationInput {
  name: string
  calculationUrl: string
}

interface SaveCurrentCalculationSuccess {
  ok: true
  savedCalculation: SavedCalculation
}

interface SaveCurrentCalculationFailure {
  ok: false
  errorMessage: string
}

export type SaveCurrentCalculationResult =
  | SaveCurrentCalculationSuccess
  | SaveCurrentCalculationFailure

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

function isSavedCalculation(value: unknown): value is SavedCalculation {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isNonEmptyString(candidate.id) &&
    candidate.version === SAVED_CALCULATION_VERSION &&
    isNonEmptyString(candidate.name) &&
    isValidDateString(candidate.createdAt) &&
    isNonEmptyString(candidate.calculationUrl)
  )
}

function parseSavedCalculations(raw: string): SavedCalculation[] | null {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return null
    }

    return parsed.every((item) => isSavedCalculation(item))
      ? (parsed as SavedCalculation[])
      : null
  } catch {
    return null
  }
}

function generateSavedCalculationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `calc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function getValidatedCalculationUrl(url: string): string | null {
  if (!isNonEmptyString(url)) {
    return null
  }

  try {
    return new URL(url).toString()
  } catch {
    return null
  }
}

export function getSavedCalculations(): SavedCalculation[] {
  const raw = window.localStorage.getItem(SAVED_CALCULATIONS_STORAGE_KEY)
  if (!raw) {
    return []
  }

  const parsed = parseSavedCalculations(raw)
  if (!parsed) {
    window.localStorage.removeItem(SAVED_CALCULATIONS_STORAGE_KEY)
    return []
  }

  return parsed
}

export function sanitizeSavedCalculationsStorage(): void {
  void getSavedCalculations()
}

export function saveCurrentCalculation({
  name,
  calculationUrl,
}: SaveCurrentCalculationInput): SaveCurrentCalculationResult {
  const trimmedName = name.trim()
  if (!trimmedName) {
    return {
      ok: false,
      errorMessage: 'Ange ett namn innan du sparar.',
    }
  }

  const validUrl = getValidatedCalculationUrl(calculationUrl)
  if (!validUrl) {
    return {
      ok: false,
      errorMessage: 'Kunde inte spara berakningen eftersom URL:en ar ogiltig.',
    }
  }

  const existing = getSavedCalculations()
  const savedCalculation: SavedCalculation = {
    id: generateSavedCalculationId(),
    version: SAVED_CALCULATION_VERSION,
    name: trimmedName,
    createdAt: new Date().toISOString(),
    calculationUrl: validUrl,
  }

  try {
    window.localStorage.setItem(
      SAVED_CALCULATIONS_STORAGE_KEY,
      JSON.stringify([savedCalculation, ...existing])
    )

    return {
      ok: true,
      savedCalculation,
    }
  } catch {
    return {
      ok: false,
      errorMessage: 'Kunde inte spara berakningen i local storage.',
    }
  }
}