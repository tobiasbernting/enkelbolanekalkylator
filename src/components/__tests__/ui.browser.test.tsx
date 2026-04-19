import { ChakraProvider } from '@chakra-ui/react'
import { page } from 'vitest/browser'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRoot, type Root } from 'react-dom/client'
import type { ReactElement } from 'react'
import { forwardRef } from 'react'
import { MortgageFormPage } from '../MortgageFormPage'
import App from '../../App'

vi.mock('@tanstack/react-router', () => {
  const Link = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }>(
    ({ children, to, ...props }, ref) => (
      <a ref={ref} href={typeof to === 'string' ? to : '#'} {...props}>
        {children}
      </a>
    )
  )

  Link.displayName = 'MockRouterLink'

  return {
    Link,
  }
})

let root: Root | null = null

function mount(ui: ReactElement, path = '/') {
  window.history.replaceState({}, '', path)
  document.body.innerHTML = '<div id="root"></div>'
  root = createRoot(document.getElementById('root')!)
  root.render(<ChakraProvider>{ui}</ChakraProvider>)
}

afterEach(() => {
  root?.unmount()
  root = null
})

describe('browser ui coverage', () => {
  it('updates form completeness state after user input', async () => {
    mount(<MortgageFormPage />, '/')

    await expect
      .element(page.getByText('Fyll i alla obligatoriska uppgifter (inklusive låneportion) för att gå vidare.'))
      .toBeInTheDocument()

    await page.getByLabelText('Månadsinkomst (SEK)').fill('45000')
    await page.getByRole('button', { name: 'Lägg till låneportion' }).click()

    await expect.element(page.getByText('Totalt lånebelopp:')).toBeInTheDocument()
    await expect
      .element(page.getByText('Fyll i alla obligatoriska uppgifter (inklusive låneportion) för att gå vidare.'))
      .not.toBeInTheDocument()
  })

  it('shows the guard state on result view when data is incomplete', async () => {
    mount(<App />, '/resultat?housePrice=2000000&downPayment=400000&monthlyIncome=0')
    await expect.element(page.getByText('Du kan inte visa resultat ännu')).toBeInTheDocument()
  })
})
