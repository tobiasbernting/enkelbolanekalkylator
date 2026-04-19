/* eslint-disable react-refresh/only-export-components */

import {
  Box,
  Button,
  Container,
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
} from '@chakra-ui/react'
import {
  Link,
  Navigate,
  Outlet,
  useRouterState,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { useEffect } from 'react'
import App from './App'
import { MortgageFormPage } from './components/MortgageFormPage'
import { SavedCalculationsPage } from './components/SavedCalculationsPage'
import { sanitizeSavedCalculationsStorage } from './utils/savedCalculationsStorage'

function RootLayout() {
  const location = useRouterState({
    select: (state) => state.location,
  })

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
            <Image src="/favicon.svg" alt="Enkel Bolånekalkylator" w="30px" h="30px" />
            <Text
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="black"
              color="gray.800"
              letterSpacing="tight"
            >
              Enkel Bolånekalkylator
            </Text>
          </HStack>

          <HStack spacing={1} ml={{ base: 3, md: 8 }} display={{ base: 'none', md: 'flex' }}>
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
                <MenuItem as={Link} to="/sparade-berakningar">
                  Sparade beräkningar
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </Container>
      </Box>

      <Container maxW="8xl" py={6}>
        <Outlet />
      </Container>
    </Box>
  )
}

function MortgageFlowLayout() {
  const location = useRouterState({
    select: (state) => state.location,
  })

  if (location.pathname === '/' && location.searchStr.length > 0) {
    return <Navigate href={`/resultat${location.searchStr}`} replace />
  }

  return <Outlet />
}

const rootRoute = createRootRoute({
  component: RootLayout,
})

const mortgageFlowRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'mortgage-flow',
  component: MortgageFlowLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => mortgageFlowRoute,
  path: '/',
  component: MortgageFormPage,
})

const resultsRoute = createRoute({
  getParentRoute: () => mortgageFlowRoute,
  path: '/resultat',
  component: App,
})

const savedCalculationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sparade-berakningar',
  component: SavedCalculationsPage,
})

const routeTree = rootRoute.addChildren([
  mortgageFlowRoute.addChildren([indexRoute, resultsRoute]),
  savedCalculationsRoute,
])

export const router = createRouter({
  routeTree,
  scrollRestoration: false,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
