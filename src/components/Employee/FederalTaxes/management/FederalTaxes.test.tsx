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

describe('Employee.FederalTaxes (management)', () => {
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    mockOnEvent.mockClear()

    server.use(
      handleGetEmployeeFederalTaxes(() => HttpResponse.json(fixtureFederalTaxes)),
      handleUpdateEmployeeFederalTaxes(() => HttpResponse.json(fixtureFederalTaxes)),
    )
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

  it('renders Cancel and Save buttons (no Continue)', async () => {
    renderWithProviders(<FederalTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

    await screen.findByRole('heading', { name: /Federal tax withholdings/i })

    expect(screen.getByRole('button', { name: /^Cancel$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Save$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Continue/i })).not.toBeInTheDocument()
  })

  it('emits CANCEL event when the Cancel button is clicked without submitting', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FederalTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

    await screen.findByRole('heading', { name: /Federal tax withholdings/i })

    await user.click(screen.getByRole('button', { name: /^Cancel$/i }))

    expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.CANCEL)
    expect(mockOnEvent).not.toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED,
      expect.anything(),
    )
    expect(mockOnEvent).not.toHaveBeenCalledWith(componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE)
  })

  it('saves and shows a success alert without emitting DONE', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FederalTaxes employeeId="employee-1" onEvent={mockOnEvent} />)

    await screen.findByRole('heading', { name: /Federal tax withholdings/i })

    expect(screen.queryByText(/Successfully updated federal tax settings/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Save$/i }))

    await waitFor(() => {
      expect(mockOnEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED,
        expect.anything(),
      )
    })

    expect(mockOnEvent).not.toHaveBeenCalledWith(componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE)

    await waitFor(() => {
      expect(screen.getByText(/Successfully updated federal tax settings/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: /Federal tax withholdings/i })).toBeInTheDocument()
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

    await user.click(screen.getByRole('button', { name: /^Save$/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please select filing status/i)).toBeInTheDocument()
    })

    expect(screen.queryByText(/Successfully updated federal tax settings/i)).not.toBeInTheDocument()
    expect(mockOnEvent).not.toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED,
      expect.anything(),
    )
  })
})
