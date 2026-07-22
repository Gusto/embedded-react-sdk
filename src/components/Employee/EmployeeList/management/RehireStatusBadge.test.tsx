import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { RehireStatusBadge } from './RehireStatusBadge'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { handleGetEmployeeRehire } from '@/test/mocks/apis/employees'
import { formatDateToStringDate, addDays } from '@/helpers/dateFormatting'

describe('RehireStatusBadge', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('renders a rehire badge when the employee has an upcoming rehire', async () => {
    const futureDate = formatDateToStringDate(addDays(new Date(), 3))!

    server.use(
      handleGetEmployeeRehire(() =>
        HttpResponse.json({
          version: 'rehire-1',
          effective_date: futureDate,
          active: false,
          employee_uuid: 'employee-123',
        }),
      ),
    )

    renderWithProviders(
      <RehireStatusBadge employeeId="employee-123">
        {rehireDate => `Rehire ${rehireDate}`}
      </RehireStatusBadge>,
    )

    expect(await screen.findByText(/^Rehire /)).toBeInTheDocument()
  })

  it('renders nothing when the employee has no scheduled rehire', async () => {
    server.use(handleGetEmployeeRehire(() => new HttpResponse(null, { status: 204 })))

    renderWithProviders(
      <RehireStatusBadge employeeId="employee-123">
        {rehireDate => `Rehire ${rehireDate}`}
      </RehireStatusBadge>,
    )

    await waitFor(() => {
      expect(screen.queryByText(/^Rehire /)).not.toBeInTheDocument()
    })
  })

  it('renders nothing when the rehire has already gone into effect', async () => {
    const pastDate = formatDateToStringDate(addDays(new Date(), -3))!

    server.use(
      handleGetEmployeeRehire(() =>
        HttpResponse.json({
          version: 'rehire-1',
          effective_date: pastDate,
          active: true,
          employee_uuid: 'employee-123',
        }),
      ),
    )

    renderWithProviders(
      <RehireStatusBadge employeeId="employee-123">
        {rehireDate => `Rehire ${rehireDate}`}
      </RehireStatusBadge>,
    )

    await waitFor(() => {
      expect(screen.queryByText(/^Rehire /)).not.toBeInTheDocument()
    })
  })
})
