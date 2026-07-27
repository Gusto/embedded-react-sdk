import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { StateTaxesForm } from './StateTaxesForm'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'
import { GustoProvider } from '@/contexts'
import { createSdkQueryClient } from '@/contexts/ApiProvider/createSdkQueryClient'
import type { ButtonProps } from '@/components/Common/UI/Button/ButtonTypes'

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

  // Regression: effectiveFrom ("2022-01-01") must render as "January 1, 2022",
  // not "December 31, 2021". Forcing a US timezone reproduces the bug
  // regardless of the timezone the test happens to run in.
  describe('Effective date display in a timezone behind UTC', () => {
    const originalTz = process.env.TZ

    beforeEach(() => {
      process.env.TZ = 'America/Los_Angeles'
      setupApiTestMocks()
      render(
        <GustoTestProvider>
          <StateTaxesForm companyId="company-123" state="GA" onEvent={onEvent} />
        </GustoTestProvider>,
      )
    })

    afterEach(() => {
      process.env.TZ = originalTz
    })

    it('renders the effectiveFrom date without an off-by-one shift', async () => {
      const matches = await screen.findAllByText('Effective: January 1, 2022')
      expect(matches.length).toBeGreaterThan(0)
    })
  })

  // Regression: pressing Enter in a field must submit the form, not cancel it.
  // The bug only surfaces when the partner supplies a Button that renders a
  // native <button> (whose default type is "submit"): with the Cancel button
  // rendered first and missing type="button", the browser's implicit form
  // submission activates Cancel instead of submitting. This override reproduces
  // that partner setup; the SDK's built-in react-aria Button already forces
  // type="button" and would mask the regression.
  describe('Enter key submits with a native-button component override', () => {
    const onEvent = vi.fn()
    const user = userEvent.setup()

    const NativeButton = ({ children, onClick, type, isDisabled }: ButtonProps) => (
      <button type={type} onClick={onClick} disabled={isDisabled}>
        {children}
      </button>
    )

    beforeEach(() => {
      onEvent.mockReset()
      setupApiTestMocks()
      render(
        <GustoProvider
          config={{ baseUrl: API_BASE_URL }}
          queryClient={createSdkQueryClient()}
          components={{ Button: NativeButton }}
        >
          <StateTaxesForm companyId="company-123" state="GA" onEvent={onEvent} />
        </GustoProvider>,
      )
    })

    it('submits the form when Enter is pressed in a field instead of cancelling', async () => {
      const taxRateField = await screen.findByLabelText(/Tax Rate/i)
      await user.click(taxRateField)
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_UPDATED)
      })
      expect(onEvent).not.toHaveBeenCalledWith(componentEvents.CANCEL)
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

  // Regression: a state's plain (non-scheduling) GET response can return two requirement sets
  // sharing the same `key` — e.g. a currently-effective period and an already-scheduled future
  // period for "taxrates". Each rendered section must bind to its own form state, not share one.
  describe('State with two requirement sets sharing the same key', () => {
    beforeEach(() => {
      setupApiTestMocks()
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/tax_requirements/:state`, () =>
          HttpResponse.json({
            company_uuid: 'company-123',
            state: 'CA',
            requirement_sets: [
              {
                state: 'CA',
                key: 'taxrates',
                label: 'Tax Rates',
                effective_from: '2026-01-01',
                requirements: [
                  {
                    key: 'rate-uuid',
                    label: 'Unemployment tax rate',
                    value: '0.02',
                    editable: true,
                    metadata: {
                      type: 'tax_rate',
                      validation: { type: 'min_max', min: '0.015', max: '0.062' },
                    },
                  },
                ],
              },
              {
                state: 'CA',
                key: 'taxrates',
                label: 'Tax Rates',
                effective_from: '2026-04-01',
                requirements: [
                  {
                    key: 'rate-uuid',
                    label: 'Unemployment tax rate',
                    value: '0.02',
                    editable: true,
                    metadata: {
                      type: 'tax_rate',
                      validation: { type: 'min_max', min: '0.015', max: '0.062' },
                    },
                  },
                ],
              },
            ],
          }),
        ),
      )
      render(
        <GustoTestProvider>
          <StateTaxesForm companyId="company-123" state="CA" onEvent={onEvent} />
        </GustoTestProvider>,
      )
    })

    it('renders each set as an independent field, not a linked pair', async () => {
      const user = userEvent.setup()
      const fields = await screen.findAllByLabelText(/Unemployment tax rate/i)
      expect(fields).toHaveLength(2)
      const [januarySet, aprilSet] = fields

      await user.clear(januarySet!)
      await user.type(januarySet!, '3')
      await user.tab()

      expect(aprilSet).toHaveValue('2')
    })

    it('submits both sets with their own independently-edited values', async () => {
      const user = userEvent.setup()
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

      const [januarySet, aprilSet] = await screen.findAllByLabelText(/Unemployment tax rate/i)
      await user.clear(januarySet!)
      await user.type(januarySet!, '3')
      await user.tab()
      await user.clear(aprilSet!)
      await user.type(aprilSet!, '4')
      await user.tab()

      const submitButton = await screen.findByRole('button', { name: /Save/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_UPDATED)
      })

      const body = capturedBody as {
        requirement_sets: Array<{
          effective_from: string
          requirements: Array<{ key: string; value: string }>
        }>
      }
      expect(body.requirement_sets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            effective_from: '2026-01-01',
            requirements: [{ key: 'rate-uuid', value: '0.03' }],
          }),
          expect.objectContaining({
            effective_from: '2026-04-01',
            requirements: [{ key: 'rate-uuid', value: '0.04' }],
          }),
        ]),
      )
    })
  })
})
