import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Container maxW="4xl" py={20}>
      <VStack gap={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={2}>
            Enkel Bolånekalkylator
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Built with Vite, React, and Chakra UI
          </Text>
        </Box>

        <Box bg="blue.50" p={6} borderRadius="lg" borderLeft="4px" borderLeftColor="blue.500">
          <Heading as="h2" size="md" mb={4}>
            Welcome!
          </Heading>
          <Text mb={4}>
            This is your mortgage calculator application. Click the button below to get started.
          </Text>
          <HStack gap={4}>
            <Button
              colorScheme="blue"
              size="lg"
              onClick={() => setCount((count) => count + 1)}
            >
              Count: {count}
            </Button>
            <Button
              variant="outline"
              colorScheme="gray"
            >
              Learn More
            </Button>
          </HStack>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">
            💡 Edit <code>src/App.tsx</code> and save to test HMR
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}

export default App
