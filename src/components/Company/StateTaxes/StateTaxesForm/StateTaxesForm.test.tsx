import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StateTaxesForm } from './StateTaxesForm'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', async () => {
  const actual = await vi.importActual('@/hooks/useContainerBreakpoints/useContainerBreakpoints')
  return {
    ...actual,
    default: () => ['base', 'small', 'medium'],
    useContainerBreakpoints: () => ['base', 'small', 'medium'],
  }
})

describe('StateTaxesForm', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    setupApiTestMocks()
  })

  describe('California State Tax Form', () => {
    it('renders state tax form', async () => {
      render(
        <GustoTestProvider>
          <StateTaxesForm companyId="company-123" state="GA" onEvent={onEvent} />
        </GustoTestProvider>,
      )
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
      })
    })

    it.skip('submits successfully with correct data', async () => {
      render(
        <GustoTestProvider>
          <StateTaxesForm companyId="company-123" state="GA" onEvent={onEvent} />
        </GustoTestProvider>,
      )
      // Wait for form fields to be available
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
      })

      // Fill in required fields
      const taxRateField = await screen.findByLabelText(/Tax Rate/i)
      await user.type(taxRateField, '0.05')

      const submitButton = await screen.findByRole('button', { name: /Save/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_UPDATED)
      })
    })

    it('fires cancel event when cancel button is clicked', async () => {
      render(
        <GustoTestProvider>
          <StateTaxesForm companyId="company-123" state="GA" onEvent={onEvent} />
        </GustoTestProvider>,
      )
      const cancelButton = await screen.findByRole('button', { name: /Cancel/i })

      await user.click(cancelButton)

      expect(onEvent).toHaveBeenCalledWith(componentEvents.CANCEL)
    })
  })

  describe('Washington State Tax Form', () => {
    it('renders all fields', async () => {
      render(
        <GustoTestProvider>
          <StateTaxesForm companyId="company-123" state="WA" onEvent={onEvent} />
        </GustoTestProvider>,
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Unified Business ID/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Unemployment Insurance Rate/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Hourly Rate/i)).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should not have accessibility violations - Georgia state tax form', async () => {
      const { container } = render(
        <GustoTestProvider>
          <StateTaxesForm companyId="company-123" state="GA" onEvent={onEvent} />
        </GustoTestProvider>,
      )
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
      })

      await runAxeAndLog(container, { isIntegrationTest: true }, 'Georgia state tax form')
    })

    it('should not have accessibility violations - Washington state tax form', async () => {
      const { container } = render(
        <GustoTestProvider>
          <StateTaxesForm companyId="company-123" state="WA" onEvent={onEvent} />
        </GustoTestProvider>,
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Unified Business ID/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Unemployment Insurance Rate/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Hourly Rate/i)).toBeInTheDocument()
      })

      await runAxeAndLog(container, { isIntegrationTest: true }, 'Washington state tax form')
    })

    it.skip('should not have accessibility violations after form interaction', async () => {
      const { container } = render(
        <GustoTestProvider>
          <StateTaxesForm companyId="company-123" state="GA" onEvent={onEvent} />
        </GustoTestProvider>,
      )
      // Wait for form fields to be available
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
      })

      // Initial check
      await runAxeAndLog(
        container,
        { isIntegrationTest: true },
        'Georgia state tax form - initial state',
      )

      // Fill in required fields
      const taxRateField = container.querySelector('input[id*="tax_rates"]')
      await user.type(taxRateField as HTMLElement, '0.05')

      // Check after interaction
      await runAxeAndLog(
        container,
        { isIntegrationTest: true },
        'Georgia state tax form - after interaction',
      )
    })
  })
})
