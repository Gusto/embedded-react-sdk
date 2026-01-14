import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ManagePayScheduleLanding } from './ManagePayScheduleLanding'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

describe('ManagePayScheduleLanding', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders pay schedule information', async () => {
    renderWithProviders(<ManagePayScheduleLanding companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Pay schedule')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument()
  })

  it('fires manage event when Manage button is clicked', async () => {
    renderWithProviders(<ManagePayScheduleLanding companyId="company-123" onEvent={onEvent} />)

    const manageButton = await screen.findByRole('button', { name: 'Manage' })
    await user.click(manageButton)

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.MANAGE_PAY_SCHEDULE_MANAGE,
      expect.objectContaining({ currentType: 'single' }),
    )
  })

  it('fires edit event when Edit button is clicked', async () => {
    renderWithProviders(<ManagePayScheduleLanding companyId="company-123" onEvent={onEvent} />)

    const editButton = await screen.findByRole('button', { name: 'Edit' })
    await user.click(editButton)

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.MANAGE_PAY_SCHEDULE_EDIT,
      expect.objectContaining({ payScheduleUuid: 'schedule-1' }),
    )
  })

  it('displays success alert when successAlert prop is provided', async () => {
    renderWithProviders(
      <ManagePayScheduleLanding
        companyId="company-123"
        onEvent={onEvent}
        successAlert={{ messageKey: 'assignmentsUpdated' }}
      />,
    )

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})
