import {
  Box,
  Button,
  VStack,
  HStack,
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
import { BANK_RATE_PRESETS, BankRateType, getRatesByType } from '../data/bankRates';

interface LoanPortionsPanelProps {
  portions: LoanPortion[];
  onPortionsChange: (portions: LoanPortion[]) => void;
  selectedBank: string;
  selectedRateType: BankRateType;
  onSelectedBankChange: (bankId: string) => void;
  onSelectedRateTypeChange: (rateType: BankRateType) => void;
  defaultInterestRate: number;
  defaultLoanTerm: number;
  amountToFinance: number;
}

const TERM_OPTIONS = [
  { label: '3 månader', value: 0.25 },
  { label: '1 år', value: 1 },
  { label: '2 år', value: 2 },
  { label: '3 år', value: 3 },
  { label: '4 år', value: 4 },
  { label: '5 år', value: 5 },
  { label: '7 år', value: 7 },
  { label: '8 år', value: 8 },
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
  defaultLoanTerm, 
  amountToFinance 
}: LoanPortionsPanelProps) {
  const selectedPreset = BANK_RATE_PRESETS.find((preset) => preset.id === selectedBank) ?? BANK_RATE_PRESETS[0];
  const activeRatesByTerm = getRatesByType(selectedPreset, selectedRateType);

  const updatePortionsWithRates = (ratesByTerm: Record<number, number>) => {
    const updatedPortions = portions.map((portion) => {
      const presetRate = ratesByTerm[portion.termYears];
      if (presetRate === undefined) {
        return portion;
      }

      return {
        ...portion,
        interestRate: presetRate,
      };
    });

    onPortionsChange(updatedPortions);
  };

  const addPortion = () => {
    const newPortion: LoanPortion = {
      id: `portion-${Date.now()}`,
      amountSeK: 0,
      termYears: 1,
      interestRate: 6, // Default to current global rate
    };
    onPortionsChange([...portions, newPortion]);
  };

  const removePortion = (id: string) => {
    onPortionsChange(portions.filter(p => p.id !== id));
  };

  const updatePortion = (id: string, field: keyof LoanPortion, value: number) => {
    const updated = portions.map((p) => {
      if (p.id !== id) {
        return p;
      }

      const updatedPortion = { ...p, [field]: value } as LoanPortion;

      if (field === 'termYears' && selectedPreset) {
        const rateForSelectedTerm = activeRatesByTerm[value];
        if (rateForSelectedTerm !== undefined) {
          updatedPortion.interestRate = rateForSelectedTerm;
        }
      }

      return updatedPortion;
    });
    onPortionsChange(updated);
  };

  const autoFillFromMainLoan = () => {
    if (amountToFinance > 0) {
      const newPortion: LoanPortion = {
        id: `portion-${Date.now()}`,
        amountSeK: amountToFinance,
        termYears: defaultLoanTerm,
        interestRate: defaultInterestRate,
      };
      onPortionsChange([newPortion]);
    }
  };

  const applyBankPreset = () => {
    const preset = selectedPreset;
    if (!preset) {
      return;
    }

    if (portions.length === 0) {
      const supportedTerms = TERM_OPTIONS.filter((option) => activeRatesByTerm[option.value] !== undefined);
      if (supportedTerms.length === 0) {
        return;
      }

      const roundedAmountToFinance = Math.max(0, Math.round(amountToFinance));
      const baseAmount = Math.floor(roundedAmountToFinance / supportedTerms.length);
      const remainder = roundedAmountToFinance - baseAmount * supportedTerms.length;

      const newPortions: LoanPortion[] = supportedTerms.map((option, index) => ({
        id: `portion-${Date.now()}-${index}`,
        amountSeK: baseAmount + (index === supportedTerms.length - 1 ? remainder : 0),
        termYears: option.value,
        interestRate: activeRatesByTerm[option.value],
      }));

      onPortionsChange(newPortions);
      return;
    }

    updatePortionsWithRates(activeRatesByTerm);
  };

  const handleRateTypeChange = (nextRateType: BankRateType) => {
    onSelectedRateTypeChange(nextRateType);
    const nextRatesByTerm = getRatesByType(selectedPreset, nextRateType);
    updatePortionsWithRates(nextRatesByTerm);
  };

  const totalAmount = portions.reduce((sum, p) => sum + p.amountSeK, 0);

  const portionsSumMismatch = Math.abs(totalAmount - amountToFinance) > 1;

  return (
    <Box
      p={6}
      borderWidth={2}
      borderRadius="xl"
      bgGradient="linear(to-br, blue.50, white)"
      boxShadow="xl"
      mt={2}
    >
      <VStack spacing={4} align="stretch">
        {portionsSumMismatch && (
          <Box bg="yellow.100" color="orange.800" p={3} borderRadius="md" fontWeight="bold">
            Summan av alla låneportioner ({totalAmount.toLocaleString('sv-SE')} SEK) matchar inte belopp att finansiera ({amountToFinance.toLocaleString('sv-SE')} SEK).
          </Box>
        )}
        <HStack justify="space-between" align="center">
          <Heading size="xl" color="blue.800">Låneportioner</Heading>
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={autoFillFromMainLoan}
            size="sm"
            fontWeight="bold"
          >
            Fyll i från huvudlån
          </Button>
        </HStack>

        <HStack spacing={3} align="end" flexWrap="wrap">
          <Box minW="220px">
            <Text fontSize="sm" color="gray.700" mb={1} fontWeight="medium">Välj bank</Text>
            <Select
              value={selectedBank}
              onChange={(e) => onSelectedBankChange(e.target.value)}
              size="sm"
              bg="white"
            >
              {BANK_RATE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </Box>
          <Box minW="200px">
            <Text fontSize="sm" color="gray.700" mb={1} fontWeight="medium">Räntetyp</Text>
            <Select
              value={selectedRateType}
              onChange={(e) => handleRateTypeChange(e.target.value as BankRateType)}
              size="sm"
              bg="white"
            >
              <option value="average">Snittränta</option>
              <option value="list">Listränta</option>
            </Select>
          </Box>
          <Button colorScheme="teal" variant="solid" onClick={applyBankPreset} size="sm" fontWeight="bold">
            Fyll räntor från bank
          </Button>
          <Text fontSize="xs" color="gray.500" alignSelf="center">
            {selectedPreset?.label} uppdaterad {selectedPreset?.updatedAt}
          </Text>
        </HStack>

        <Button
          colorScheme="blue"
          onClick={addPortion}
          size="md"
          fontWeight="bold"
          alignSelf="flex-start"
        >
          Lägg till låneportion
        </Button>

        {portions.length > 0 && (
          <Box maxH="360px" overflow="auto" borderWidth={1} borderColor="gray.200" borderRadius="md" bg="white">
            <Table size="sm" variant="simple">
              <Thead bg="gray.50" position="sticky" top={0} zIndex={1}>
                <Tr>
                  <Th minW="170px">Belopp (SEK)</Th>
                  <Th minW="140px">Ränta (%)</Th>
                  <Th minW="150px">Löptid</Th>
                  <Th minW="110px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {portions.map((portion) => (
                  <Tr key={portion.id}>
                    <Td>
                      <Input
                        type="number"
                        value={portion.amountSeK || ''}
                        onChange={(e) => updatePortion(portion.id, 'amountSeK', Number(e.target.value) || 0)}
                        placeholder="0"
                        size="md"
                      />
                    </Td>
                    <Td>
                      <Input
                        type="number"
                        value={portion.interestRate || ''}
                        onChange={(e) => updatePortion(portion.id, 'interestRate', Number(e.target.value) || 0)}
                        placeholder="6.0"
                        size="md"
                        step="0.1"
                      />
                    </Td>
                    <Td>
                      <Select
                        value={portion.termYears}
                        onChange={(e) => updatePortion(portion.id, 'termYears', Number(e.target.value))}
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
                        size="md"
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
            Inga låneportioner tillagda än. Klicka på "Lägg till låneportion" för att börja.
          </Text>
        )}
      </VStack>
    </Box>
  );
}