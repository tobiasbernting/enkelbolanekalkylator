import {
  Box,
  Button,
  VStack,
  HStack,
  Grid,
  GridItem,
  Text,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
} from '@chakra-ui/react';
import { LoanPortion } from '../utils/calculations';
import {
  BANK_RATE_PRESETS,
  BankRateType,
  getEffectiveRatesByType,
  getRatesByType,
} from '../data/bankRates';

interface LoanPortionsPanelProps {
  portions: LoanPortion[];
  onPortionsChange: (portions: LoanPortion[]) => void;
  selectedBank: string;
  selectedRateType: BankRateType;
  onSelectedBankChange: (bankId: string) => void;
  onSelectedRateTypeChange: (rateType: BankRateType) => void;
  defaultInterestRate: number;
  amountToFinance: number;
}

const TERM_OPTIONS = [
  { label: '3 månader', value: 0.25 },
  { label: '1 år', value: 1 },
  { label: '2 år', value: 2 },
  { label: '3 år', value: 3 },
  { label: '4 år', value: 4 },
  { label: '5 år', value: 5 },
  { label: '6 år', value: 6 },
  { label: '7 år', value: 7 },
  { label: '8 år', value: 8 },
  { label: '9 år', value: 9 },
  { label: '10 år', value: 10 },
];

export function LoanPortionsPanel({ 
  portions, 
  onPortionsChange, 
  selectedBank,
  selectedRateType,
  onSelectedBankChange,
  onSelectedRateTypeChange,
  defaultInterestRate, 
  amountToFinance 
}: LoanPortionsPanelProps) {
  const selectedPreset = BANK_RATE_PRESETS.find((preset) => preset.id === selectedBank);
  const totalAmount = portions.reduce((sum, p) => sum + p.amountSeK, 0);

  const nominalToEffectiveAnnualRate = (nominalRatePercent: number): number => {
    const nominal = nominalRatePercent / 100;
    const effective = Math.pow(1 + nominal / 12, 12) - 1;
    return effective * 100;
  };

  const normalizeBankId = (bankId: string | undefined): string | undefined => {
    if (bankId && BANK_RATE_PRESETS.some((preset) => preset.id === bankId)) {
      return bankId;
    }

    if (selectedBank && BANK_RATE_PRESETS.some((preset) => preset.id === selectedBank)) {
      return selectedBank;
    }

    return undefined;
  };

  const getRatesForBank = (bankId: string | undefined, rateType: BankRateType) => {
    const normalizedBankId = normalizeBankId(bankId);
    if (!normalizedBankId) {
      return {} as Record<number, number>;
    }

    const preset = BANK_RATE_PRESETS.find((item) => item.id === normalizedBankId);
    if (!preset) {
      return {} as Record<number, number>;
    }

    return getRatesByType(preset, rateType);
  };

  const getDefaultTermForBank = (): number => {
    const ratesByTerm = getRatesForBank(selectedBank, selectedRateType);
    return (
      TERM_OPTIONS.find((option) => ratesByTerm[option.value] !== undefined)?.value ??
      1
    );
  };

  const getDefaultRateForBankTerm = (bankId: string, termYears: number): number => {
    const ratesByTerm = getRatesForBank(bankId, selectedRateType);
    return ratesByTerm[termYears] ?? defaultInterestRate;
  };

  const getEffectiveRateForBankTerm = (bankId: string, termYears: number): number => {
    const normalizedBankId = normalizeBankId(bankId);
    if (!normalizedBankId) {
      const portion = portions.find((item) => item.bankId === bankId && item.termYears === termYears);
      return nominalToEffectiveAnnualRate(portion?.interestRate ?? defaultInterestRate);
    }

    const preset = BANK_RATE_PRESETS.find((item) => item.id === normalizedBankId);
    if (!preset) {
      return nominalToEffectiveAnnualRate(defaultInterestRate);
    }

    const effectiveRatesByTerm = getEffectiveRatesByType(preset, selectedRateType);
    const nominalRatesByTerm = getRatesByType(preset, selectedRateType);
    return effectiveRatesByTerm[termYears] ?? nominalRatesByTerm[termYears] ?? defaultInterestRate;
  };

  const formatIntegerWithSpaces = (value: number): string => {
    if (!Number.isFinite(value)) {
      return '';
    }

    return new Intl.NumberFormat('sv-SE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.max(0, Math.round(value)));
  };

  const parseFormattedNumber = (value: string): number => {
    const normalized = value.replace(/\s/g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const addPortion = () => {
    const bankId = selectedBank;
    const termYears = getDefaultTermForBank();
    const remainingAmount = Math.max(0, amountToFinance - totalAmount);

    const newPortion: LoanPortion = {
      id: `portion-${Date.now()}`,
      bankId,
      amountSeK: remainingAmount,
      termYears,
      interestRate: getDefaultRateForBankTerm(bankId, termYears),
    };
    onPortionsChange([...portions, newPortion]);
  };

  const removePortion = (id: string) => {
    onPortionsChange(portions.filter(p => p.id !== id));
  };

  const updatePortionNumber = (
    id: string,
    field: 'amountSeK' | 'termYears' | 'interestRate',
    value: number
  ) => {
    const updated = portions.map((p) => {
      if (p.id !== id) {
        return p;
      }

      const updatedPortion = { ...p, [field]: value, bankId: selectedBank } as LoanPortion;

      if (field === 'termYears' && selectedPreset) {
        const ratesForBank = getRatesForBank(selectedBank, selectedRateType);
        const rateForSelectedTerm = ratesForBank[value];
        if (rateForSelectedTerm !== undefined) {
          updatedPortion.interestRate = rateForSelectedTerm;
        }
      }

      return updatedPortion;
    });
    onPortionsChange(updated);
  };

  const handleRateTypeChange = (nextRateType: BankRateType) => {
    onSelectedRateTypeChange(nextRateType);
    const updated = portions.map((portion) => {
      const ratesForBank = getRatesForBank(selectedBank, nextRateType);
      const presetRate = ratesForBank[portion.termYears];
      if (presetRate === undefined) {
        return { ...portion, bankId: selectedBank };
      }

      return {
        ...portion,
        bankId: selectedBank,
        interestRate: presetRate,
      };
    });

    onPortionsChange(updated);
  };

  const handleBankChange = (nextBankId: string) => {
    onSelectedBankChange(nextBankId);

    const updated = portions.map((portion) => {
      const ratesForBank = getRatesForBank(nextBankId, selectedRateType);
      const presetRate = ratesForBank[portion.termYears];

      return {
        ...portion,
        bankId: nextBankId,
        interestRate: presetRate !== undefined ? presetRate : portion.interestRate,
      };
    });

    onPortionsChange(updated);
  };

  const portionsSumMismatch = portions.length > 0 && Math.abs(totalAmount - amountToFinance) > 1;

  return (
    <Box
      p={6}
      borderWidth={2}
      borderRadius="xl"
      bgGradient="linear(to-br, blue.50, white)"
      boxShadow="xl"
      mt={2}
    >
      <VStack spacing={5} align="stretch">
        {portionsSumMismatch && (
          <Box bg="yellow.100" color="orange.800" p={3} borderRadius="md" fontWeight="bold">
            Summan av alla låneportioner ({totalAmount.toLocaleString('sv-SE')} SEK) matchar inte belopp att finansiera ({amountToFinance.toLocaleString('sv-SE')} SEK).
          </Box>
        )}
        <Heading size="lg" color="blue.800">Låneportioner</Heading>

        <Grid
          templateColumns="repeat(auto-fit, minmax(220px, 1fr))"
          gap={3}
          alignItems="end"
        >
          <GridItem>
            <Text fontSize="sm" color="gray.700" mb={1} fontWeight="medium">Välj bank</Text>
            <Select
              value={selectedBank}
              onChange={(e) => handleBankChange(e.target.value)}
              size="md"
              bg="white"
            >
              <option value="">Ingen bank (egen ränta)</option>
              {BANK_RATE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </GridItem>
          <GridItem>
            <Text fontSize="sm" color="gray.700" mb={1} fontWeight="medium">Räntetyp</Text>
            <Select
              value={selectedRateType}
              onChange={(e) => handleRateTypeChange(e.target.value as BankRateType)}
              size="md"
              bg="white"
            >
              <option value="average">Snittränta</option>
              <option value="list">Listränta</option>
            </Select>
          </GridItem>
        </Grid>

        <Box bg="whiteAlpha.700" borderWidth={1} borderColor="gray.200" p={3} borderRadius="md">
          <HStack justify="space-between" flexWrap="wrap" gap={2}>
            <Text fontSize="sm" color="gray.600">
              {selectedPreset
                ? 'Välj en bank och räntetyp. Alla låneportioner följer samma bank för jämförelse mellan banker.'
                : 'Ingen bank vald: räntor sätts manuellt per låneportion.'}
            </Text>
            {selectedPreset && (
              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                {selectedPreset.label} uppdaterad {selectedPreset.updatedAt}
              </Text>
            )}
          </HStack>
        </Box>

        <Button
          colorScheme="blue"
          onClick={addPortion}
          size="lg"
          fontWeight="bold"
          alignSelf="flex-start"
        >
          Lägg till låneportion
        </Button>

        {portions.length > 0 && (
          <Box maxH="360px" overflow="auto" borderWidth={1} borderColor="gray.200" borderRadius="lg" bg="white">
            <Table size="sm" variant="simple">
              <Thead bg="gray.50" position="sticky" top={0} zIndex={1}>
                <Tr>
                  <Th minW="170px">Belopp (SEK)</Th>
                  <Th minW="140px">Ränta (%)</Th>
                  <Th minW="160px">Effektiv ränta (%)</Th>
                  <Th minW="150px">Löptid</Th>
                  <Th minW="110px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {portions.map((portion) => (
                  <Tr key={portion.id}>
                    <Td>
                      <Input
                        value={formatIntegerWithSpaces(portion.amountSeK)}
                        onChange={(e) =>
                          updatePortionNumber(
                            portion.id,
                            'amountSeK',
                            parseFormattedNumber(e.target.value)
                          )
                        }
                        placeholder="0"
                        size="md"
                        inputMode="numeric"
                      />
                    </Td>
                    <Td>
                      <Input
                        type="number"
                        value={portion.interestRate || ''}
                        onChange={(e) => updatePortionNumber(portion.id, 'interestRate', Number(e.target.value) || 0)}
                        placeholder="6.0"
                        size="md"
                        step="0.1"
                      />
                    </Td>
                    <Td>
                      <Text fontWeight="semibold" color="gray.700">
                        {getEffectiveRateForBankTerm(portion.bankId, portion.termYears).toFixed(2)}%
                      </Text>
                    </Td>
                    <Td>
                      <Select
                        value={portion.termYears}
                        onChange={(e) => updatePortionNumber(portion.id, 'termYears', Number(e.target.value))}
                        size="md"
                      >
                        {TERM_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </Td>
                    <Td>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => removePortion(portion.id)}
                      >
                        Ta bort
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {portions.length > 0 && (
          <HStack justify="space-between">
            <Text fontWeight="bold">
              Totalt lånebelopp: {totalAmount.toLocaleString('sv-SE')} SEK
            </Text>
          </HStack>
        )}

        {portions.length === 0 && (
          <Text color="gray.500" textAlign="center" py={4}>
            Inga låneportioner tillagda än. Minst en låneportion krävs för att beräkna kostnader.
          </Text>
        )}
      </VStack>
    </Box>
  );
}