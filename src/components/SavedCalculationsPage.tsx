import {
  Box,
  Button,
  Heading,
  HStack,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { getSavedCalculations } from '../utils/savedCalculationsStorage'

function formatSavedDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return '-'
  }

  return parsed.toLocaleString('sv-SE')
}

export function SavedCalculationsPage() {
  const savedCalculations = useMemo(() => getSavedCalculations(), [])

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading as="h1" size="lg" mb={2}>
          Sparade berakningar
        </Heading>
        <Text color="gray.600">
          Dina sparade berakningar lagras lokalt i webblasaren.
        </Text>
      </Box>

      {savedCalculations.length === 0 ? (
        <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
          <Text color="gray.600">Inga sparade berakningar an.</Text>
        </Box>
      ) : (
        <VStack spacing={3} align="stretch">
          {savedCalculations.map((item) => (
            <Box key={item.id} bg="white" borderRadius="lg" boxShadow="md" p={4}>
              <VStack align="stretch" spacing={2}>
                <Heading as="h2" size="sm">
                  {item.name}
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Sparad: {formatSavedDate(item.createdAt)}
                </Text>
                <HStack spacing={3} flexWrap="wrap">
                  <Button as="a" href={item.calculationUrl} colorScheme="blue" size="sm">
                    Oppna berakning
                  </Button>
                  <Link href={item.calculationUrl} color="blue.600" fontSize="sm" isExternal>
                    Visa URL
                  </Link>
                </HStack>
              </VStack>
            </Box>
          ))}
        </VStack>
      )}
    </VStack>
  )
}