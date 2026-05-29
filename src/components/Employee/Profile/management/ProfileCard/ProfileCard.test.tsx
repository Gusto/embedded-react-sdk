import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileCard } from './ProfileCard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'

describe('ProfileCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the basic-details title and Edit button once the employee loads', async () => {
    renderWithProviders(<ProfileCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.getByText('Basic details')).toBeInTheDocument()
  })

  it('fires EMPLOYEE_PROFILE_MANAGEMENT_EDIT_REQUESTED with { employeeId } when Edit is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProfileCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_PROFILE_MANAGEMENT_EDIT_REQUESTED,
      { employeeId: 'employee-123' },
    )
  })

  it('renders the localized success alert when successAlert code is provided', async () => {
    renderWithProviders(
      <ProfileCard employeeId="employee-123" onEvent={onEvent} successAlert="profileUpdated" />,
    )

    await waitFor(() => {
      expect(screen.getByText('Profile updated')).toBeInTheDocument()
    })
  })

  it('does not render the success alert when successAlert is null', async () => {
    renderWithProviders(
      <ProfileCard employeeId="employee-123" onEvent={onEvent} successAlert={null} />,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.queryByText('Profile updated')).toBeNull()
  })

  it('calls onDismissAlert when the user dismisses the success alert', async () => {
    const onDismissAlert = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <ProfileCard
        employeeId="employee-123"
        onEvent={onEvent}
        successAlert="profileUpdated"
        onDismissAlert={onDismissAlert}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('Profile updated')).toBeInTheDocument()
    })

    const dismiss = screen.getByRole('button', { name: 'Dismiss alert' })
    await user.click(dismiss)

    expect(onDismissAlert).toHaveBeenCalledTimes(1)
  })
})
