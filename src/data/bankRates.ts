export type BankRateType = 'list' | 'average';

export interface BankRatePreset {
  id: string;
  label: string;
  updatedAt: string;
  listRatesByTerm: Record<number, number>;
  averageRatesByTerm: Record<number, number>;
}

export function getRatesByType(
  preset: BankRatePreset,
  rateType: BankRateType
): Record<number, number> {
  return rateType === 'list' ? preset.listRatesByTerm : preset.averageRatesByTerm;
}

export const BANK_RATE_PRESETS: BankRatePreset[] = [
  {
    id: 'sbab',
    label: 'SBAB',
    updatedAt: '2026-03-31',
    listRatesByTerm: {
      0.25: 3.20,
      1: 3.62,
      2: 3.84,
      3: 3.99,
      4: 4.09,
      5: 4.19,
      7: 4.38,
      10: 4.59,
    },
    averageRatesByTerm: {
      0.25: 3.05,
      1: 3.47,
      2: 3.69,
      3: 3.84,
      4: 3.94,
      5: 4.04,
      7: 4.23,
      10: 4.44,
    },
  },
  {
    id: 'handelsbanken',
    label: 'Handelsbanken',
    updatedAt: '2026-04-18',
    listRatesByTerm: {
      0.25: 3.99,
      1: 3.64,
      2: 3.74,
      3: 3.89,
      5: 4.09,
      8: 4.29,
      10: 4.34,
    },
    averageRatesByTerm: {
      0.25: 2.63,
      1: 3.04,
      2: 3.13,
      3: 3.26,
      5: 3.47,
      8: 3.83,
      10: 3.93,
    },
  },
  {
    id: 'nordea',
    label: 'Nordea',
    updatedAt: '2026-03-30',
    listRatesByTerm: {
      0.25: 3.99,
      1: 3.74,
      2: 3.89,
      3: 3.94,
      4: 3.99,
      5: 4.09,
      8: 4.29,
    },
    averageRatesByTerm: {
      0.25: 2.68,
      1: 3.05,
      2: 3.11,
      3: 3.18,
      4: 3.27,
      5: 3.47,
      8: 3.72,
    },
  },
  {
    id: 'swedbank',
    label: 'Swedbank',
    updatedAt: '2026-03-28',
    listRatesByTerm: {
      0.25: 3.94,
      1: 3.58,
      2: 3.69,
      3: 3.84,
      4: 3.94,
      5: 4.09,
      6: 4.29,
      7: 4.29,
      8: 4.29,
      9: 4.29,
      10: 4.29,
    },
    averageRatesByTerm: {
      0.25: 2.69,
      1: 2.88,
      2: 3.04,
      3: 2.96,
      4: 3.25,
      5: 3.31,
      6: 3.56,
      7: 3.20,
      8: 3.58,
      10: 3.71,
    },
  },
];
