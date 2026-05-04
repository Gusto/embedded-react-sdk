import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { FederalTaxes } from './FederalTaxes'
import { server } from '@/test/mocks/server'
import {
  handleGetEmployeeFederalTaxes,
  handleUpdateEmployeeFederalTaxes,
} from '@/test/mocks/apis/employee_federal_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const fixtureFederalTaxes = {
  version: 'federal-tax-version',
  filing_status: 'Single',
  extra_withholding: '0.0',
  two_jobs: false,
  dependents_amount: '0.0',
  other_income: '0.0',
  deductions: '0.0',
  employee_id: 29,
  w4_data_type: 'rev_2020_w4',
}

describe('Employee.FederalTaxes', () => {
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    mockOnEvent.mockClear()

    server.use(
      handleGetEmployeeFederalTaxes(() => HttpResponse.json(fixtureFederalTaxes)),
      handleUpdateEmployeeFederalTaxes(() => HttpResponse.json(fixtureFederalTaxes)),
    )
  })

  describe('rendering', () => {
    it('renders the page heading and the IRS calculator description', async () => {
      renderWithProviders(<FederalTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

      await screen.findByRole('heading', { name: /Federal tax withholdings/i })
      expect(screen.getByText(/IRS website/)).toBeInTheDocument()
    })

    it('renders the W-4 form fields', async () => {
      renderWithProviders(<FederalTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

      await screen.findByRole('heading', { name: /Federal tax withholdings/i })

      expect(screen.getByLabelText(/Federal filing status/i)).toBeInTheDocument()
      expect(screen.getByText(/Multiple jobs/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Dependents/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Other income/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Deductions/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Extra withholding/i)).toBeInTheDocument()
    })

    it('renders a Continue submit button', async () => {
      renderWithProviders(<FederalTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

      await screen.findByRole('button', { name: /Continue/i })
    })

    it('prefills filing status from API data', async () => {
      server.use(
        handleGetEmployeeFederalTaxes(() =>
          HttpResponse.json({ ...fixtureFederalTaxes, filing_status: 'Married' }),
        ),
      )

      renderWithProviders(<FederalTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Married/i, expanded: false })).toBeInTheDocument()
      })
    })
  })

  describe('submission', () => {
    it('fires updated and done events with the API response when the form is submitted', async () => {
      const user = userEvent.setup()
      let capturedRequestBody: Record<string, unknown> | null = null

      server.use(
        handleUpdateEmployeeFederalTaxes(async ({ request }) => {
          capturedRequestBody = (await request.json()) as Record<string, unknown>
          return HttpResponse.json(fixtureFederalTaxes)
        }),
      )

      renderWithProviders(<FederalTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

      await screen.findByRole('heading', { name: /Federal tax withholdings/i })

      await user.click(screen.getByLabelText(/Federal filing status/i))
      await user.click(screen.getByRole('option', { name: 'Single' }))

      await user.click(screen.getByRole('button', { name: /Continue/i }))

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED,
          expect.anything(),
        )
        expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE)
      })

      expect(capturedRequestBody).toMatchObject({
        filing_status: 'Single',
        two_jobs: false,
        dependents_amount: 0,
        other_income: 0,
        deductions: 0,
        extra_withholding: 0,
        w4_data_type: 'rev_2020_w4',
        version: 'federal-tax-version',
      })
    })

    it('does not submit and surfaces a required error when filing status is empty', async () => {
      server.use(
        handleGetEmployeeFederalTaxes(() =>
          HttpResponse.json({ ...fixtureFederalTaxes, filing_status: null }),
        ),
      )

      const user = userEvent.setup()
      renderWithProviders(<FederalTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

      await screen.findByRole('heading', { name: /Federal tax withholdings/i })

      await user.click(screen.getByRole('button', { name: /Continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/Please select filing status/i)).toBeInTheDocument()
      })

      expect(mockOnEvent).not.toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED,
        expect.anything(),
      )
      expect(mockOnEvent).not.toHaveBeenCalledWith(componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE)
    })
  })
})
