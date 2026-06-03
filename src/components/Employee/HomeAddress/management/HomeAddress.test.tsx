import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomeAddress } from './HomeAddress'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'

describe('HomeAddress (management block)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the card initially with the title and Manage CTA', async () => {
    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    expect(screen.getByText('Home address')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Manage home address' })).toBeNull()
  })

  it('transitions card → editHomeAddress when Manage is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Manage' }))

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'Manage home address' })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_HOME_ADDRESS_MANAGEMENT_EDIT_REQUESTED,
      { employeeId: 'employee-123' },
    )
  })

  it('returns to the card when Back is clicked in the edit form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Manage' }))

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'Manage home address' })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('button', { name: 'Back' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument()
    })

    expect(screen.queryByRole('heading', { name: 'Manage home address' })).toBeNull()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_HOME_ADDRESS_MANAGEMENT_EDIT_CANCELLED,
      undefined,
    )
  })
})
