import {
  Box,
  Button,
  Container,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import {
  Link,
  Outlet,
  useRouterState,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { useEffect } from 'react'
import App from './App'
import { SaveCalculationDialog } from './components/SaveCalculationDialog'
import { SavedCalculationsPage } from './components/SavedCalculationsPage'
import { sanitizeSavedCalculationsStorage } from './utils/savedCalculationsStorage'

function SaveIcon() {
  return (
    <Icon viewBox="0 0 24 24" boxSize={5}>
      <path
        fill="currentColor"
        d="M5 3h12l4 4v14H3V3h2zm2 2v6h10V5H7zm0 10v4h10v-4H7zm2 1h6v2H9v-2z"
      />
    </Icon>
  )
}

function RootLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const location = useRouterState({
    select: (state) => state.location,
  })

  const isCalculatorRoute = location.pathname === '/'
  const isSavedRoute = location.pathname.startsWith('/sparade-berakningar')

  useEffect(() => {
    sanitizeSavedCalculationsStorage()
  }, [])

  return (
    <Box minH="100vh" bg="gray.50">
      <Box h="2px" bgGradient="linear(to-r, teal.400, blue.500, purple.500)" />

      <Box
        as="header"
        bg="white"
        borderBottomWidth={1}
        borderColor="gray.200"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="8xl" h="72px" display="flex" alignItems="center">
          <HStack spacing={3} minW="0">
            <Box
              w="30px"
              h="30px"
              borderRadius="md"
              bgGradient="linear(to-br, teal.400, blue.500)"
              boxShadow="inset 0 0 0 1px rgba(255,255,255,0.3)"
            />
            <Text
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="black"
              color="gray.800"
              letterSpacing="tight"
            >
              Enkel Bolån
            </Text>
          </HStack>

          <HStack spacing={1} ml={{ base: 3, md: 8 }} display={{ base: 'none', md: 'flex' }}>
            <Button
              as={Link}
              to="/"
              variant="ghost"
              size="md"
              color={isCalculatorRoute ? 'blue.700' : 'gray.700'}
              bg={isCalculatorRoute ? 'blue.50' : 'transparent'}
              _hover={{ bg: isCalculatorRoute ? 'blue.100' : 'gray.100' }}
            >
              Kalkylator
            </Button>
            <Button
              as={Link}
              to="/sparade-berakningar"
              variant="ghost"
              size="md"
              color={isSavedRoute ? 'blue.700' : 'gray.700'}
              bg={isSavedRoute ? 'blue.50' : 'transparent'}
              _hover={{ bg: isSavedRoute ? 'blue.100' : 'gray.100' }}
            >
              Sparade beräkningar
            </Button>
          </HStack>

          <Spacer />

          <Box display={{ base: 'block', md: 'none' }} mr={2}>
            <Menu>
              <MenuButton as={Button} variant="outline" size="sm">
                Meny
              </MenuButton>
              <MenuList>
                <MenuItem as={Link} to="/">
                  Kalkylator
                </MenuItem>
                <MenuItem as={Link} to="/sparade-berakningar">
                  Sparade beräkningar
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>

          <Tooltip label="Spara beräkning" hasArrow openDelay={120}>
            <IconButton
              aria-label="Spara beräkning"
              icon={<SaveIcon />}
              variant="outline"
              colorScheme="blue"
              onClick={onOpen}
              isDisabled={!isCalculatorRoute}
            />
          </Tooltip>
        </Container>
      </Box>

      <Container maxW="8xl" py={6}>
        <Outlet />
      </Container>

      <SaveCalculationDialog isOpen={isOpen} onClose={onClose} />
    </Box>
  )
}

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})

const savedCalculationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sparade-berakningar',
  component: SavedCalculationsPage,
})

const routeTree = rootRoute.addChildren([indexRoute, savedCalculationsRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
