import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { FederalTaxesCard } from './FederalTaxesCard'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeFederalTaxes } from '@/test/mocks/apis/employee_federal_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const fixtureFederalTaxes = {
  version: 'federal-tax-version',
  filing_status: 'Single',
  extra_withholding: '25.00',
  two_jobs: true,
  dependents_amount: '500.00',
  other_income: '1000.00',
  deductions: '750.00',
  employee_id: 29,
  w4_data_type: 'rev_2020_w4',
}

describe('FederalTaxesCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(handleGetEmployeeFederalTaxes(() => HttpResponse.json(fixtureFederalTaxes)))
  })

  it('renders the card title, the federal-tax data, and an enabled Edit button once loaded', async () => {
    renderWithProviders(<FederalTaxesCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.getByText('Federal taxes')).toBeInTheDocument()
    expect(screen.getByText('Single')).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
  })

  it('renders empty placeholders when federal-tax fields are unset', async () => {
    server.use(
      handleGetEmployeeFederalTaxes(() =>
        HttpResponse.json({
          ...fixtureFederalTaxes,
          filing_status: null,
          two_jobs: null,
          dependents_amount: null,
          other_income: null,
          deductions: null,
          extra_withholding: null,
        }),
      ),
    )

    renderWithProviders(<FederalTaxesCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.getAllByLabelText('No value').length).toBeGreaterThan(0)
  })

  it('fires EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_CARD_EDIT_REQUESTED with { employeeId } when Edit is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FederalTaxesCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_CARD_EDIT_REQUESTED,
      { employeeId: 'employee-123' },
    )
  })
})
