import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { StateTaxesForm } from './StateTaxesForm'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'

describe('StateTaxesForm', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()

  describe('Georgia State Tax Form', () => {
    beforeEach(() => {
      setupApiTestMocks()
      render(
        <GustoTestProvider>
          <StateTaxesForm companyId="company-123" state="GA" onEvent={onEvent} />
        </GustoTestProvider>,
      )
    })

    it('renders state tax form', async () => {
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
      })
    })

    it('displays tax rate as percentage (decimal 0.05 renders as 5)', async () => {
      const taxRateField = await screen.findByLabelText(/Tax Rate/i)
      expect(taxRateField).toHaveValue('5')
    })

    it('submits successfully with pre-populated percentage data', async () => {
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
      })

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
        <GustoTestProvider>
          <StateTaxesForm companyId="company-123" state="WA" onEvent={onEvent} />
        </GustoTestProvider>,
      )
    })

    it('renders registration fields', async () => {
      await waitFor(() => {
        expect(screen.getByLabelText(/Unified Business ID/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Participation Activation Code/i)).toBeInTheDocument()
      })
    })

    it('hides applicable_if-gated rate fields until the radio is toggled', async () => {
      const useDefaultRadioYes = await screen.findByRole('radio', { name: /^Yes$/ })
      expect(useDefaultRadioYes).toBeChecked()
      expect(screen.queryByLabelText(/Unemployment Insurance Rate/i)).toBeNull()

      const useDefaultRadioNo = screen.getByRole('radio', {
        name: /No, my agency gave me new rates/i,
      })
      await user.click(useDefaultRadioNo)

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

    it('submits successfully with empty optional fields without validation blocking', async () => {
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
      })

      const submitButton = await screen.findByRole('button', { name: /Save/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_UPDATED)
      })
    })

    it('does not render non-editable requirements', async () => {
      await waitFor(() => {
        expect(screen.getByLabelText(/Unified Business ID/i)).toBeInTheDocument()
      })
      expect(screen.queryByLabelText(/Legacy Read-Only Identifier/i)).toBeNull()
      expect(screen.queryByText(/Legacy Read-Only Identifier/i)).toBeNull()
    })

    it('omits non-editable requirements from the submit payload', async () => {
      let capturedBody: unknown = null
      server.use(
        http.put(
          `${API_BASE_URL}/v1/companies/:company_id/tax_requirements/:state`,
          async ({ request }) => {
            capturedBody = await request.json()
            return HttpResponse.json({})
          },
        ),
      )

      const submitButton = await screen.findByRole('button', { name: /Save/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_UPDATED)
      })

      const body = capturedBody as {
        requirement_sets: Array<{
          key: string
          requirements: Array<{ key: string; value: string }>
        }>
      }
      const submittedKeys = body.requirement_sets.flatMap(rs => rs.requirements.map(r => r.key))
      expect(submittedKeys).not.toContain('legacy_read_only_field')
    })

    it('submits workers compensation rate values entered by the user', async () => {
      let capturedBody: unknown = null
      server.use(
        http.put(
          `${API_BASE_URL}/v1/companies/:company_id/tax_requirements/:state`,
          async ({ request }) => {
            capturedBody = await request.json()
            return HttpResponse.json({})
          },
        ),
      )

      const hourlyRateInput = await screen.findByLabelText(/Hourly Rate/i)
      await user.type(hourlyRateInput, '5.25')

      const employeeWithholdingInput = await screen.findByLabelText(/Employee Withholding/i)
      await user.type(employeeWithholdingInput, '0.5')

      const submitButton = await screen.findByRole('button', { name: /Save/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_UPDATED)
      })

      const body = capturedBody as {
        requirement_sets: Array<{
          key: string
          requirements: Array<{ key: string; value: string }>
        }>
      }
      const wcSet = body.requirement_sets.find(rs => rs.key === 'workerscompensationrates')
      expect(wcSet).toBeDefined()
      expect(wcSet?.requirements).toEqual(
        expect.arrayContaining([
          { key: 'wa_wc_hourly_rate|010103', value: '5.25' },
          { key: 'wa_wc_employee_withholding|010103', value: '0.5' },
        ]),
      )
    })
  })
})
