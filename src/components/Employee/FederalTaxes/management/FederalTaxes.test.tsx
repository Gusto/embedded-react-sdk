import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { FederalTaxes } from './FederalTaxes'
import {
  handleGetEmployeeFederalTaxes,
  handleUpdateEmployeeFederalTaxes,
} from '@/test/mocks/apis/employee_federal_taxes'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'

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

describe('FederalTaxes (management block)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      handleGetEmployeeFederalTaxes(() => HttpResponse.json(fixtureFederalTaxes)),
      handleUpdateEmployeeFederalTaxes(() => HttpResponse.json(fixtureFederalTaxes)),
    )
  })

  it('renders the card initially with the title and an Edit button', async () => {
    renderWithProviders(<FederalTaxes employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.getByText('Federal taxes')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Federal tax withholdings/i })).toBeNull()
  })

  it('transitions card → editFederalTaxes when Edit is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FederalTaxes employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Federal tax withholdings/i })).toBeInTheDocument()
    })

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_CARD_EDIT_REQUESTED,
      { employeeId: 'employee-123' },
    )
  })

  it('returns to the card when Cancel is clicked in the edit form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FederalTaxes employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Federal tax withholdings/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /^Cancel$/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })

    expect(screen.queryByRole('heading', { name: /Federal tax withholdings/i })).toBeNull()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_CANCELLED,
      undefined,
    )
  })

  it('returns to the card after a successful save and emits SUBMITTED', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FederalTaxes employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Save$/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /^Save$/i }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_SUBMITTED,
        expect.anything(),
      )
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })

    expect(screen.queryByRole('heading', { name: /Federal tax withholdings/i })).toBeNull()
  })
})
