import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkAddress } from './WorkAddress'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'

describe('WorkAddress (management block)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the card initially with the work-address title and Manage button', async () => {
    renderWithProviders(<WorkAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    expect(screen.getByText('Work address')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
  })

  it('transitions card → editWorkAddress when the Manage button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WorkAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Manage' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { level: 1, name: 'Work address' })).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED,
      { employeeId: 'employee-123' },
    )
  })

  it('returns to the card when the Back button is clicked from the edit screen', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WorkAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Back' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument()
    })

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_CANCELLED,
      undefined,
    )
  })
})
