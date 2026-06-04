import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { WorkAddressCard } from './WorkAddressCard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'

describe('WorkAddressCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the active work address and an enabled Manage button once the data loads', async () => {
    renderWithProviders(<WorkAddressCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    expect(screen.getByText('Work address')).toBeInTheDocument()
    expect(screen.getByText(/2216 Icie Villages, Apt\. 798/)).toBeInTheDocument()
    expect(screen.getByText(/Big Delta, AK 99737/)).toBeInTheDocument()
  })

  it('shows the empty-state copy when no active work address is on file', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, () =>
        HttpResponse.json([]),
      ),
    )

    renderWithProviders(<WorkAddressCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    expect(screen.getByText('No work address on file')).toBeInTheDocument()
  })

  it('fires EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED with { employeeId } when Manage is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WorkAddressCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Manage' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED,
      { employeeId: 'employee-123' },
    )
  })
})
