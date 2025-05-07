import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StateTaxesForm } from './StateTaxesForm'
import { GustoTestApiProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'

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

  describe('California State Tax Form', () => {
    beforeEach(() => {
      setupApiTestMocks()
      render(
        <GustoTestApiProvider>
          <StateTaxesForm companyId="company-123" state="GA" onEvent={onEvent} />
        </GustoTestApiProvider>,
      )
    })

    it('renders state tax form', async () => {
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
      })
    })

    // it('fails to submit with empty form', async () => {
    //   const submitButton = await screen.findByRole('button', { name: /Save/i })
    //   await user.click(submitButton)

    //   // Check for validation errors
    //   const errorMessages = await screen.findAllByRole('alert')
    //   expect(errorMessages.length).toBeGreaterThan(0)
    //   expect(onEvent).not.toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_UPDATED)
    // })

    it('submits successfully with correct data', async () => {
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
      const cancelButton = await screen.findByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)

      expect(onEvent).toHaveBeenCalledWith(componentEvents.CANCEL)
    })
  })

  describe('Washington State Tax Form', () => {
    beforeEach(() => {
      setupApiTestMocks()
      render(
        <GustoTestApiProvider>
          <StateTaxesForm companyId="company-123" state="WA" onEvent={onEvent} />
        </GustoTestApiProvider>,
      )
    })

    it('renders registration fields', async () => {
      await waitFor(() => {
        expect(screen.getByLabelText(/Unified Business ID/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Participation Activation Code/i)).toBeInTheDocument()
      })
    })

    it('renders tax rate fields', async () => {
      await waitFor(() => {
        expect(screen.getByLabelText(/Unemployment Insurance Rate/i)).toBeInTheDocument()
      })
    })

    it('renders workers compensation rate fields', async () => {
      await waitFor(() => {
        expect(screen.getByLabelText(/Hourly Rate/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Employee Withholding/i)).toBeInTheDocument()
      })
    })
  })
})
